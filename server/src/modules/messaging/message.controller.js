const messageService = require('./message.service');
const notificationService = require('../notifications/notification.service');
const Conversation = require('../../models/Conversation');
const ApiResponse = require('../../utils/ApiResponse');

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const result = await messageService.getOrCreateConversation(
      req.user._id, targetId
    );
    res.status(200).json(new ApiResponse(200, result, 'Conversation ready'));
  } catch (error) { next(error); }
};

const getMyConversations = async (req, res, next) => {
  try {
    const result = await messageService.getMyConversations(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Conversations fetched'));
  } catch (error) { next(error); }
};

const getMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await messageService.getMessages(
      req.user._id, req.params.id, page, limit
    );
    res.status(200).json(new ApiResponse(200, result, 'Messages fetched'));
  } catch (error) { next(error); }
};

const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const result = await messageService.sendMessage(
      req.user._id, req.params.id, content
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${req.params.id}`).emit('new_message', result);
    }

    // Notify the other participant
    const conversation = await Conversation.findById(req.params.id);
    if (conversation) {
      const receiverId = conversation.participants.find(
        (p) => p.toString() !== req.user._id.toString()
      );

      if (receiverId) {
        await notificationService.createNotification({
          recipientId: receiverId,
          senderId: req.user._id,
          type: 'new_message',
          title: 'New Message',
          message: `${req.user.name} sent you a message`,
          link: `/messages/${req.params.id}`,
          io,
        });
      }
    }

    res.status(201).json(new ApiResponse(201, result, 'Message sent'));
  } catch (error) { next(error); }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};