const { openai, defaultConfig } = require('../config/openai');
const logger = require('../utils/logger');

/**
 * Service to handle OpenAI API interactions
 */
class OpenAIService {
  /**
   * Generate a streaming response from OpenAI
   * @param {Object} options - Request options
   * @param {Object} res - Express response object for streaming
   */
  async generateStreamingCompletion(options, res) {
    try {
      const config = {
        model: options.model || defaultConfig.model,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens,
        stream: true,
        user: options.userId,
      };

      logger.debug('Starting OpenAI streaming request', { 
        model: config.model,
        userId: options.userId,
      });

      // Setup headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const stream = await openai.chat.completions.create(config);

      // Stream the response chunks
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Signal the end of the stream
      res.write('data: [DONE]\n\n');
      res.end();
      
      logger.debug('Completed OpenAI streaming request');
    } catch (error) {
      logger.error('Error in OpenAI streaming request', { 
        error: error.message,
        errorObject: error,
      });
      
      // If headers were already sent, we need to end the response with an error
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      } else {
        // Otherwise throw the error to be caught by error handler
        throw error;
      }
    }
  }

  /**
   * Generate a non-streaming response from OpenAI
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - OpenAI response
   */
  async generateCompletion(options) {
    try {
      const config = {
        model: options.model || defaultConfig.model,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens,
        stream: false,
        user: options.userId,
      };

      logger.debug('Starting OpenAI non-streaming request', { 
        model: config.model,
        userId: options.userId,
      });

      const response = await openai.chat.completions.create(config);
      
      logger.debug('Completed OpenAI non-streaming request', {
        model: config.model,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      });
      
      return response;
    } catch (error) {
      logger.error('Error in OpenAI non-streaming request', { 
        error: error.message,
        errorObject: error,
      });
      throw error;
    }
  }
}

module.exports = new OpenAIService();