const logger = require('../utils/logger');

/**
 * Validation Middleware Factory
 * Validates request body against schema
 * @param {Object} schema - Validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check if required field is missing
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
      }

      // String validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }

      // Number validations
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must not exceed ${rules.max}`);
        }
      }

      // Email validation
      if (rules.email && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address`);
        }
      }

      // UUID validation
      if (rules.uuid && typeof value === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
          errors.push(`${field} must be a valid UUID`);
        }
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed', { errors, body: req.body });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
      });
    }

    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // Tenant registration
  registerTenant: {
    tenantName: { required: true, type: 'string', minLength: 2, maxLength: 255 },
    subdomain: { required: true, type: 'string', minLength: 3, maxLength: 255, pattern: /^[a-z0-9-]+$/ },
    adminEmail: { required: true, type: 'string', email: true },
    adminPassword: { required: true, type: 'string', minLength: 8 },
    adminFullName: { required: true, type: 'string', minLength: 2 },
  },

  // User login
  login: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string' },
    tenantSubdomain: { required: false, type: 'string' },
  },

  // Create user
  createUser: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string', minLength: 8 },
    fullName: { required: true, type: 'string', minLength: 2 },
    role: { required: false, type: 'string', enum: ['user', 'tenant_admin'] },
  },

  // Update user
  updateUser: {
    fullName: { required: false, type: 'string', minLength: 2 },
    role: { required: false, type: 'string', enum: ['user', 'tenant_admin'] },
    isActive: { required: false, type: 'boolean' },
  },

  // Create project
  createProject: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 255 },
    description: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['active', 'archived', 'completed'] },
  },

  // Update project
  updateProject: {
    name: { required: false, type: 'string', minLength: 2, maxLength: 255 },
    description: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['active', 'archived', 'completed'] },
  },

  // Create task
  createTask: {
    title: { required: true, type: 'string', minLength: 2, maxLength: 255 },
    description: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string', uuid: true },
    priority: { required: false, type: 'string', enum: ['low', 'medium', 'high'] },
    dueDate: { required: false, type: 'string' },
  },

  // Update task
  updateTask: {
    title: { required: false, type: 'string', minLength: 2, maxLength: 255 },
    description: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['todo', 'in_progress', 'completed'] },
    priority: { required: false, type: 'string', enum: ['low', 'medium', 'high'] },
    assignedTo: { required: false, type: 'string' },
    dueDate: { required: false, type: 'string' },
  },
};

module.exports = {
  validate,
  schemas,
};
