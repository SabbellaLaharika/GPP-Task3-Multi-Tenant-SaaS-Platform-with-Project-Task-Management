import api from './api';

const tenantService = {
  getDetails: async (tenantId) => {
    const response = await api.get(`/api/tenants/${tenantId}`);
    return response.data;
  },

  update: async (tenantId, data) => {
    const response = await api.put(`/api/tenants/${tenantId}`, data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/api/tenants', { params });
    return response.data;
  },
};

export default tenantService;
