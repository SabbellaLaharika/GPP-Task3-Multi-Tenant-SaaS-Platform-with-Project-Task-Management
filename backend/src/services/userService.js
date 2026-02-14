const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const logger = require('../utils/logger');

/**
 * Add user to tenant
 */
const addUserToTenant = async (tenantId, userData, requestingUserId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { email, password, fullName, role = 'user' } = userData;

    // Check tenant limits
    const tenantResult = await client.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }

    const { max_users } = tenantResult.rows[0];

    // Check current user count
    const userCountResult = await client.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    if (parseInt(userCountResult.rows[0].count) >= max_users) {
      throw new Error('Subscription limit reached');
    }

    // Check if email already exists in this tenant
    const existingUser = await client.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email already exists in this tenant');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tenant_id, email, full_name, role, is_active, created_at`,
      [userId, tenantId, email, hashedPassword, fullName, role, true]
    );

    // Log action in audit_logs
    await client.query(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), tenantId, requestingUserId, 'CREATE_USER', 'user', userId]
    );

    await client.query('COMMIT');

    logger.info('User created successfully', { userId, tenantId });

    return {
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create user failed', { tenantId, error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * List tenant users
 */
const listTenantUsers = async (tenantId, filters = {}) => {
  try {
    const { page = 1, limit = 50, search, role } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE tenant_id = $1
    `;
    const params = [tenantId];
    let paramCounter = 2;

    if (search) {
      query += ` AND (email ILIKE $${paramCounter} OR full_name ILIKE $${paramCounter})`;
      params.push(`%${search}%`);
      paramCounter++;
    }

    if (role) {
      query += ` AND role = $${paramCounter++}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE tenant_id = $1';
    const countParams = [tenantId];

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return {
      success: true,
      data: {
        users: result.rows,
        total: total,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit: limit,
        },
      },
    };
  } catch (error) {
    logger.error('List users failed', { tenantId, error: error.message });
    throw error;
  }
};

/**
 * Update user
 */
const updateUser = async (userId, updateData, requestingUserId, requestingUserRole) => {
  try {
    // Enforce: Only admin can update others. Regular users can only update themselves.
    if (requestingUserRole !== 'tenant_admin' && userId !== requestingUserId) {
      throw new Error('Unauthorized access');
    }

    const allowedFields = [];
    const values = [];
    let paramCounter = 1;

    // Users can update their own fullName
    if (updateData.fullName) {
      allowedFields.push(`full_name = $${paramCounter++}`);
      values.push(updateData.fullName);
    }

    // Only tenant_admin can update role and isActive
    if (requestingUserRole === 'tenant_admin') {
      if (updateData.role) {
        allowedFields.push(`role = $${paramCounter++}`);
        values.push(updateData.role);
      }
      if (updateData.isActive !== undefined) {
        allowedFields.push(`is_active = $${paramCounter++}`);
        values.push(updateData.isActive);
      }
    }

    if (allowedFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    allowedFields.push(`updated_at = $${paramCounter++}`);
    values.push(new Date());

    values.push(userId);

    const query = `
      UPDATE users 
      SET ${allowedFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING id, email, full_name, role, is_active, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User updated', { userId });

    // Log action in audit_logs
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), requestingUserTenantId || (await getUserTenantId(userId)), requestingUserId, 'UPDATE_USER', 'user', userId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
      // Don't fail the request if audit logging fails
    } finally {
      client.release();
    }

    return {
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    };
  } catch (error) {
    logger.error('Update user failed', { userId, error: error.message });
    throw error;
  }
};

// Helper to get tenant ID if not provided (e.g. self update)
const getUserTenantId = async (userId) => {
  const res = await pool.query('SELECT tenant_id FROM users WHERE id = $1', [userId]);
  return res.rows[0]?.tenant_id;
};

/**
 * Delete user
 */
const deleteUser = async (userId, requestingUserId, requestingUserTenantId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get user to check if they exist and belong to same tenant
    const userResult = await client.query(
      'SELECT tenant_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    // Prevent self-deletion
    if (userId === requestingUserId) {
      throw new Error('Cannot delete self');
    }

    // Delete user (CASCADE will handle related records)
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    // Log action
    await client.query(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), requestingUserTenantId, requestingUserId, 'DELETE_USER', 'user', userId]
    );

    await client.query('COMMIT');

    logger.info('User deleted', { userId });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Delete user failed', { userId, error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

const getUserTasks = async (userId, tenantId) => {
  const query = `
    SELECT 
      t.*,
      p.name as project_name,
      p.id as project_id
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.assigned_to = $1 
      AND t.tenant_id = $2
    ORDER BY 
      CASE t.status
        WHEN 'todo' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'completed' THEN 3
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
  `;

  try {

    const result = await pool.query(query, [userId, tenantId]);
    return result.rows;
  } catch (error) {
    console.error('getUserTasks service error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};


module.exports = {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser,
  getUserTasks,
};
