const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authenticate = require('../../middleware/authenticate');

router.use(authenticate);

router.get('/',           notificationController.getMyNotifications);
router.get('/unread',     notificationController.getUnreadCount);
router.put('/read-all',   notificationController.markAllAsRead);
router.put('/:id/read',   notificationController.markAsRead);
router.delete('/:id',     notificationController.deleteNotification);

module.exports = router;