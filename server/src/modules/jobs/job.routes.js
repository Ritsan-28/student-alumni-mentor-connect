const express = require('express');
const router = express.Router();
const jobController = require('./job.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.use(authenticate);

router.get('/',                 jobController.getJobs);
router.get('/saved',            jobController.getSavedJobs);
router.get('/my',               jobController.getMyJobs);
router.get('/pending',          authorize('admin'), jobController.getPendingJobs);
router.get('/:id',              jobController.getJobById);
router.post('/',                authorize('alumni', 'mentor', 'admin'), jobController.createJob);
router.put('/:id',              authorize('alumni', 'mentor', 'admin'), jobController.updateJob);
router.delete('/:id',           authorize('alumni', 'mentor', 'admin'), jobController.deleteJob);
router.post('/:id/save',        jobController.toggleSaveJob);
router.put('/:id/approve',      authorize('admin'), jobController.approveJob);

module.exports = router;