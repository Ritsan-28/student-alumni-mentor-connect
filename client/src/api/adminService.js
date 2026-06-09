import api from './axios';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getActivity: async () => {
    const response = await api.get('/admin/activity');
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, action) => {
    const response = await api.put(`/admin/users/${id}/status`, { action });
    return response.data;
  },

  getPendingJobs: async () => {
    const response = await api.get('/admin/jobs/pending');
    return response.data;
  },

  approveJob: async (id) => {
    const response = await api.put(`/admin/jobs/${id}/approve`);
    return response.data;
  },

  rejectJob: async (id) => {
    const response = await api.put(`/admin/jobs/${id}/reject`);
    return response.data;
  },

  getPendingEvents: async () => {
    const response = await api.get('/admin/events/pending');
    return response.data;
  },

  approveEvent: async (id) => {
    const response = await api.put(`/admin/events/${id}/approve`);
    return response.data;
  },

  rejectEvent: async (id) => {
    const response = await api.put(`/admin/events/${id}/reject`);
    return response.data;
  },
};

export default adminService;