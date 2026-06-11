const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Connection = require('../../models/Connection');
const Message = require('../../models/Message');
const Event = require('../../models/Event');
const Job = require('../../models/Job');
const Notification = require('../../models/Notification');

// ─── Student Dashboard ─────────────────────────────────────────
const getStudentDashboard = async (userId) => {
  const [
    connectionsCount,
    pendingCount,
    unreadMessages,
    unreadNotifications,
    suggestedMentors,
    upcomingEvents,
    recentJobs,
    profile,
  ] = await Promise.all([
    Connection.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }),
    Connection.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'pending',
    }),
    Message.countDocuments({ sender: { $ne: userId }, isRead: false }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    // Suggest mentors not yet connected
    User.find({ role: 'mentor', isActive: true, isVerified: true, _id: { $ne: userId } })
      .select('name avatar')
      .limit(3),
    Event.find({
      isApproved: true,
      date: { $gte: new Date() },
    })
      .populate('organizer', 'name avatar')
      .sort({ date: 1 })
      .limit(3),
    Job.find({ isApproved: true, isActive: true })
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(3),
    Profile.findOne({ user: userId }),
  ]);

  // Get profiles for suggested mentors
  const mentorIds = suggestedMentors.map((m) => m._id);
  const mentorProfiles = await Profile.find({ user: { $in: mentorIds } });
  const profileMap = {};
  mentorProfiles.forEach((p) => { profileMap[p.user.toString()] = p; });

  const mentorsWithProfiles = suggestedMentors.map((m) => ({
    user: m,
    profile: profileMap[m._id.toString()] || null,
  }));

  return {
    stats: {
      connections: connectionsCount,
      pending: pendingCount,
      unreadMessages,
      unreadNotifications,
      profileCompleteness: profile?.profileCompleteness || 0,
    },
    suggestedMentors: mentorsWithProfiles,
    upcomingEvents,
    recentJobs,
  };
};

// ─── Alumni Dashboard ──────────────────────────────────────────
const getAlumniDashboard = async (userId) => {
  const [
    connectionsCount,
    unreadMessages,
    unreadNotifications,
    myJobs,
    myEvents,
    upcomingEvents,
    recentConnections,
  ] = await Promise.all([
    Connection.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }),
    Message.countDocuments({ sender: { $ne: userId }, isRead: false }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    Job.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .limit(3),
    Event.find({ organizer: userId })
      .sort({ date: 1 })
      .limit(3),
    Event.find({ isApproved: true, date: { $gte: new Date() } })
      .populate('organizer', 'name avatar')
      .sort({ date: 1 })
      .limit(3),
    Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  const connections = recentConnections.map((conn) => {
    const other =
      conn.sender._id.toString() === userId.toString()
        ? conn.receiver
        : conn.sender;
    return { connectionId: conn._id, user: other };
  });

  return {
    stats: {
      connections: connectionsCount,
      jobsPosted: myJobs.length,
      eventsCreated: myEvents.length,
      unreadMessages,
      unreadNotifications,
    },
    myJobs,
    myEvents,
    upcomingEvents,
    recentConnections: connections,
  };
};

// ─── Mentor Dashboard ──────────────────────────────────────────
const getMentorDashboard = async (userId) => {
  const [
    connectionsCount,
    pendingRequests,
    unreadMessages,
    unreadNotifications,
    myEvents,
    upcomingEvents,
    recentMentees,
  ] = await Promise.all([
    Connection.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }),
    Connection.countDocuments({
      receiver: userId,
      status: 'pending',
    }),
    Message.countDocuments({ sender: { $ne: userId }, isRead: false }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    Event.find({ organizer: userId })
      .sort({ date: 1 })
      .limit(3),
    Event.find({ isApproved: true, date: { $gte: new Date() } })
      .populate('organizer', 'name avatar')
      .sort({ date: 1 })
      .limit(3),
    Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  const mentees = recentMentees.map((conn) => {
    const other =
      conn.sender._id.toString() === userId.toString()
        ? conn.receiver
        : conn.sender;
    return { connectionId: conn._id, user: other };
  });

  return {
    stats: {
      totalMentees: connectionsCount,
      pendingRequests,
      unreadMessages,
      unreadNotifications,
      eventsCreated: myEvents.length,
    },
    pendingRequests,
    myEvents,
    upcomingEvents,
    recentMentees: mentees,
  };
};

module.exports = {
  getStudentDashboard,
  getAlumniDashboard,
  getMentorDashboard,
};