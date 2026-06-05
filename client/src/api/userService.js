import api from './axios';

const userService = {
  // Get my own profile
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update my profile
  updateMe: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Upload profile photo
  updatePhoto: async (formData) => {
    const response = await api.put('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get any user's profile by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get list of users with optional filters
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
};

export default userService;