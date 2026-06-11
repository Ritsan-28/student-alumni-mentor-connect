const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.use(authenticate);

router.get('/student', authorize('student'), dashboardController.getStudentDashboard);
router.get('/alumni',  authorize('alumni'),  dashboardController.getAlumniDashboard);
router.get('/mentor',  authorize('mentor'),  dashboardController.getMentorDashboard);

module.exports = router;