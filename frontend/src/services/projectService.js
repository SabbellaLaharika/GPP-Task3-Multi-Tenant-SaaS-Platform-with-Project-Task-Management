import api from './api';

const projectService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/projects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/projects', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },
};

export default projectService;
