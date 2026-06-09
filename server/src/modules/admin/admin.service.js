const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Connection = require('../../models/Connection');
const Job = require('../../models/Job');
const Event = require('../../models/Event');
const Message = require('../../models/Message');
const ApiError = require('../../utils/ApiError');

// ─── Platform Stats ────────────────────────────────────────────
const getStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalAlumni,
    totalMentors,
    totalConnections,
    totalJobs,
    totalEvents,
    totalMessages,
    pendingJobs,
    pendingEvents,
    newUsersThisMonth,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'alumni', isActive: true }),
    User.countDocuments({ role: 'mentor', isActive: true }),
    Connection.countDocuments({ status: 'accepted' }),
    Job.countDocuments({ isApproved: true }),
    Event.countDocuments({ isApproved: true }),
    Message.countDocuments(),
    Job.countDocuments({ isApproved: false, isActive: true }),
    Event.countDocuments({ isApproved: false }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)), // first day of current month
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      alumni: totalAlumni,
      mentors: totalMentors,
      newThisMonth: newUsersThisMonth,
    },
    platform: {
      totalConnections,
      totalJobs,
      totalEvents,
      totalMessages,
    },
    pending: {
      jobs: pendingJobs,
      events: pendingEvents,
    },
  };
};

// ─── Get All Users ─────────────────────────────────────────────
const getAllUsers = async ({ role, search, page = 1, limit = 15 }) => {
  const query = { role: { $ne: 'admin' } };

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Update User Status ────────────────────────────────────────
const updateUserStatus = async (targetUserId, action) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot modify admin');

  if (action === 'activate')   user.isActive = true;
  if (action === 'deactivate') user.isActive = false;

  await user.save({ validateBeforeSave: false });
  return user;
};

// ─── Get Pending Jobs ──────────────────────────────────────────
const getPendingJobs = async () => {
  return await Job.find({ isApproved: false, isActive: true })
    .populate('postedBy', 'name avatar role')
    .sort({ createdAt: -1 });
};

// ─── Approve Job ───────────────────────────────────────────────
const approveJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  job.isApproved = true;
  await job.save();
  return job;
};

// ─── Reject Job ────────────────────────────────────────────────
const rejectJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  job.isActive = false;
  await job.save();
  return job;
};

// ─── Get Pending Events ────────────────────────────────────────
const getPendingEvents = async () => {
  return await Event.find({ isApproved: false })
    .populate('organizer', 'name avatar role')
    .sort({ createdAt: -1 });
};

// ─── Approve Event ─────────────────────────────────────────────
const approveEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  event.isApproved = true;
  await event.save();
  return event;
};

// ─── Reject Event ──────────────────────────────────────────────
const rejectEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  await event.deleteOne();
  return { message: 'Event rejected and removed' };
};

// ─── Get Recent Activity ───────────────────────────────────────
const getRecentActivity = async () => {
  const recentUsers = await User.find()
    .select('name email role createdAt avatar')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentJobs = await Job.find({ isApproved: true })
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentEvents = await Event.find({ isApproved: true })
    .populate('organizer', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  return { recentUsers, recentJobs, recentEvents };
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserStatus,
  getPendingJobs,
  approveJob,
  rejectJob,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getRecentActivity,
};