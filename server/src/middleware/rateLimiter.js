const rateLimit = require('express-rate-limit');

// Strict limiter for auth routes (login, register)
// Prevents brute force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 10,                   // max 10 attempts per window
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for all other API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 100,                  // max 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };