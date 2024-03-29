const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el == this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  changePasswordAt: Date,
  passwordResetToken:String,
  passwordResetExpires:Date,

});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 15);
  //Gereksiz yer kaplamasına engel oldum
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save',function(next){
  if (!this.isModified('password') ||this.isNew) return next();
  // token oluşturma işleminden önce gelebiliyor -1000 bu nedenle yazdım.
  this.changePasswordAt = new Date() - 1000;
  next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(userPassword,candidatePassword);
};

userSchema.methods.changedPasswordAfter = function(JWTtimesiat) {
  if (this.changePasswordAt) {
    const changedTimestamp = parseInt(this.changePasswordAt.getTime() / 1000, 10);
    return JWTtimesiat < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
 this.passwordResetToken= crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

 this.passwordResetExpires = Date.now() + 10*60*1000;

 return resetToken
}


const User = mongoose.model('User', userSchema) || mongoose.models.User;

module.exports = User;
