import logger from '../utils/logger.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Custom error transformations for production
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') {
      error.message = `Invalid ${error.path}: ${error.value}.`;
      error.statusCode = 400;
      error.isOperational = true;
    }
    if (error.code === 11000) {
      const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
      error.message = `Duplicate field value: ${value}. Please use another value!`;
      error.statusCode = 400;
      error.isOperational = true;
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      error.message = `Invalid input data. ${errors.join('. ')}`;
      error.statusCode = 400;
      error.isOperational = true;
    }
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token. Please log in again!';
      error.statusCode = 401;
      error.isOperational = true;
    }
    if (error.name === 'TokenExpiredError') {
      error.message = 'Your token has expired! Please log in again.';
      error.statusCode = 401;
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};
