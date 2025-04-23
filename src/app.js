const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { validateConfig } = require('./config/openai');
const apiRoutes = require('./routes/api');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Validate configuration
try {
  validateConfig();
} catch (error) {
  logger.error('Configuration validation failed', { error: error.message });
  process.exit(1);
}

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};

// Apply middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Apply routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OpenAI Streaming API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      streaming: '/api/completions/stream',
      standard: '/api/completions',
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Export the app
module.exports = app;