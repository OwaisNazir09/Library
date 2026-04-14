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
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

export default (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  if (error.name === 'CastError') {
    error.message = `Invalid ${error.path}: ${error.value}.`;
    error.statusCode = 400;
    error.isOperational = true;
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    const val = error.keyValue ? Object.values(error.keyValue)[0] : 'unknown';
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${val}' already exists. Please use another value!`;
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

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: err.stack
    });
  } else {
    sendErrorProd(error, res);
  }
};
