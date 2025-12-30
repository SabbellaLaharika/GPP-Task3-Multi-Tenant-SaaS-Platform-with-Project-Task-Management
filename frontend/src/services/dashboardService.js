import api from './api';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};