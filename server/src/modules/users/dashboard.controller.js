const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/ApiResponse');

const getStudentDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getStudentDashboard(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Dashboard fetched'));
  } catch (error) { next(error); }
};

const getAlumniDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getAlumniDashboard(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Dashboard fetched'));
  } catch (error) { next(error); }
};

const getMentorDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getMentorDashboard(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Dashboard fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  getStudentDashboard,
  getAlumniDashboard,
  getMentorDashboard,
};