import api from './axios';

const messageService = {
  getOrCreateConversation: async (targetId) => {
    const response = await api.post('/conversations', { targetId });
    return response.data;
  },

  getMyConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getMessages: async (conversationId, page = 1) => {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page },
    });
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },
};

export default messageService;