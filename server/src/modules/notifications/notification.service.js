const Notification = require('../../models/Notification');

// ─── Create Notification ───────────────────────────────────────
const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  link = '',
  io = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type,
      title,
      message,
      link,
    });

    // Emit real-time notification via Socket.io
    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', {
        _id: notification._id,
        type,
        title,
        message,
        link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

// ─── Get My Notifications ──────────────────────────────────────
const getMyNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  const total = await Notification.countDocuments({ recipient: userId });

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Mark One as Read ──────────────────────────────────────────
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

// ─── Mark All as Read ─────────────────────────────────────────
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { message: 'All notifications marked as read' };
};

// ─── Delete Notification ───────────────────────────────────────
const deleteNotification = async (userId, notificationId) => {
  await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  return { message: 'Notification deleted' };
};

// ─── Get Unread Count ──────────────────────────────────────────
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  return { count };
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};