const jobService = require('./job.service');
const ApiResponse = require('../../utils/ApiResponse');

const createJob = async (req, res, next) => {
  try {
    const result = await jobService.createJob(
      req.user._id, req.user.role, req.body
    );
    res.status(201).json(new ApiResponse(201, result, 'Job posted successfully'));
  } catch (error) { next(error); }
};

const getJobs = async (req, res, next) => {
  try {
    const { type, search, page, limit } = req.query;
    const result = await jobService.getJobs({ type, search, page, limit });
    res.status(200).json(new ApiResponse(200, result, 'Jobs fetched'));
  } catch (error) { next(error); }
};

const getJobById = async (req, res, next) => {
  try {
    const result = await jobService.getJobById(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Job fetched'));
  } catch (error) { next(error); }
};

const updateJob = async (req, res, next) => {
  try {
    const result = await jobService.updateJob(
      req.user._id, req.user.role, req.params.id, req.body
    );
    res.status(200).json(new ApiResponse(200, result, 'Job updated'));
  } catch (error) { next(error); }
};

const deleteJob = async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(
      req.user._id, req.user.role, req.params.id
    );
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const toggleSaveJob = async (req, res, next) => {
  try {
    const result = await jobService.toggleSaveJob(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const result = await jobService.getSavedJobs(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Saved jobs fetched'));
  } catch (error) { next(error); }
};

const getMyJobs = async (req, res, next) => {
  try {
    const result = await jobService.getMyJobs(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'My jobs fetched'));
  } catch (error) { next(error); }
};

const getPendingJobs = async (req, res, next) => {
  try {
    const result = await jobService.getPendingJobs();
    res.status(200).json(new ApiResponse(200, result, 'Pending jobs fetched'));
  } catch (error) { next(error); }
};

const approveJob = async (req, res, next) => {
  try {
    const result = await jobService.approveJob(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Job approved'));
  } catch (error) { next(error); }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  getSavedJobs,
  getMyJobs,
  getPendingJobs,
  approveJob,
};