const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');

/**
 * Controller for OpenAI-related endpoints
 */
const openaiController = {
  /**
   * Handle streaming completion request
   */
  streamCompletion: async (req, res, next) => {
    try {
      // Validate request
      const { messages, model, temperature, max_tokens } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: {
            message: 'Messages are required and must be a non-empty array',
            type: 'validation_error',
          },
        });
      }

      // Extract user ID from authentication or generate a unique one
      const userId = req.user?.id || req.ip;
      
      // Process the streaming request
      await openaiService.generateStreamingCompletion({
        messages,
        model,
        temperature,
        max_tokens,
        userId,
      }, res);
      
      // Note: The response is handled in the service
    } catch (error) {
      // Pass error to error handler
      next(error);
    }
  },

  /**
   * Handle standard (non-streaming) completion request
   */
  completion: async (req, res, next) => {
    try {
      // Validate request
      const { messages, model, temperature, max_tokens } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: {
            message: 'Messages are required and must be a non-empty array',
            type: 'validation_error',
          },
        });
      }

      // Extract user ID from authentication or generate a unique one
      const userId = req.user?.id || req.ip;
      
      // Process the request
      const response = await openaiService.generateCompletion({
        messages,
        model,
        temperature,
        max_tokens,
        userId,
      });
      
      // Return the response
      return res.json({
        id: response.id,
        model: response.model,
        object: response.object,
        created: response.created,
        choices: response.choices,
        usage: response.usage,
      });
    } catch (error) {
      // Pass error to error handler
      next(error);
    }
  },
};

module.exports = openaiController;