const serverless = require('serverless-http');
const app = require('./app');
const logger = require('./utils/logger');

// Configure serverless handler
const handler = serverless(app, {
  binary: ['application/octet-stream'],
});

// Wrapper to ensure proper error handling
module.exports.handler = async (event, context) => {
  // Log incoming Lambda event (without sensitive data)
  logger.debug('Lambda invocation', {
    path: event.path,
    httpMethod: event.httpMethod,
    requestId: context.awsRequestId,
  });

  try {
    // Process the request through the Express app
    const result = await handler(event, context);
    return result;
  } catch (error) {
    // Log any errors that occur
    logger.error('Lambda execution error', {
      error: error.message,
      stack: error.stack,
      requestId: context.awsRequestId,
    });

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          message: 'Internal server error',
          type: 'server_error',
          requestId: context.awsRequestId,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};