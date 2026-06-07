import api from './axios';

const eventService = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  registerInterest: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  getMyEvents: async () => {
    const response = await api.get('/events/my');
    return response.data;
  },
};

export default eventService;