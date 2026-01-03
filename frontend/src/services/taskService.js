import api from './api';

const taskService = {
  getAllByProject: async (projectId, params = {}) => {
    const response = await api.get(`/api/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  getUserTasks : async (userId) => {
    try {
      const response = await api.get(`api/users/${userId}/tasks`);
      console.log('Fetched tasks for user:', userId);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (projectId, data) => {
    const response = await api.post(`/api/projects/${projectId}/tasks`, data);
    return response.data;
  },

  update: async (taskId, data) => {
    const response = await api.put(`/api/tasks/${taskId}`, data);
    return response.data;
  },

  updateStatus: async (taskId, status) => {
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  delete: async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
};

export default taskService;
