const logger = require('../utils/logger');

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // OpenAI specific errors
  if (err.name === 'OpenAIError' || err.name === 'APIError') {
    return res.status(err.status || 500).json({
      error: {
        message: err.message,
        type: err.type || 'openai_error',
        code: err.code,
      },
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: err.message,
        type: 'validation_error',
        details: err.details,
      },
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message,
      type: err.type || 'server_error',
    },
  });
};

module.exports = errorHandler;