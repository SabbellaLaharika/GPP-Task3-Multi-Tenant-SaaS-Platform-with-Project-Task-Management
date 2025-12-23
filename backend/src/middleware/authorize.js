const logger = require('../utils/logger');

/**
 * Authorization Middleware Factory
 * Creates middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
        });
      }

      logger.debug('User authorized', {
        userId: req.user.id,
        role: req.user.role,
      });

      next();
    } catch (error) {
      logger.error('Authorization error', { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
      });
    }
  };
};

module.exports = authorize;
