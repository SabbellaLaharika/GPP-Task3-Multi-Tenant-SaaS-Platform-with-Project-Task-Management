const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const logger = require('../utils/logger');
const { get } = require('../routes/superAdminRoutes');

const createTask = async (projectId, taskData, tenantId) => {
  try {
    // Verify project exists and belongs to tenant
    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      throw new Error("Project doesn't belong to user's tenant");
    }

    // If assignedTo is provided, verify user belongs to same tenant
    if (taskData.assignedTo) {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [taskData.assignedTo, tenantId]
      );

      if (userResult.rows.length === 0) {
        throw new Error("assignedTo user doesn't belong to same tenant");
      }
    }

    const taskId = uuidv4();
    const result = await pool.query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        taskId,
        projectId,
        tenantId,
        taskData.title,
        taskData.description || null,
        'todo',
        taskData.priority || 'medium',
        taskData.assignedTo || null,
        taskData.dueDate || null,
      ]
    );

    logger.info('Task created', { taskId, projectId });
    return { success: true, data: result.rows[0] };
  } catch (error) {
    logger.error('Create task failed', { error: error.message });
    throw error;
  }
};

const listProjectTasks = async (projectId, tenantId, filters = {}) => {
  try {
    const { page = 1, limit = 50, status, assignedTo, priority, search } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.full_name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1 AND t.tenant_id = $2
    `;
    const params = [projectId, tenantId];
    let paramCounter = 3;

    if (status) {
      query += ` AND t.status = $${paramCounter++}`;
      params.push(status);
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramCounter++}`;
      params.push(assignedTo);
    }

    if (priority) {
      query += ` AND t.priority = $${paramCounter++}`;
      params.push(priority);
    }

    if (search) {
      query += ` AND t.title ILIKE $${paramCounter++}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY 
      CASE t.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END,
      t.due_date ASC
      LIMIT $${paramCounter++} OFFSET $${paramCounter}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    return {
      success: true,
      data: {
        tasks: result.rows,
        total: parseInt(countResult.rows[0].count),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
          limit,
        },
      },
    };
  } catch (error) {
    logger.error('List tasks failed', { error: error.message });
    throw error;
  }
};

const updateTaskStatus = async (taskId, status, tenantId) => {
  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [status, new Date(), taskId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error("Task doesn't belong to user's tenant");
    }

    logger.info('Task status updated', { taskId, status });
    return { success: true, data: result.rows[0] };
  } catch (error) {
    logger.error('Update task status failed', { error: error.message });
    throw error;
  }
};

const updateTask = async (taskId, updateData, tenantId) => {
  try {
    const fields = [];
    const values = [];
    let counter = 1;

    if (updateData.title) {
      fields.push(`title = $${counter++}`);
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      fields.push(`description = $${counter++}`);
      values.push(updateData.description);
    }
    if (updateData.status) {
      fields.push(`status = $${counter++}`);
      values.push(updateData.status);
    }
    if (updateData.priority) {
      fields.push(`priority = $${counter++}`);
      values.push(updateData.priority);
    }
    if (updateData.assignedTo !== undefined) {
      if (updateData.assignedTo === null || updateData.assignedTo === '') {
        fields.push(`assigned_to = NULL`);
      } else {
        const userCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
          [updateData.assignedTo, tenantId]
        );
        if (userCheck.rows.length === 0) {
          throw new Error("assignedTo user doesn't belong to same tenant");
        }
        fields.push(`assigned_to = $${counter++}`);
        values.push(updateData.assignedTo);
      }
    }
    if (updateData.dueDate !== undefined) {
      fields.push(`due_date = $${counter++}`);
      values.push(updateData.dueDate);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = $${counter++}`);
    values.push(new Date());

    values.push(taskId, tenantId);

    const query = `
      UPDATE tasks 
      SET ${fields.join(', ')}
      WHERE id = $${counter++} AND tenant_id = $${counter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Task not found');
    }

    logger.info('Task updated', { taskId });
    return { success: true, message: 'Task updated successfully', data: result.rows[0] };
  } catch (error) {
    logger.error('Update task failed', { error: error.message });
    throw error;
  }
};

const deleteTask = async (taskId, tenantId, assigned_to) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [taskId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found');
    }

    logger.info('Task deleted', { taskId });
    return { success: true, message: 'Task deleted successfully' };
  } catch (error) {
    logger.error('Delete task failed', { error: error.message });
    throw error;
  }
};

const getUserTasks = async (userId) => {
  print('Fetching tasks for user:', userId);
  const query = `
    SELECT 
      t.*,
      p.name as project_name,
      p.id as project_id
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN users u on u.id = t.assigned_to
    WHERE t.assigned_to = $1
    ORDER BY 
      CASE t.status
        WHEN 'todo' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'completed' THEN 3
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC;
  `;

  try {
    const result = await pool.query(query, [userId]);
    console.log(result.rows);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};


module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getUserTasks,
};
