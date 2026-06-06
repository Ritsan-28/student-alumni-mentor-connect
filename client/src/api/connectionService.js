import api from './axios';

const connectionService = {
  sendRequest: async (receiverId, message = '') => {
    const response = await api.post('/connections', { receiverId, message });
    return response.data;
  },

  acceptRequest: async (connectionId) => {
    const response = await api.put(`/connections/${connectionId}/accept`);
    return response.data;
  },

  declineRequest: async (connectionId) => {
    const response = await api.put(`/connections/${connectionId}/decline`);
    return response.data;
  },

  removeConnection: async (connectionId) => {
    const response = await api.delete(`/connections/${connectionId}`);
    return response.data;
  },

  getMyConnections: async () => {
    const response = await api.get('/connections');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/connections/pending');
    return response.data;
  },

  getConnectionStatus: async (targetId) => {
    const response = await api.get(`/connections/status/${targetId}`);
    return response.data;
  },
};

export default connectionService;