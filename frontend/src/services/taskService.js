import api from './api';

const taskService = {

  getAllByProject: async (projectId, params = {}) => {
    const response = await api.get(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  create: async (projectId, data) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  update: async (taskId, data) => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  updateStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  delete: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};

export default taskService;
