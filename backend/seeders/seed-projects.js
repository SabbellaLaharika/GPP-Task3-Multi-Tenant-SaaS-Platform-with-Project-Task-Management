const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating 2 Sample Projects for Demo Company...');
  
  const tenantId = global.demoTenantId;
  const adminId = global.demoAdminId;
  
  if (!tenantId || !adminId) {
    console.error('  ❌ Demo tenant or admin ID not found!');
    return;
  }
  
  const projects = [];
  
  // Project 1: Website Redesign
  const project1Id = uuidv4();
  await client.query(`
    INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
  `, [
    project1Id,
    tenantId,
    'Website Redesign',
    'Complete redesign of company website with modern UI/UX',
    'active',
    adminId
  ]);
  
  console.log('  ✓ Project 1: Website Redesign (active)');
  projects.push(project1Id);
  
  // Project 2: Mobile App Development
  const project2Id = uuidv4();
  await client.query(`
    INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
  `, [
    project2Id,
    tenantId,
    'Mobile App Development',
    'Native mobile application for iOS and Android platforms',
    'active',
    adminId
  ]);
  
  console.log('  ✓ Project 2: Mobile App Development (active)');
  projects.push(project2Id);
  
  // Store for tasks seeder
  global.demoProjects = projects;
  
  console.log('  ✓ Total projects created: 2');
}

module.exports = { seed };
