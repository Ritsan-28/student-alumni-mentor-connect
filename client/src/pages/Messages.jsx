import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import messageService from '../api/messageService';
import useAuthStore from '../store/authStore';
import useSocketStore from '../store/socketStore';
import { MessageSquare } from 'lucide-react';

// ─── Format timestamp ──────────────────────────────────────────
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
};

// ─── Conversation List Item ────────────────────────────────────
const ConversationItem = ({ conv, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left
      ${isActive ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}
    `}
  >
    <Avatar src={conv.otherUser?.avatar} name={conv.otherUser?.name} size="md" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900 truncate text-sm">
          {conv.otherUser?.name}
        </p>
        {conv.lastMessageAt && (
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            {formatTime(conv.lastMessageAt)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-gray-500 truncate">
          {conv.lastMessage?.content || 'No messages yet'}
        </p>
        {conv.unreadCount > 0 && (
          <span className="ml-2 shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </div>
  </button>
);

// ─── Message Bubble ────────────────────────────────────────────
const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
    {!isOwn && (
      <Avatar src={message.sender?.avatar} name={message.sender?.name} size="xs" />
    )}
    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
      <div className={`
        px-4 py-2.5 rounded-2xl text-sm
        ${isOwn
          ? 'bg-primary-600 text-white rounded-br-md'
          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
        }
      `}>
        {message.content}
      </div>
      <span className="text-xs text-gray-400 mt-1 px-1">
        {formatTime(message.createdAt)}
        {isOwn && (
          <span className="ml-1">{message.isRead ? '✓✓' : '✓'}</span>
        )}
      </span>
    </div>
  </div>
);

// ─── Main Messages Page ────────────────────────────────────────
const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket } = useSocketStore();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    const load = async () => {
      setIsLoadingConvs(true);
      try {
        const res = await messageService.getMyConversations();
        setConversations(res.data);

        // Auto-select conversation from URL param
        if (conversationId) {
          const found = res.data.find((c) => c._id === conversationId);
          if (found) setActiveConv(found);
        }
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setIsLoadingConvs(false);
      }
    };
    load();
  }, [conversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    let cancelled = false;

    const loadMessages = async () => {
      setIsLoadingMsgs(true);
      try {
        const res = await messageService.getMessages(activeConv._id);
        if (!cancelled) {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load messages');
      } finally {
        if (!cancelled) setIsLoadingMsgs(false);
      }
    };

    loadMessages();
    return () => { cancelled = true; };
  }, [activeConv]);

  // Socket.io — join room and listen for messages
  useEffect(() => {
    if (!socket || !activeConv) return;

    socket.emit('join_conversation', activeConv._id);

    socket.on('new_message', (message) => {
      const currentUserId = user?._id;
  // Only add message from socket if it was sent by the OTHER person
      if (message.sender?._id !== currentUserId && message.sender !== currentUserId) {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
    });

    socket.on('user_typing', () => {
        setIsTyping(true);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.emit('leave_conversation', activeConv._id);
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConv, user?._id]);

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    navigate(`/messages/${conv._id}`, { replace: true });
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !activeConv) return;

    setIsSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await messageService.sendMessage(activeConv._id, content);
      setMessages((prev) => [...prev, res.data]);
      setTimeout(scrollToBottom, 100);

      // Update conversation last message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id
            ? { ...c, lastMessage: res.data, lastMessageAt: new Date() }
            : c
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !activeConv) return;
    socket.emit('typing', { conversationId: activeConv._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv._id });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (isLoadingConvs) return <PageLoader />;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6 max-w-6xl mx-auto">

        {/* ── Conversation List ── */}
        <div className="w-80 shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conv={conv}
                  isActive={activeConv?._id === conv._id}
                  onClick={() => handleSelectConversation(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Chat Window ── */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!activeConv ? (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the left to start messaging"
            />
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <Avatar
                  src={activeConv.otherUser?.avatar}
                  name={activeConv.otherUser?.name}
                  size="sm"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {activeConv.otherUser?.name}
                  </p>
                  <Badge variant={activeConv.otherUser?.role} size="xs">
                    {activeConv.otherUser?.role}
                  </Badge>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Send a message to start the conversation
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">{date}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-3">
                        {msgs.map((msg) => (
                          <MessageBubble
                            key={msg._id}
                            message={msg}
                            isOwn={msg.sender?._id === user?._id ||
                                   msg.sender === user?._id}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={activeConv.otherUser?.avatar}
                      name={activeConv.otherUser?.name}
                      size="xs"
                    />
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="flex-1 input-field resize-none min-h-[42px] max-h-32"
                    style={{ height: 'auto' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || isSending}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSending
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <Send className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Messages;