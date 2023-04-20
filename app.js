
const express = require('express');
const morgan = require('morgan')

const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const tourRouter=require('./routes/tourRoutes.js');
const userRouter=require('./routes/useRoutes.js');
const app = express();

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
}
// const error = new Error("An error message")
// console.log(error.stack)

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime =new Date().toDateString();
    next();
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});

app.use(globalErrorHandler);

module.exports=app;
