const ApiError = require('../utils/ApiError');

// Middleware factory: checks if logged-in user has the required role
// Usage: authorize('admin') or authorize('mentor', 'alumni')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to access this route`
        )
      );
    }
    next();
  };
};

module.exports = authorize;