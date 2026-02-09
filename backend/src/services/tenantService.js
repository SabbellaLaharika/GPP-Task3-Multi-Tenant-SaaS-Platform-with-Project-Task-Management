const { pool } = require('../db/pool');
const logger = require('../utils/logger');

/**
 * Tenant Service
 * Handles tenant management business logic
 */

/**
 * Get tenant details with stats
 */
const getTenantDetails = async (tenantId, requestingUserId, requestingUserRole) => {
  try {
    // Get tenant basic info
    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan, 
              max_users, max_projects, created_at, updated_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResult.rows[0];

    // Get stats
    const statsResult = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as total_tasks
      `,
      [tenantId]
    );

    const stats = statsResult.rows[0];

    logger.info('Tenant details retrieved', { tenantId });

    return {
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: parseInt(stats.total_users),
          totalProjects: parseInt(stats.total_projects),
          totalTasks: parseInt(stats.total_tasks),
        },
      },
    };
  } catch (error) {
    logger.error('Get tenant details failed', { tenantId, error: error.message });
    throw error;
  }
};

/**
 * Update tenant
 */
const updateTenant = async (tenantId, updateData, requestingUserId) => {
  // Build dynamic UPDATE query
  const fields = Object.keys(updateData);
  const values = Object.values(updateData);

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  // Build SET clause: field1 = $1, field2 = $2, ...
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `
    UPDATE tenants 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  console.log('updateTenant service - query:', query);
  console.log('updateTenant service - values:', [...values, tenantId]);

  try {
    const result = await pool.query(query, [...values, tenantId]);

    if (result.rows.length === 0) {
      throw new Error('Tenant not found');
    }

    const updatedTenant = result.rows[0];
    console.log('updateTenant service - updated tenant:', updatedTenant);

    // Audit Logging
    try {
      const { v4: uuidv4 } = require('uuid'); // ensure uuid is available

      // Log general update
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), tenantId, requestingUserId, 'UPDATE_TENANT', 'tenant', tenantId, JSON.stringify(updateData)]
      );

      // Log subscription change specifically if it happened
      if (updateData.subscription_plan) {
        await pool.query(
          `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), tenantId, requestingUserId, 'SUBSCRIPTION_CHANGE', 'tenant', tenantId, `Changed to ${updateData.subscription_plan}`]
        );
      }
    } catch (auditError) {
      logger.error('Failed to log tenant update', { error: auditError.message });
    }

    return updatedTenant;
  } catch (error) {
    console.error('updateTenant service error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * List all tenants (super_admin only)
 */
const listAllTenants = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, status, subscriptionPlan } = filters;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM tenants WHERE 1=1';
    const params = [];
    let paramCounter = 1;

    if (status) {
      query += ` AND status = $${paramCounter++}`;
      params.push(status);
    }

    if (subscriptionPlan) {
      query += ` AND subscription_plan = $${paramCounter++}`;
      params.push(subscriptionPlan);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM tenants WHERE 1=1';
    const countParams = [];
    let countParamCounter = 1;

    if (status) {
      countQuery += ` AND status = $${countParamCounter++}`;
      countParams.push(status);
    }

    if (subscriptionPlan) {
      countQuery += ` AND subscription_plan = $${countParamCounter++}`;
      countParams.push(subscriptionPlan);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalTenants = parseInt(countResult.rows[0].count);

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all(
      result.rows.map(async (tenant) => {
        const statsResult = await pool.query(
          `SELECT 
            (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
            (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as total_projects
          `,
          [tenant.id]
        );
        return {
          ...tenant,
          stats: {
            totalUsers: parseInt(statsResult.rows[0].total_users),
            totalProjects: parseInt(statsResult.rows[0].total_projects),
          },
        };
      })
    );

    logger.info('Tenants list retrieved', { count: result.rows.length });

    return {
      success: true,
      data: {
        tenants: tenantsWithStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTenants / limit),
          totalTenants: totalTenants,
          limit: limit,
        },
      },
    };
  } catch (error) {
    logger.error('List tenants failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants
};
