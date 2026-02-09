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

const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;
    // Super admin can update everything
    // Tenant admin can only update name
    const allowedFields = userRole === 'super_admin'
      ? ['name', 'subscription_plan', 'max_users', 'max_projects', 'status']
      : ['name'];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    console.log('updateTenant controller - filteredData:', filteredData);

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedTenant = await tenantService.updateTenant(tenantId, filteredData, req.user.id);

    console.log('updateTenant controller - result:', updatedTenant);

    res.status(200).json({
      success: true,
      data: updatedTenant,
      message: 'Tenant updated successfully'
    });
  } catch (error) {
    console.error('Update tenant controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
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
