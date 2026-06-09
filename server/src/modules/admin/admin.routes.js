const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats',                    adminController.getStats);
router.get('/activity',                 adminController.getRecentActivity);
router.get('/users',                    adminController.getAllUsers);
router.put('/users/:id/status',         adminController.updateUserStatus);
router.get('/jobs/pending',             adminController.getPendingJobs);
router.put('/jobs/:id/approve',         adminController.approveJob);
router.put('/jobs/:id/reject',          adminController.rejectJob);
router.get('/events/pending',           adminController.getPendingEvents);
router.put('/events/:id/approve',       adminController.approveEvent);
router.put('/events/:id/reject',        adminController.rejectEvent);

module.exports = router;