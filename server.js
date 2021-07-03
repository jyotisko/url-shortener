require('dotenv').config({
  path: require('path').join(`${__dirname}`, 'config.env')
});

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful!')).catch(err => console.log(err))

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
