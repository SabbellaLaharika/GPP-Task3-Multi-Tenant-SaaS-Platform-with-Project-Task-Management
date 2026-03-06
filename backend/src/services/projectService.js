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

    // Log action (separate transaction or after commit)
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'CREATE_PROJECT', 'project', projectId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    const createdProject = result.rows[0];
    const data = {
      id: createdProject.id,
      tenantId: createdProject.tenant_id,
      name: createdProject.name,
      description: createdProject.description,
      status: createdProject.status,
      createdBy: createdProject.created_by,
      createdAt: createdProject.created_at
    }
    return {
      success: true,
      message: 'Project created successfully',
      data: data
    };
  }
  catch (error) {
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

    const projectsWithStats = await Promise.all(
      result.rows.map(async (project) => {
        return {
          id: project.id,
          tenantId: project.tenant_id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdBy: {
            id: project.created_by,
            name: project.created_by_name
          },
          taskCount: parseInt(project.task_count),
          completedTaskCount: parseInt(project.completed_task_count),
          createdAt: project.created_at
        }
      })
    );
    logger.info('Projects list retrieved', { count: result.rows.length });
    return {
      success: true,
      message: 'Projects retrieved successfully',
      data: {
        projects: projectsWithStats,
        total: parseInt(countResult.rows[0].count),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
          limit: limit,
        }
      },
    };
  } catch (error) {
    logger.error('List projects failed', { error: error.message });
    throw error;
  }
};

const updateProject = async (projectId, updateData, userId, tenantId, userRole) => {
  try {
    const client = await pool.connect();

    // Check authorization: tenant_admin OR project creator
    if (userRole !== 'tenant_admin') {
      const projectCheck = await client.query(
        'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
        [projectId, tenantId]
      );

      if (projectCheck.rows.length === 0) {
        client.release();
        throw new Error('Project not found');
      }

      if (projectCheck.rows[0].created_by !== userId) {
        client.release();
        throw new Error('Unauthorized access');
      }
    }
    client.release();

    const allowedFields = ['name', 'description', 'status'];
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    })

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const query = `
      UPDATE projects 
      SET  ${setClause}, updated_at = NOW()
      WHERE id = $${1} AND tenant_id = $${2}
      RETURNING *
    `;

    const result = await pool.query(query, [projectId, tenantId, ...values]);

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    logger.info('Project updated', { projectId });

    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'UPDATE_PROJECT', 'project', projectId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    return {
      success: true,
      message: 'Project updated successfully',
      data: {
        id: projectId,
        ...filteredData,
        updatedAt: result.rows[0].updated_at
      }
    };
  } catch (error) {
    logger.error('Update project failed', { error: error.message });
    throw error;
  }
};

const deleteProject = async (projectId, tenantId, userId, userRole) => {
  try {
    const client = await pool.connect();

    // Check authorization: tenant_admin OR project creator
    if (userRole !== 'tenant_admin') {
      const projectCheck = await client.query(
        'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
        [projectId, tenantId]
      );

      if (projectCheck.rows.length === 0) {
        client.release();
        throw new Error('Project not found');
      }

      if (projectCheck.rows[0].created_by !== userId) {
        client.release();
        throw new Error('Unauthorized access');
      }
    }
    client.release();

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    logger.info('Project deleted', { projectId });

    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'DELETE_PROJECT', 'project', projectId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    logger.error('Delete project failed', { error: error.message });
    throw error;
  }
};


// const getAllProjectsForSuperAdmin = async (filters = {}) => {
//   const { status, search, sortBy = 'created_at', order = 'DESC' } = filters;

//   let query = `
//     SELECT 
//       p.*,
//       t.name as tenant_name,
//       t.subdomain as tenant_subdomain,
//       COUNT(DISTINCT tk.id) as task_count,
//       COUNT(DISTINCT CASE WHEN tk.status = 'completed' THEN tk.id END) as completed_tasks
//     FROM projects p
//     LEFT JOIN tenants t ON p.tenant_id = t.id
//     LEFT JOIN tasks tk ON p.id = tk.project_id
//     WHERE 1=1
//   `;

//   const params = [];
//   let paramCount = 0;

//   if (status) {
//     paramCount++;
//     query += ` AND p.status = $${paramCount}`;
//     params.push(status);
//   }

//   if (search) {
//     paramCount++;
//     query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR t.name ILIKE $${paramCount})`;
//     params.push(`%${search}%`);
//   }

//   query += ` GROUP BY p.id, t.name, t.subdomain`;
//   query += ` ORDER BY p.${sortBy} ${order}`;

//   try {
//     const result = await pool.query(query, params);
//     return result.rows;
//   } catch (error) {
//     throw new Error(`Database error: ${error.message}`);
//   }
// };

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
  //getAllProjectsForSuperAdmin,
};
