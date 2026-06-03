const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ───────────────────────────────────────
// helmet sets security-related HTTP headers automatically
app.use(helmet());

// CORS: only allow requests from our React frontend
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // allow cookies to be sent cross-origin
}));

// ─── Request Parsing Middleware ────────────────────────────────
app.use(express.json({ limit: '10kb' }));           // parse JSON bodies
app.use(express.urlencoded({ extended: true }));    // parse form data
app.use(cookieParser());                            // parse cookies

// ─── Logging Middleware ────────────────────────────────────────
// morgan logs every request: method, path, status, response time
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Health Check Route ────────────────────────────────────────
// Used to verify the server is running (also wakes up Render free tier)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────
// Must be last middleware — Express identifies it by its 4 parameters
app.use(errorHandler);

module.exports = app;