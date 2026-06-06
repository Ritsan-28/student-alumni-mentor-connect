const Connection = require('../../models/Connection');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');

// ─── Send Connection Request ───────────────────────────────────
const sendRequest = async (senderId, { receiverId, message }) => {
  if (senderId.toString() === receiverId) {
    throw new ApiError(400, 'You cannot connect with yourself');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.isActive) {
    throw new ApiError(404, 'User not found');
  }

  if (receiver.role === 'admin') {
    throw new ApiError(400, 'Cannot connect with admin');
  }

  // Check if connection already exists in either direction
  const existing = await Connection.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existing) {
    if (existing.status === 'pending') {
      throw new ApiError(400, 'Connection request already sent');
    }
    if (existing.status === 'accepted') {
      throw new ApiError(400, 'Already connected');
    }
    if (existing.status === 'declined') {
      // Allow re-request after decline
      existing.status = 'pending';
      existing.message = message || '';
      existing.sender = senderId;
      existing.receiver = receiverId;
      await existing.save();
      return existing;
    }
  }

  const connection = await Connection.create({
    sender: senderId,
    receiver: receiverId,
    message: message || '',
  });

  return connection;
};

// ─── Accept Request ────────────────────────────────────────────
const acceptRequest = async (userId, connectionId) => {
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    throw new ApiError(404, 'Connection request not found');
  }

  if (connection.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to accept this request');
  }

  if (connection.status !== 'pending') {
    throw new ApiError(400, 'Request is no longer pending');
  }

  connection.status = 'accepted';
  await connection.save();

  return connection;
};

// ─── Decline Request ───────────────────────────────────────────
const declineRequest = async (userId, connectionId) => {
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    throw new ApiError(404, 'Connection request not found');
  }

  if (connection.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to decline this request');
  }

  if (connection.status !== 'pending') {
    throw new ApiError(400, 'Request is no longer pending');
  }

  connection.status = 'declined';
  await connection.save();

  return connection;
};

// ─── Withdraw / Remove Connection ─────────────────────────────
const removeConnection = async (userId, connectionId) => {
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    throw new ApiError(404, 'Connection not found');
  }

  const isInvolved =
    connection.sender.toString() === userId.toString() ||
    connection.receiver.toString() === userId.toString();

  if (!isInvolved) {
    throw new ApiError(403, 'Not authorized');
  }

  await connection.deleteOne();
  return { message: 'Connection removed' };
};

// ─── Get My Connections (accepted) ────────────────────────────
const getMyConnections = async (userId) => {
  const connections = await Connection.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'accepted',
  })
    .populate('sender', 'name email role avatar')
    .populate('receiver', 'name email role avatar')
    .sort({ updatedAt: -1 });

  // Return the "other" person in each connection
  const result = connections.map((conn) => {
    const other =
      conn.sender._id.toString() === userId.toString()
        ? conn.receiver
        : conn.sender;
    return {
      connectionId: conn._id,
      user: other,
      connectedAt: conn.updatedAt,
    };
  });

  return result;
};

// ─── Get Pending Requests ──────────────────────────────────────
const getPendingRequests = async (userId) => {
  // Requests received by me
  const received = await Connection.find({
    receiver: userId,
    status: 'pending',
  })
    .populate('sender', 'name email role avatar')
    .sort({ createdAt: -1 });

  // Requests sent by me
  const sent = await Connection.find({
    sender: userId,
    status: 'pending',
  })
    .populate('receiver', 'name email role avatar')
    .sort({ createdAt: -1 });

  return { received, sent };
};

// ─── Get Connection Status ─────────────────────────────────────
const getConnectionStatus = async (userId, targetId) => {
  const connection = await Connection.findOne({
    $or: [
      { sender: userId, receiver: targetId },
      { sender: targetId, receiver: userId },
    ],
  });

  if (!connection) return { status: 'none', connectionId: null };

  return {
    status: connection.status,
    connectionId: connection._id,
    isSender: connection.sender.toString() === userId.toString(),
  };
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