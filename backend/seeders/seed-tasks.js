const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating 5 Sample Tasks distributed across projects...');
  
  const tenantId = global.demoTenantId;
  const user1Id = global.demoUser1Id;
  const user2Id = global.demoUser2Id;
  const projects = global.demoProjects;
  
  if (!tenantId || !user1Id || !user2Id || !projects || projects.length < 2) {
    console.error('  ❌ Required IDs not found!');
    return;
  }
  
  const [project1Id, project2Id] = projects;
  
  // Calculate due dates (future dates)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  
  // Task 1: Website Redesign - Design Homepage
  await client.query(`
    INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    project1Id,
    tenantId,
    'Design Homepage Layout',
    'Create wireframes and mockups for the new homepage design',
    'in_progress',
    'high',
    user1Id,
    nextWeek
  ]);
  console.log('  ✓ Task 1: Design Homepage Layout (Project 1, assigned to User 1)');
  
  // Task 2: Website Redesign - Implement Navigation
  await client.query(`
    INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    project1Id,
    tenantId,
    'Implement Navigation Menu',
    'Develop responsive navigation menu with dropdown support',
    'todo',
    'medium',
    user2Id,
    twoWeeks
  ]);
  console.log('  ✓ Task 2: Implement Navigation Menu (Project 1, assigned to User 2)');
  
  // Task 3: Website Redesign - Content Migration
  await client.query(`
    INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    project1Id,
    tenantId,
    'Migrate Content to New CMS',
    'Transfer all existing content to the new content management system',
    'todo',
    'low',
    null,  // Unassigned
    null   // No due date yet
  ]);
  console.log('  ✓ Task 3: Migrate Content to New CMS (Project 1, unassigned)');
  
  // Task 4: Mobile App - Setup Development Environment
  await client.query(`
    INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    project2Id,
    tenantId,
    'Setup Development Environment',
    'Configure React Native, dependencies, and build tools',
    'completed',
    'high',
    user1Id,
    today
  ]);
  console.log('  ✓ Task 4: Setup Development Environment (Project 2, assigned to User 1)');
  
  // Task 5: Mobile App - Design App Interface
  await client.query(`
    INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    project2Id,
    tenantId,
    'Design Mobile App Interface',
    'Create UI designs for all main screens following iOS and Android guidelines',
    'in_progress',
    'high',
    user2Id,
    nextWeek
  ]);
  console.log('  ✓ Task 5: Design Mobile App Interface (Project 2, assigned to User 2)');
  
  console.log('  ✓ Total tasks created: 5');
  console.log('  ✓ Distribution: 3 tasks in Project 1, 2 tasks in Project 2');
  console.log('  ✓ Status: 1 completed, 2 in_progress, 2 todo');
}

module.exports = { seed };
