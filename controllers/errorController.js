const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api/v1')) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  return res.status(err.statusCode || 500).render('error', {
    title: 'Error',
    message: err.message
  });
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {

    if (req.originalUrl.startsWith('/api/v1')) {
      return res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message
      });
    }

    return res.status(err.statusCode || 500).render('error', {
      title: 'Error',
      message: err.message
    });

  } else {
    console.log(`💥 UNPREDICTED PRODUCTION ERROR`, err);

    if (req.originalUrl.startsWith('/api/v1')) {
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong.',
        err: err
      });
    }

    return res.status(err.statusCode || 500).render('error', {
      title: 'Error',
      message: err.message
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);
  }
};