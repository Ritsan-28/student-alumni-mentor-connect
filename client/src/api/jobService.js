import api from './axios';

const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  toggleSaveJob: async (id) => {
    const response = await api.post(`/jobs/${id}/save`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get('/jobs/saved');
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get('/jobs/my');
    return response.data;
  },

  getPendingJobs: async () => {
    const response = await api.get('/jobs/pending');
    return response.data;
  },

  approveJob: async (id) => {
    const response = await api.put(`/jobs/${id}/approve`);
    return response.data;
  },
};

export default jobService;