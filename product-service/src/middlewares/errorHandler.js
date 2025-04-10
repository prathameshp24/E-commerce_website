class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
  };
  
  const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } else {
      let error = { ...err };
      error.message = err.message;
  
      if (err.name === 'ValidationError') error = handleValidationError(error);
  
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message || 'Something went wrong!'
      });
    }
  };
  
  module.exports = {
    AppError,
    globalErrorHandler
  };