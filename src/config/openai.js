const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default configuration for OpenAI requests
const defaultConfig = {
  model: process.env.DEFAULT_MODEL || 'gpt-4-turbo-preview',
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 60000,
};

// Validate OpenAI configuration on startup
const validateConfig = () => {
  if (!process.env.OPENAI_API_KEY) {
    logger.error('OPENAI_API_KEY is not set in environment variables');
    throw new Error('OpenAI API key is required');
  }
  
  logger.info('OpenAI configuration validated successfully');
  return true;
};

module.exports = {
  openai,
  defaultConfig,
  validateConfig,
};