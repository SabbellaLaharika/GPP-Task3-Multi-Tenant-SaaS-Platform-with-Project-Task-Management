const { pool } = require('../db/pool');

// Get system-wide statistics (ALL tenants combined)
exports.getSystemStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM tenants) as total_tenants,
      (SELECT COUNT(*) FROM tenants WHERE status = 'active') as active_tenants,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM tasks) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'completed') as completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') as in_progress_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'todo') as todo_tasks,
      (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users
  `;

  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get all tenants with their statistics
exports.getAllTenantsWithStats = async ({ page = 1, limit = 100 }) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT 
      t.id,
      t.name,
      t.subdomain,
      t.status,
      t.subscription_plan,
      t.max_users,
      t.max_projects,
      t.created_at,
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT p.id) as total_projects,
      COUNT(DISTINCT tk.id) as total_tasks
    FROM tenants t
    LEFT JOIN users u ON t.id = u.tenant_id AND u.is_active = true
    LEFT JOIN projects p ON t.id = p.tenant_id
    LEFT JOIN tasks tk ON t.id = tk.tenant_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) as total FROM tenants`;

  try {
    const [tenantsResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    return {
      tenants: tenantsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get all projects with their statistics
exports.getAllProjects = async ({ page = 1, limit = 100 }) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at,
      p.tenant_id as tenant_id,
      t.name as tenant_name,
      COUNT(DISTINCT tk.id) as total_tasks
    FROM projects p
    LEFT JOIN tenants t ON p.tenant_id = t.id
    LEFT JOIN tasks tk ON p.id = tk.project_id
    GROUP BY p.id, t.name
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) as total FROM projects`;

  try {
    const [projectsResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);
    return {
      projects: projectsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};