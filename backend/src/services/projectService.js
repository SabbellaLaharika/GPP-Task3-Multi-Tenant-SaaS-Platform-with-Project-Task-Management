const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const logger = require('../utils/logger');

const createProject = async (projectData, userId, tenantId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check project limit
    const tenantResult = await client.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    const { max_projects } = tenantResult.rows[0];

    const projectCountResult = await client.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    if (parseInt(projectCountResult.rows[0].count) >= max_projects) {
      throw new Error('Project limit reached');
    }

    const projectId = uuidv4();
    const result = await client.query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [projectId, tenantId, projectData.name, projectData.description || null, 
       projectData.status || 'active', userId]
    );

    await client.query('COMMIT');
    logger.info('Project created', { projectId, tenantId });

    return { success: true, data: result.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create project failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

const listProjects = async (tenantId, filters = {}) => {
  try {
    const { page = 1, limit = 20, status, search } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.full_name as created_by_name,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
    `;
    const params = [tenantId];
    let paramCounter = 2;

    if (status) {
      query += ` AND p.status = $${paramCounter++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCounter++}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    return {
      success: true,
      data: {
        projects: result.rows,
        total: parseInt(countResult.rows[0].count),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
          limit,
        },
      },
    };
  } catch (error) {
    logger.error('List projects failed', { error: error.message });
    throw error;
  }
};

const updateProject = async (projectId, updateData, userId, tenantId) => {
  try {
    const fields = [];
    const values = [];
    let counter = 1;

    if (updateData.name) {
      fields.push(`name = $${counter++}`);
      values.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      fields.push(`description = $${counter++}`);
      values.push(updateData.description);
    }
    if (updateData.status) {
      fields.push(`status = $${counter++}`);
      values.push(updateData.status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = $${counter++}`);
    values.push(new Date());

    values.push(projectId, tenantId);

    const query = `
      UPDATE projects 
      SET ${fields.join(', ')}
      WHERE id = $${counter++} AND tenant_id = $${counter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    logger.info('Project updated', { projectId });
    return { success: true, message: 'Project updated successfully', data: result.rows[0] };
  } catch (error) {
    logger.error('Update project failed', { error: error.message });
    throw error;
  }
};

const deleteProject = async (projectId, tenantId) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    logger.info('Project deleted', { projectId });
    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    logger.error('Delete project failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
};
