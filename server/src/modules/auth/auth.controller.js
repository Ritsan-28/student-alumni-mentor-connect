const { validationResult } = require('express-validator');
const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { setRefreshTokenCookie } = require('../../utils/generateToken');

// Helper: check validation errors from express-validator
const handleValidationErrors = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages[0], errors.array()));
  }
  return null;
};

// ─── Register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, next)) return;

    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });

    res.status(201).json(new ApiResponse(201, result, result.message));
  } catch (error) {
    next(error);
  }
};

// ─── Verify Email ──────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, next)) return;

    const { email, otp } = req.body;
    const result = await authService.verifyEmail({ email, otp });

    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, next)) return;

    const { email, password } = req.body;
    const { userData, accessToken, refreshToken } =
      await authService.loginUser({ email, password });

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(
      new ApiResponse(200, { user: userData, accessToken }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ─────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    // Read refresh token from httpOnly cookie
    const { refreshToken } = req.cookies;
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(new ApiResponse(200, result, 'Token refreshed'));
  } catch (error) {
    next(error);
  }
};

// ─── Logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ───────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, next)) return;

    const { email } = req.body;
    const result = await authService.forgotPassword({ email });

    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, next)) return;

    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ email, otp, newPassword });

    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};