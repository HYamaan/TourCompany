
const express = require('express');
const morgan = require('morgan')
const app = express();

const tourRouter=require('./routes/tourRoutes.js');
const userRouter=require('./routes/useRoutes.js');

if(process.env.NODE_ENV==='development'){
    console.log("APP:USE:MORGAN");
    app.use(morgan('dev'));
}


app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime =new Date().toDateString();
    next();
})



app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
module.exports=app;
