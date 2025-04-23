const express = require('express');
const rateLimit = require('express-rate-limit');
const openaiController = require('../controllers/openaiController');

const router = express.Router();

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message: 'Too many requests, please try again later',
      type: 'rate_limit_error',
    },
  },
});

// Apply rate limiter to all API routes
router.use(apiLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenAI streaming completion endpoint
router.post('/completions/stream', openaiController.streamCompletion);

// OpenAI standard completion endpoint
router.post('/completions', openaiController.completion);

// Catch-all for undefined routes
router.all('*', (req, res) => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      type: 'not_found',
    },
  });
});

module.exports = router;