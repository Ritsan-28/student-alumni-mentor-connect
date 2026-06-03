const crypto = require('crypto');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const sendEmail = require('../../config/email');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../utils/generateToken');

// ─── Generate 6-digit OTP ──────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Email Templates ───────────────────────────────────────────
const getVerificationEmailHTML = (name, otp) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Mentor Connect</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0;">Your professional network awaits</p>
    </div>
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin: 0 0 16px;">Hello, ${name}! 👋</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        Welcome to Mentor Connect. Please verify your email address to activate your account.
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Your verification code</p>
        <h1 style="color: #2563eb; font-size: 48px; letter-spacing: 8px; margin: 0; font-weight: 700;">
          ${otp}
        </h1>
        <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Expires in 10 minutes</p>
      </div>
      <p style="color: #9ca3af; font-size: 13px; text-align: center;">
        If you didn't create an account, please ignore this email.
      </p>
    </div>
  </div>
`;

const getPasswordResetEmailHTML = (name, otp) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Mentor Connect</h1>
    </div>
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin: 0 0 16px;">Password Reset Request</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        Hi ${name}, we received a request to reset your password. Use this OTP:
      </p>
      <div style="background: #fef3c7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="color: #92400e; margin: 0 0 8px; font-size: 14px;">Password Reset Code</p>
        <h1 style="color: #d97706; font-size: 48px; letter-spacing: 8px; margin: 0; font-weight: 700;">
          ${otp}
        </h1>
        <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Expires in 10 minutes</p>
      </div>
      <p style="color: #9ca3af; font-size: 13px; text-align: center;">
        If you didn't request this, please secure your account immediately.
      </p>
    </div>
  </div>
`;

// ─── Register User ─────────────────────────────────────────────
const registerUser = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  // Generate OTP and set expiry (10 minutes from now)
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Create user (password hashed automatically via pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationOTP: otp,
    verificationOTPExpires: otpExpires,
  });

  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify Your Mentor Connect Account',
    html: getVerificationEmailHTML(name, otp),
  });

  return {
    message: 'Registration successful. Please check your email for the verification code.',
    email: user.email,
  };
};

// ─── Verify Email ──────────────────────────────────────────────
const verifyEmail = async ({ email, otp }) => {
  // Get user with OTP fields (normally excluded by select: false)
  const user = await User.findOne({ email })
    .select('+verificationOTP +verificationOTPExpires');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  if (!user.verificationOTP || user.verificationOTP !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (user.verificationOTPExpires < new Date()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  // Mark as verified and clear OTP fields
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  return { message: 'Email verified successfully. You can now login.' };
};

// ─── Login User ────────────────────────────────────────────────
const loginUser = async ({ email, password }) => {
  // Get user with password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Same error for wrong email or wrong password
    // (don't reveal which field is wrong — security best practice)
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw new ApiError(401, 'Please verify your email before logging in');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact support.');
  }

  // Compare entered password with hashed password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update last seen
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Return user data (without password)
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
  };

  return { userData, accessToken, refreshToken };
};

// ─── Refresh Access Token ──────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  const jwt = require('jsonwebtoken');

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token not found');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    return { accessToken: newAccessToken };

  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

// ─── Forgot Password ───────────────────────────────────────────
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  // Always return success even if email not found
  // (prevents email enumeration attacks)
  if (!user) {
    return {
      message: 'If that email exists, a reset code has been sent.',
    };
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.passwordResetOTP = otp;
  user.passwordResetOTPExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: 'Reset Your Mentor Connect Password',
    html: getPasswordResetEmailHTML(user.name, otp),
  });

  return { message: 'If that email exists, a reset code has been sent.' };
};

// ─── Reset Password ────────────────────────────────────────────
const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email })
    .select('+passwordResetOTP +passwordResetOTPExpires');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (user.passwordResetOTPExpires < new Date()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  return { message: 'Password reset successful. You can now login.' };
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};