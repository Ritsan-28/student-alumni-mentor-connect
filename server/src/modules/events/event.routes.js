const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.use(authenticate);

router.get('/',         eventController.getEvents);
router.get('/my',       eventController.getMyEvents);
router.get('/:id',      eventController.getEventById);
router.post('/',        authorize('alumni', 'mentor', 'admin'), eventController.createEvent);
router.put('/:id',      authorize('alumni', 'mentor', 'admin'), eventController.updateEvent);
router.delete('/:id',   authorize('alumni', 'mentor', 'admin'), eventController.deleteEvent);
router.post('/:id/register', eventController.registerInterest);

module.exports = router;