const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Middleware to log requests and assign request IDs
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Log request details
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log response when finished
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      type: 'response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
    });
  });

  next();
};

module.exports = requestLogger;