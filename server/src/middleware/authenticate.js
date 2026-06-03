const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Middleware: verifies the JWT access token on every protected request
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Header format: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Access token required'));
    }

    const token = authHeader.split(' ')[1];

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find user in database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Account is deactivated'));
    }

    // Attach user to request object for use in controllers
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token'));
    }
    next(error);
  }
};

module.exports = authenticate;