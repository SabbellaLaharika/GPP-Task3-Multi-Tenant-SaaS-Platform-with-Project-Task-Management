const tenantService = require('../services/tenantService');

const getTenantDetails = async (req, res, next) => {
  try {
    const result = await tenantService.getTenantDetails(
      req.params.tenantId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const result = await tenantService.updateTenant(
      req.params.tenantId,
      req.body,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listAllTenants = async (req, res, next) => {
  try {
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
