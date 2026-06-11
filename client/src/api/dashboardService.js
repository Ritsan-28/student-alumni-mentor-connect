import api from './axios';

const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  getAlumniDashboard: async () => {
    const response = await api.get('/dashboard/alumni');
    return response.data;
  },

  getMentorDashboard: async () => {
    const response = await api.get('/dashboard/mentor');
    return response.data;
  },
};

export default dashboardService;