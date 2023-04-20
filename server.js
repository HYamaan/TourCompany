const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('rejectionHandled',err=>{
  server.close(()=>{
    console.log(`UNCAUGHT EXCEPTION! 💥 Shutting down...`);
    process.exit(1);
  })
})

const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => {
  console.log('DB connection successful!');
});


const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App runnig on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
