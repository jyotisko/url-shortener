const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log(`💥 UNPREDICTED PRODUCTION ERROR`, err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
      err: err
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};