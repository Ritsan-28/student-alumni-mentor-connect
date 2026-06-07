const eventService = require('./event.service');
const ApiResponse = require('../../utils/ApiResponse');

const createEvent = async (req, res, next) => {
  try {
    const result = await eventService.createEvent(
      req.user._id, req.user.role, req.body
    );
    res.status(201).json(new ApiResponse(201, result, 'Event created successfully'));
  } catch (error) { next(error); }
};

const getEvents = async (req, res, next) => {
  try {
    const { type, status, search, page, limit } = req.query;
    const result = await eventService.getEvents({ type, status, search, page, limit });
    res.status(200).json(new ApiResponse(200, result, 'Events fetched'));
  } catch (error) { next(error); }
};

const getEventById = async (req, res, next) => {
  try {
    const result = await eventService.getEventById(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Event fetched'));
  } catch (error) { next(error); }
};

const updateEvent = async (req, res, next) => {
  try {
    const result = await eventService.updateEvent(
      req.user._id, req.user.role, req.params.id, req.body
    );
    res.status(200).json(new ApiResponse(200, result, 'Event updated'));
  } catch (error) { next(error); }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result = await eventService.deleteEvent(
      req.user._id, req.user.role, req.params.id
    );
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const registerInterest = async (req, res, next) => {
  try {
    const result = await eventService.registerInterest(req.user._id, req.params.id);
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) { next(error); }
};

const getMyEvents = async (req, res, next) => {
  try {
    const result = await eventService.getMyEvents(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'My events fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerInterest,
  getMyEvents,
};