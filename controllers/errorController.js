const AppError = require('./../utils/appError.js');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
const handleDublicateFieldsDB = (err) => {

  const value = err.keyValue.email;
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 404);
};
const handleValidationErrorDb=(err)=>{
  const errors = Object.values(err.errors).map(el=>el.message)
  const message =`Invalid input data. ${errors.join('. ')}`;
  return new AppError(message,400);
}
const handleJWTError = err=>{
 return new AppError('Invalid token. Please log in again!',401);
}
const handleTokenExpiredError=err=>{
  return new AppError('Your token has expired. Please login again!',401);
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const senErrorProd = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //Programing or other unknown error: don't leak error details
  else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDublicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDb(error);
    if(error.name==="JsonWebTokenError") error=handleJWTError(error);
    if(err.name==="TokenExpiredError") error=handleTokenExpiredError(error);
    senErrorProd(error, res);
  }

};