const Event = require('../../models/Event');
const ApiError = require('../../utils/ApiError');

// ─── Create Event ──────────────────────────────────────────────
const createEvent = async (userId, role, data) => {
  // Admins get auto-approved
  const isApproved = role === 'admin';

  const event = await Event.create({
    ...data,
    organizer: userId,
    isApproved,
  });

  return event;
};

// ─── Get All Events ────────────────────────────────────────────
const getEvents = async ({ type, status, search, page = 1, limit = 10 }) => {
  const query = { isApproved: true };

  if (type)   query.type   = type;
  if (status) query.status = status;
  if (search) query.title  = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;

  const events = await Event.find(query)
    .populate('organizer', 'name avatar role')
    .sort({ date: 1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Event.countDocuments(query);

  return {
    events,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get Event By ID ───────────────────────────────────────────
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate('organizer', 'name avatar role')
    .populate('attendees', 'name avatar role');

  if (!event) throw new ApiError(404, 'Event not found');
  return event;
};

// ─── Update Event ──────────────────────────────────────────────
const updateEvent = async (userId, role, eventId, data) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this event');
  }

  Object.assign(event, data);
  await event.save();
  return event;
};

// ─── Delete Event ──────────────────────────────────────────────
const deleteEvent = async (userId, role, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this event');
  }

  await event.deleteOne();
  return { message: 'Event deleted successfully' };
};

// ─── Register Interest ─────────────────────────────────────────
const registerInterest = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const alreadyRegistered = event.attendees.some(
    (a) => a.toString() === userId.toString()
  );

  if (alreadyRegistered) {
    // Unregister
    event.attendees = event.attendees.filter(
      (a) => a.toString() !== userId.toString()
    );
    await event.save();
    return { registered: false, message: 'Unregistered from event' };
  }

  if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
    throw new ApiError(400, 'Event is full');
  }

  event.attendees.push(userId);
  await event.save();
  return { registered: true, message: 'Registered for event' };
};

// ─── Get My Events ─────────────────────────────────────────────
const getMyEvents = async (userId) => {
  const organized = await Event.find({ organizer: userId })
    .sort({ date: 1 });

  const attending = await Event.find({ attendees: userId, isApproved: true })
    .populate('organizer', 'name avatar role')
    .sort({ date: 1 });

  return { organized, attending };
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