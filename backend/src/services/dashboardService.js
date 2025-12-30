const { pool } = require('../db/pool');

exports.getDashboardStats = async (tenantId) => {
  try {
    // Get project count
    const projectQuery = `
      SELECT COUNT(*) as total_projects
      FROM projects
      WHERE tenant_id = $1
    `;
    const projectResult = await pool.query(projectQuery, [tenantId]);
    const totalProjects = parseInt(projectResult.rows[0].total_projects);

    // Get task statistics
    const taskStatsQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'todo' OR status = 'in_progress') as pending_tasks
      FROM tasks
      WHERE tenant_id = $1
    `;
    const taskStatsResult = await pool.query(taskStatsQuery, [tenantId]);
    const taskStats = taskStatsResult.rows[0];

    // Get user count
    const userQuery = `
      SELECT COUNT(*) as total_users
      FROM users
      WHERE tenant_id = $1 AND is_active = true
    `;
    const userResult = await pool.query(userQuery, [tenantId]);
    const totalUsers = parseInt(userResult.rows[0].total_users);

    return {
      totalProjects,
      totalTasks: parseInt(taskStats.total_tasks),
      completedTasks: parseInt(taskStats.completed_tasks),
      pendingTasks: parseInt(taskStats.pending_tasks),
      totalUsers
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};