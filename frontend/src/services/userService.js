import api from './api';

const userService = {
  getAllByTenant: async (tenantId, params = {}) => {
    const response = await api.get(`/tenants/${tenantId}/users`, { params });
    return response.data;
  },

  getUserTasks: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/tasks`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (tenantId, data) => {
    const response = await api.post(`/tenants/${tenantId}/users`, data);
    return response.data;
  },

  update: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default userService;
