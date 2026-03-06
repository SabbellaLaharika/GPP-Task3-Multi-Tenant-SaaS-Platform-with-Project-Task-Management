const tenantService = require('../services/tenantService');

const getTenantDetails = async (req, res, next) => {
  try {
    const result = await tenantService.getTenantDetails(
      req.params.tenantId,
      req.user.tenantId,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const result = await tenantService.updateTenant(
      tenantId,
      req.body,
      req.user.role,
      req.user.id
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error('Update tenant controller error:', error);
    if (error.message === "No valid fields to update") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes("You are not authorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === "Tenant not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
};
const listAllTenants = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to list tenants'
      });
    }
    const result = await tenantService.listAllTenants(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants,
};
