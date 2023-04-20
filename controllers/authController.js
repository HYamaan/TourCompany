
const User=require('./../models/userModel.js');

const catchAsync = require('./../utils/catchAsync.js');
const signToken = require('./signToken');
const AppError=require('./../utils/appError');
const sendEmail=require('./../utils/email');

const jwt = require('jsonwebtoken');
const fs=require('fs');
const crypto = require('crypto');
const {promisify} = require('util');

 exports.signup=catchAsync(async (req,res,next)=>{

   const {name,email,password,passwordConfirm}=req.body
   const newUser = await User.create({name,email,password,passwordConfirm});

   const token =  signToken(newUser,req.originalUrl);
   res.status(201).json({
     status:'success',
     token,
     data:{
       user:newUser
     }
   })
 });

 exports.login=catchAsync(async (req,res,next)=>{
   const {email,password}=req.body;

   if(!email || !password){
     return next(new AppError('Please provide email and password!',400));
   };
   const user = await User.findOne({email:email}).select('+password');

   const matchPassword = await user.correctPassword(password,user.password);

   if(!user || !matchPassword){
     return next(new AppError('Incorrect email or password',404));
   }
  const token = signToken(user,req.originalUrl);
   console.log("token",token);
   res.status(201).json({
     status:'success',
     token
   })
 });

 exports.protect=catchAsync(async (req,res,next)=>{

   const readFile=promisify(fs.readFile);
   const publicKey = await readFile(`./key/public.key`);
   let token;
   if(
     req.headers.authorization &&
     req.headers.authorization.startsWith('Bearer')
   ){
     token=req.headers.authorization.split(' ')[1]
   }
   if(!token){
     return next( new AppError('You are not logged in! Please log in to get access.',401));
   }
   const decoded = await promisify(jwt.verify)(token,publicKey)
   console.log(decoded);
   const freshUser = await User.findById(decoded.id);
   if(!freshUser){
     return next(new AppError('The user belonging to this token does no longer exist.',401));
   }
   if(freshUser.changedPasswordAfter(decoded.iat)){
     console.log("FreshUser True");
     return next(new AppError('User recently changed password! Please log in again.',401));
   }

   req.user = freshUser
   next();

 });

 exports.restrictTo = (...roles)=>{
   //rolles ['admin','lead-guide']
   return (req,res,next)=>{
     console.log("role",req.user.role);
     if(!roles.includes(req.user.role)){
       console.log("error");
       return next(new AppError('You do not have permission to perform this action',403))
     };
     next();
   }
 }


 exports.forgetPassword = catchAsync(async (req,res,next)=>{
   const readFile=promisify(fs.readFile);
   const privateKey = await readFile(`./key/private.key`);
   //POST EMAİL
   const user = await User.findOne({email:req.body.email});
   if(!user){
     return next(new AppError('There is no user with email address',404));
   }
   //PASSWORD RESET Token

   const resetToken = user.createPasswordResetToken();
   await user.save({validateBeforeSave:false});

   //Send user's email
   const resetURL = `${req.protocol}://${req.get(
     'host'
   )}/api/v1/users/resetPassword/${resetToken}`;

   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

   try {
     await sendEmail({
       email: user.email,
       subject: 'Your password reset token (valid for 10 min)',
       message
     });

     res.status(200).json({
       status: 'success',
       message: 'Token sent to email!'
     });
   } catch (err) {
     user.passwordResetToken = undefined;
     user.passwordResetExpires = undefined;
     await user.save({ validateBeforeSave: false });

     return next(
       new AppError('There was an error sending the email. Try again later!'),
       500
     );
   }

 })
 exports.resetPassword = (req,res,next)=>{
   //Get base token
   const hashedToken = crypto.createHash('sha256').update(req.params.token);
   //if is user set new password
   //updatechangePasswordAt
   //Log user,sent JWT
 }
