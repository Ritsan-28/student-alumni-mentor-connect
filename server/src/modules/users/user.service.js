const User = require('../../models/User');
const Profile = require('../../models/Profile');
const ApiError = require('../../utils/ApiError');

// ─── Get or Create Profile ─────────────────────────────────────
// Every user gets a profile document when they first access it
const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = await Profile.create({ user: userId });
  }
  return profile;
};

// ─── Get My Full Profile ───────────────────────────────────────
const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  const profile = await getOrCreateProfile(userId);

  return { user, profile };
};

// ─── Update My Profile ─────────────────────────────────────────
const updateMyProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  // Fields that can be updated on the User model
  const userFields = ['name'];
  const userUpdates = {};

  userFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      userUpdates[field] = updateData[field];
    }
  });

  // Update User document if there are user-level changes
  if (Object.keys(userUpdates).length > 0) {
    Object.assign(user, userUpdates);
    await user.save({ validateBeforeSave: false });
  }

  // Update Profile document with the rest
  const profile = await getOrCreateProfile(userId);

  // List of all updatable profile fields
  const profileFields = [
    'bio', 'location', 'phone', 'skills', 'education',
    'socialLinks', 'interests', 'careerGoal', 'expectedGraduationYear',
    'graduationYear', 'currentCompany', 'currentPosition', 'industry',
    'experience', 'expertise', 'yearsOfExperience', 'availability',
    'sessionType', 'languages',
  ];

  profileFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      profile[field] = updateData[field];
    }
  });

  await profile.save();

  return { user: await User.findById(userId).select('-password'), profile };
};

// ─── Update Profile Photo ──────────────────────────────────────
const updateProfilePhoto = async (userId, avatarUrl) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  ).select('-password');

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// ─── Get Any User Profile (Public View) ───────────────────────
const getUserById = async (requesterId, targetUserId) => {
  const user = await User.findById(targetUserId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  if (!user.isActive) throw new ApiError(404, 'User not found');

  const profile = await getOrCreateProfile(targetUserId);

  return { user, profile };
};

// ─── Get Users List (with filters) ────────────────────────────
const getUsers = async ({ role, skill, search, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;

  // Build user query
  const userQuery = { isActive: true, isVerified: true };
  if (role) userQuery.role = role;

  // Search by name
  if (search) {
    userQuery.name = { $regex: search, $options: 'i' };
  }

  const users = await User.find(userQuery)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const userIds = users.map((u) => u._id);

  // Build profile query
  const profileQuery = { user: { $in: userIds } };
  if (skill) {
    profileQuery.$or = [
      { skills: { $in: [new RegExp(skill, 'i')] } },
      { expertise: { $in: [new RegExp(skill, 'i')] } },
    ];
  }

  const profiles = await Profile.find(profileQuery);

  // Merge user + profile data
  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.user.toString()] = p;
  });

  const results = users
    .filter((u) => !skill || profileMap[u._id.toString()])
    .map((u) => ({
      user: u,
      profile: profileMap[u._id.toString()] || null,
    }));

  const total = await User.countDocuments(userQuery);

  return {
    results,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  getUserById,
  getUsers,
};