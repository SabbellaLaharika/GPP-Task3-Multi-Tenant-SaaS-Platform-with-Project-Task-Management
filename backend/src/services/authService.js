const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Auth Service
 * Handles authentication business logic
 */

/**
 * Register new tenant with admin user
 */
const registerTenant = async (tenantData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = tenantData;

    // Check if subdomain already exists
    const existingTenant = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (existingTenant.rows.length > 0) {
      throw new Error('Subdomain already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create tenant
    const tenantId = uuidv4();
    const tenantResult = await client.query(
      `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, tenantName, subdomain, 'active', 'free', 5, 3]
    );

    const tenant = tenantResult.rows[0];

    // Create admin user
    const userId = uuidv4();
    const userResult = await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tenant_id, email, full_name, role, is_active`,
      [userId, tenantId, adminEmail, hashedPassword, adminFullName, 'tenant_admin', true]
    );

    const user = userResult.rows[0];

    await client.query('COMMIT');

    logger.info('Tenant registered successfully', { tenantId, subdomain });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    });

    return {
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        token,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Tenant registration failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * User login
 */
const login = async (loginData) => {
  const { email, password, tenantSubdomain, tenantId } = loginData;

  try {
    let query = `
      SELECT u.*, t.subdomain, t.subscription_plan, t.max_users, t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1 AND u.is_active = true
    `;
    const params = [email];

    // Filter by tenant if provided
    if (tenantSubdomain) {
      query += ' AND t.subdomain = $2';
      params.push(tenantSubdomain);
    } else if (tenantId) {
      query += ' AND u.tenant_id = $2';
      params.push(tenantId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check tenant status (if not super_admin)
    if (user.role !== 'super_admin' && user.tenant_id) {
      const tenantCheck = await pool.query(
        'SELECT status FROM tenants WHERE id = $1',
        [user.tenant_id]
      );

      if (tenantCheck.rows[0]?.status === 'suspended') {
        throw new Error('Account suspended/inactive');
      }
    }

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Log successful login
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), user.tenant_id, user.id, 'LOGIN_SUCCESS', 'user', user.id, null] // IP would need to be passed from controller
      );
    } catch (auditError) {
      logger.error('Failed to log login success', { error: auditError.message });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400, // 24 hours in seconds
      },
    };
  } catch (error) {
    logger.error('Login failed', { email, error: error.message });

    // Attempt to log failed login if we can find the user/tenant
    try {
      // Re-fetch user to get tenant_id if possible (even if password failed)
      const userRes = await pool.query('SELECT id, tenant_id FROM users WHERE email = $1', [email]);
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        await pool.query(
          `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), u.tenant_id, u.id, 'LOGIN_FAILED', 'user', u.id, error.message]
        );
      }
    } catch (logError) {
      // Ignore errors during failed login logging to prevent masking original error
    }

    throw error;
  }
};

/**
 * Get current user details
 */
const getCurrentUser = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.created_at,
              t.id as tenant_id, t.name as tenant_name, t.subdomain, 
              t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: user.tenant_id ? {
          id: user.tenant_id,
          name: user.tenant_name,
          subdomain: user.subdomain,
          subscriptionPlan: user.subscription_plan,
          maxUsers: user.max_users,
          maxProjects: user.max_projects,
        } : null,
      },
    };
  } catch (error) {
    logger.error('Get current user failed', { userId, error: error.message });
    throw error;
  }
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
};
