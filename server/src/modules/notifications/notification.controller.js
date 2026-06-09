const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');

const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getMyNotifications(
      req.user._id, page, limit
    );
    res.status(200).json(new ApiResponse(200, result, 'Notifications fetched'));
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(
      req.user._id, req.params.id
    );
    res.status(200).json(new ApiResponse(200, result, 'Marked as read'));
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      req.user._id, req.params.id
    );
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Unread count fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};