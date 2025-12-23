const userService = require('../services/userService');

const addUserToTenant = async (req, res, next) => {
  try {
    const result = await userService.addUserToTenant(
      req.params.tenantId,
      req.body,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Subscription limit reached') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Email already exists in this tenant') {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listTenantUsers = async (req, res, next) => {
  try {
    const result = await userService.listTenantUsers(req.params.tenantId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(
      req.params.userId,
      req.body,
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(
      req.params.userId,
      req.user.id,
      req.user.tenantId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Cannot delete self') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser,
};
