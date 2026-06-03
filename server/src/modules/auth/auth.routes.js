const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('./auth.validation');
const { authLimiter } = require('../../middleware/rateLimiter');

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

// Public auth routes
router.post('/register',        registerValidation,       authController.register);
router.post('/verify-email',    verifyEmailValidation,    authController.verifyEmail);
router.post('/login',           loginValidation,          authController.login);
router.post('/refresh',                                   authController.refreshToken);
router.post('/logout',                                    authController.logout);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password',  resetPasswordValidation,  authController.resetPassword);

module.exports = router;