const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const Connection = require('../../models/Connection');
const ApiError = require('../../utils/ApiError');

// ─── Check if two users are connected ─────────────────────────
const areConnected = async (userA, userB) => {
  const connection = await Connection.findOne({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA },
    ],
    status: 'accepted',
  });
  return !!connection;
};

// ─── Get or Create Conversation ───────────────────────────────
const getOrCreateConversation = async (userId, targetId) => {
  if (userId.toString() === targetId.toString()) {
    throw new ApiError(400, 'Cannot message yourself');
  }

  const connected = await areConnected(userId, targetId);
  if (!connected) {
    throw new ApiError(403, 'You must be connected to message this user');
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, targetId] },
  }).populate('participants', 'name email role avatar')
    .populate('lastMessage');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, targetId],
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role avatar')
      .populate('lastMessage');
  }

  return conversation;
};

// ─── Get My Conversations ──────────────────────────────────────
const getMyConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name email role avatar')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  // Add unread count for each conversation
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        isRead: false,
      });

      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
      };
    })
  );

  return result;
};

// ─── Get Messages in Conversation ─────────────────────────────
const getMessages = async (userId, conversationId, page = 1, limit = 50) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, 'Not authorized to view this conversation');
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(Number(limit));

  // Mark all unread messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false,
    },
    { isRead: true }
  );

  return messages;
};

// ─── Send Message ──────────────────────────────────────────────
const sendMessage = async (userId, conversationId, content) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, 'Not authorized to send messages here');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content,
  });

  // Update conversation's last message
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // Populate sender info before returning
  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role');

  return populated;
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};