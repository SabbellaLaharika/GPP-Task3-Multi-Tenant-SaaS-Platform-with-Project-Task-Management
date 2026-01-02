import api from './api';

const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register-tenant', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('tenantId',response.data.data.user?.tenantId || response.data.data.tenantId
);

    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('tenantId', response.data.data.user.tenantId);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('subdomain');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');

    if (response.data.data) {
      const apiUser = response.data.data;

      const normalizedUser = {
        id: apiUser.id,
        email: apiUser.email,
        fullName: apiUser.fullName,
        role: apiUser.role,
        isActive: apiUser.isActive,
        tenantId: apiUser.tenant?.id || null, 
        tenant: apiUser.tenant || null,
      };

      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('tenantId', normalizedUser.tenantId);

      return { data: normalizedUser };
    }
    return response.data;
  },

   getTenantId: () => {
    const user = authService.getStoredUser();
    return user?.tenantId || localStorage.getItem('tenantId');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
