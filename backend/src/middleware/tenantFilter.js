const logger = require('../utils/logger');

/**
 * Multi-Tenancy Middleware
 * Automatically filters queries by tenant_id
 * Adds tenantId to request for use in queries
 */
const tenantFilter = (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Super admins can access all tenants (no filter applied)
    if (req.user.role === 'super_admin') {
      logger.debug('Super admin access - no tenant filter applied', {
        userId: req.user.id,
      });
      req.tenantId = null; // null means no filter
      return next();
    }

    // For tenant_admin and user roles, enforce tenant isolation
    if (!req.user.tenantId) {
      logger.error('User has no tenant association', {
        userId: req.user.id,
        role: req.user.role,
      });
      return res.status(403).json({
        success: false,
        message: 'User must be associated with a tenant',
      });
    }

    // Set tenant ID for filtering
    req.tenantId = req.user.tenantId;

    logger.debug('Tenant filter applied', {
      userId: req.user.id,
      tenantId: req.tenantId,
    });

    next();
  } catch (error) {
    logger.error('Tenant filter error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error in tenant filtering',
    });
  }
};

module.exports = tenantFilter;
