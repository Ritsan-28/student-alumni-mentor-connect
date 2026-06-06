const connectionService = require('./connection.service');
const ApiResponse = require('../../utils/ApiResponse');

const sendRequest = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const result = await connectionService.sendRequest(req.user._id, { receiverId, message });
    res.status(201).json(new ApiResponse(201, result, 'Connection request sent'));
  } catch (error) { next(error); }
};

const acceptRequest = async (req, res, next) => {
  try {
    const result = await connectionService.acceptRequest(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Connection accepted'));
  } catch (error) { next(error); }
};

const declineRequest = async (req, res, next) => {
  try {
    const result = await connectionService.declineRequest(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Connection declined'));
  } catch (error) { next(error); }
};

const removeConnection = async (req, res, next) => {
  try {
    const result = await connectionService.removeConnection(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Connection removed'));
  } catch (error) { next(error); }
};

const getMyConnections = async (req, res, next) => {
  try {
    const result = await connectionService.getMyConnections(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Connections fetched'));
  } catch (error) { next(error); }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const result = await connectionService.getPendingRequests(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Pending requests fetched'));
  } catch (error) { next(error); }
};

const getConnectionStatus = async (req, res, next) => {
  try {
    const result = await connectionService.getConnectionStatus(req.user._id, req.params.targetId);
    res.status(200).json(new ApiResponse(200, result, 'Status fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  sendRequest,
  acceptRequest,
  declineRequest,
  removeConnection,
  getMyConnections,
  getPendingRequests,
  getConnectionStatus,
};