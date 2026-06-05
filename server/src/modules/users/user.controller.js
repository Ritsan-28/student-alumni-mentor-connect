const { validationResult } = require('express-validator');
const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

// ─── GET /api/users/me ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const result = await userService.getMyProfile(req.user._id);
    res.status(200).json(
      new ApiResponse(200, result, 'Profile fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/me ─────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg);
      return next(new ApiError(400, messages[0], errors.array()));
    }

    const result = await userService.updateMyProfile(req.user._id, req.body);
    res.status(200).json(
      new ApiResponse(200, result, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/me/photo ───────────────────────────────────
const updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload an image file'));
    }

    // Cloudinary URL is in req.file.path after multer-storage-cloudinary
    const avatarUrl = req.file.path;
    const user = await userService.updateProfilePhoto(req.user._id, avatarUrl);

    res.status(200).json(
      new ApiResponse(200, { user }, 'Profile photo updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id ────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.user._id, req.params.id);
    res.status(200).json(
      new ApiResponse(200, result, 'User profile fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users ────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, skill, search, page, limit } = req.query;
    const result = await userService.getUsers({
      role, skill, search, page, limit,
    });
    res.status(200).json(
      new ApiResponse(200, result, 'Users fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, updatePhoto, getUserById, getUsers };