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
    if (error.message === 'Invalid credentials' || error.message === 'Account suspended/inactive') {
      return res.status(401).json({ success: false, message: error.message });
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

const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
};
