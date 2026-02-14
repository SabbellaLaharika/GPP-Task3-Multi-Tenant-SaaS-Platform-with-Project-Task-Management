const authService = require('../services/authService');
const logger = require('../utils/logger');

const registerTenant = async (req, res, next) => {
  try {
    const result = await authService.registerTenant(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Subdomain already exists') {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: error.message });
    }
    if (error.message === 'Account suspended/inactive') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Tenant not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // req.user is available because the route is protected
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    const result = await authService.logout(userId, tenantId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
};
