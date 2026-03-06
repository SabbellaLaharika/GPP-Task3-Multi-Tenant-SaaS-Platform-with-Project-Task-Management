const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const logger = require('../utils/logger');
const { get } = require('../routes/superAdminRoutes');

const createTask = async (projectId, taskData, userId) => {
  try {
    // Verify project exists and belongs to tenant

    const tenantIdQuery = 'SELECT tenant_id FROM projects WHERE id = $1';
    const tenantIdResult = await pool.query(tenantIdQuery, [projectId]);
    const tenantId = tenantIdResult.rows[0].tenant_id;
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

    if (taskData.dueDate) {
      const inputDate = new Date(taskData.dueDate);
      const today = new Date();

      // Reset both to midnight for a fair comparison of just the day
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        throw new Error("Due date cannot be in the past");
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
        taskData.dueDate ? taskData.dueDate.split('T')[0] : null
      ]
    );

    logger.info('Task created', { taskId, projectId });

    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'CREATE_TASK', 'task', taskId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    const createdTask = result.rows[0];
    return {
      success: true,
      message: "Task created successfully",
      data: {
        id: createdTask.id,
        projectId: createdTask.project_id,
        tenantId: createdTask.tenant_id,
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        priority: createdTask.priority,
        assignedTo: createdTask.assigned_to,
        dueDate: createdTask.due_date,
        createdAt: createdTask.created_at
      }
    };
  } catch (error) {
    logger.error('Create task failed', { error: error.message });
    throw error;
  }
};

const listProjectTasks = async (projectId, tenantId, userRole, filters = {}) => {


  try {
    let { page = 1, limit = 50, status, assignedTo, priority, search } = filters;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 50, 100);
    const offset = (page - 1) * limit;

    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length == 0) {
      throw new Error("Project not found or invalid project id provided");
    }
    // 1. Build dynamic filters
    const conditions = ['t.project_id = $1'];
    const params = [projectId];

    // Security: Only super_admin bypasses tenant isolation
    if (userRole !== 'super_admin') {
      conditions.push('t.tenant_id = $2');
      params.push(tenantId);
    }

    let paramIndex = params.length + 1;

    if (status && status !== 'string' && status !== '') {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }

    if (assignedTo) {
      conditions.push(`t.assigned_to = $${paramIndex++}`);
      params.push(assignedTo);
    }

    if (priority) {
      conditions.push(`t.priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (search) {
      conditions.push(`t.title ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    // 2. Main query
    const query = `
      SELECT t.*, u.full_name as assigned_to_name, u.email as assigned_to_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE ${whereClause}
      ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        t.due_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    const result = await pool.query(query, [...params, limit, offset]);

    // 3. Count query (re-uses the same whereClause and params)
    const countQuery = `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    const tasks = result.rows.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: {
        id: task.assigned_to,
        fullName: task.assigned_to_name,
        email: task.assigned_to_email
      },
      dueDate: task.due_date,
      createdAt: task.created_at
    }))
    return {
      success: true,
      message: 'Tasks list retrieved successfully',
      data: {
        tasks: tasks,
        total,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
        },
      },
    };
  } catch (error) {
    logger.error('List tasks failed', { projectId, error: error.message });
    throw error;
  }
};

const updateTaskStatus = async (taskId, status, tenantId, userId) => {
  try {

    const requirements = await pool.query(
      `SELECT tenant_id FROM tasks WHERE id = $1`, [taskId]
    )

    const taskTenantId = requirements.rows[0].tenant_id;

    if (tenantId !== taskTenantId) {
      throw new Error("Task doesn't belongs to user's tenant");
    }


    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [status, new Date(), taskId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error("Task not found");
    }

    logger.info('Task status updated', { taskId, status });

    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'UPDATE_TASK_STATUS', 'task', taskId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    return {
      success: true,
      message: 'Task status updated successfully',
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    };
  } catch (error) {
    logger.error('Update task status failed', { error: error.message });
    throw error;
  }
};

const updateTask = async (taskId, updateData, tenantId, userId) => {
  const client = await pool.connect();
  try {
    // 1. Initial Validation
    const { rows: taskRows } = await client.query('SELECT tenant_id FROM tasks WHERE id = $1', [taskId]);
    if (taskRows.length === 0) throw new Error('Task not found');
    if (taskRows[0].tenant_id !== tenantId) throw new Error("Task doesn't belong to user's tenant");

    if (updateData.dueDate && new Date(updateData.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      throw new Error("Due date cannot be in the past");
    }

    // 2. Dynamic Query Building
    const allowedFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'];
    const updateFields = [];
    const values = [];
    const filteredData = {};
    let counter = 1;

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        const columnName = key === 'assignedTo' ? 'assigned_to' : key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
        let value = (updateData[key] === '' || updateData[key] === null) ? null : updateData[key];

        // Verify assignedTo user belongs to same tenant
        if (key === 'assignedTo' && value) {
          const { rows: userCheck } = await client.query('SELECT id FROM users WHERE id = $1 AND tenant_id = $2', [value, tenantId]);
          if (userCheck.length === 0) throw new Error("assignedTo user doesn't belong to same tenant");
        }

        updateFields.push(`${columnName} = $${counter++}`);
        values.push(value);
        filteredData[key] = value;
      }
    }

    if (updateFields.length === 0) throw new Error('No valid fields to update');

    updateFields.push(`updated_at = $${counter++}`);
    values.push(new Date());
    const taskIdIdx = counter++;
    const tenantIdIdx = counter;
    values.push(taskId, tenantId);

    // 3. Update with CTE to get user details
    const query = `
      WITH updated AS (
        UPDATE tasks 
        SET ${updateFields.join(', ')} 
        WHERE id = $${taskIdIdx} AND tenant_id = $${tenantIdIdx} 
        RETURNING *
      )
      SELECT u.*, us.full_name, us.email 
      FROM updated u
      LEFT JOIN users us ON u.assigned_to = us.id
    `;

    const { rows: resultRows } = await client.query(query, values);
    if (resultRows.length === 0) throw new Error('Task not found');
    const task = resultRows[0];

    // 4. Audit Log (Silent fail)
    try {
      await client.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'UPDATE_TASK', 'task', taskId]
      );
    } catch (e) { logger.error('Audit failed', { error: e.message }); }

    // 5. Handle nested assignedTo object within filteredData
    if (filteredData.hasOwnProperty('assignedTo')) {
      filteredData.assignedTo = task.assigned_to ? {
        id: task.assigned_to,
        fullName: task.full_name,
        email: task.email
      } : null;
    }

    return {
      success: true,
      message: 'Task updated successfully',
      data: {
        id: task.id,
        ...filteredData, // Contains only the fields from req.body
        updatedAt: task.updated_at
      }
    };
  } catch (error) {
    logger.error('Update task failed', { taskId, error: error.message });
    throw error;
  } finally {
    client.release();
  }
};


const deleteTask = async (taskId, tenantId, userId) => {
  try {

    const { rows: taskRows } = await pool.query('SELECT tenant_id FROM tasks WHERE id = $1', [taskId]);
    if (taskRows.length === 0) throw new Error('Task not found');
    if (taskRows[0].tenant_id !== tenantId) throw new Error("Task doesn't belong to user's tenant");

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [taskId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found');
    }

    logger.info('Task deleted', { taskId });

    try {
      await pool.query(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), tenantId, userId, 'DELETE_TASK', 'task', taskId]
      );
    } catch (auditError) {
      logger.error('Failed to create audit log', { error: auditError.message });
    }

    return { success: true, message: 'Task deleted successfully' };
  } catch (error) {
    logger.error('Delete task failed', { error: error.message });
    throw error;
  }
};

const getUserTasks = async (userId) => {
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
