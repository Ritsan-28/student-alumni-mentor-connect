const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Request Parsing Middleware ────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging Middleware ────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
const authRoutes           = require('./modules/auth/auth.routes');
const userRoutes           = require('./modules/users/user.routes');
const mentorRoutes         = require('./modules/users/mentor.routes');
const dashboardRoutes      = require('./modules/users/dashboard.routes');
const connectionRoutes     = require('./modules/connections/connection.routes');
const messageRoutes        = require('./modules/messaging/message.routes');
const eventRoutes          = require('./modules/events/event.routes');
const jobRoutes            = require('./modules/jobs/job.routes');
const notificationRoutes   = require('./modules/notifications/notification.routes');
const adminRoutes          = require('./modules/admin/admin.routes');

app.use('/api/auth',           authRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/mentors',        mentorRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/connections',    connectionRoutes);
app.use('/api/conversations',  messageRoutes);
app.use('/api/events',         eventRoutes);
app.use('/api/jobs',           jobRoutes);
app.use('/api/notifications',  notificationRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;