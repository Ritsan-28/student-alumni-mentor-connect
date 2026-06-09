const adminService = require('./admin.service');
const ApiResponse = require('../../utils/ApiResponse');

const getStats = async (req, res, next) => {
  try {
    const result = await adminService.getStats();
    res.status(200).json(new ApiResponse(200, result, 'Stats fetched'));
  } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await adminService.getAllUsers({ role, search, page, limit });
    res.status(200).json(new ApiResponse(200, result, 'Users fetched'));
  } catch (error) { next(error); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { action } = req.body;
    const result = await adminService.updateUserStatus(req.params.id, action);
    res.status(200).json(new ApiResponse(200, result, `User ${action}d successfully`));
  } catch (error) { next(error); }
};

const getPendingJobs = async (req, res, next) => {
  try {
    const result = await adminService.getPendingJobs();
    res.status(200).json(new ApiResponse(200, result, 'Pending jobs fetched'));
  } catch (error) { next(error); }
};

const approveJob = async (req, res, next) => {
  try {
    const result = await adminService.approveJob(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Job approved'));
  } catch (error) { next(error); }
};

const rejectJob = async (req, res, next) => {
  try {
    const result = await adminService.rejectJob(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Job rejected'));
  } catch (error) { next(error); }
};

const getPendingEvents = async (req, res, next) => {
  try {
    const result = await adminService.getPendingEvents();
    res.status(200).json(new ApiResponse(200, result, 'Pending events fetched'));
  } catch (error) { next(error); }
};

const approveEvent = async (req, res, next) => {
  try {
    const result = await adminService.approveEvent(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Event approved'));
  } catch (error) { next(error); }
};

const rejectEvent = async (req, res, next) => {
  try {
    const result = await adminService.rejectEvent(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Event rejected'));
  } catch (error) { next(error); }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const result = await adminService.getRecentActivity();
    res.status(200).json(new ApiResponse(200, result, 'Activity fetched'));
  } catch (error) { next(error); }
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