const User = require('../models/userModel');

const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
 exports.getAllUsers = catchAsync(async (req, res) => {
   const getAllTours = await User.find()
   res.status(200).json({
     status: 'success',
     results: getAllTours.length,
     data: {
       tours: getAllTours
     }
   });
 });
 exports.getUser =catchAsync(async (req, res) => {
   //console.log(req.params.id);
   const getOneUser= await User.findById(req.params.id)
   res.status(200).json({
     status: 'success',
     data: getOneUser
   })
 })
 exports.createUser = catchAsync(async (req, res,next) => {
   const newUser = await User.create(req.body);
   res.status(201).json({
     status: 'success',
     data: {
       tour: newUser
     }
   });
 })
 exports.updateUser =catchAsync(async (req, res,next) => {
   const updateUser= await User.findByIdAndUpdate(req.params.id,req.body,{
     new:true,
     runValidators: true
   });

   if(!updateUser){
     return next(new AppError('No user found with that ID',404));
   }

   res.status(200).json({
     status: 'success',
     data: {
       updateUser
     }
   });
 })
 exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};