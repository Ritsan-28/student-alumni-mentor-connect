import api from './axios';

const mentorService = {
  getMentors: async (params = {}) => {
    const response = await api.get('/mentors', { params });
    return response.data;
  },
};

export default mentorService;