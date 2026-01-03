import api from './api';

// Get system-wide statistics
export const getSystemStats = async () => {
  try {
    const response = await api.get('api/superadmin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all tenants with statistics
export const getAllTenantsWithStats = async (params = {}) => {
  try {
    const response = await api.get('api/superadmin/tenants', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllProjects = async (params = {}) => {
  try {
    const response = await api.get('api/superadmin/projects', { params });  
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getSystemStats,
  getAllTenantsWithStats,
  getAllProjects
};