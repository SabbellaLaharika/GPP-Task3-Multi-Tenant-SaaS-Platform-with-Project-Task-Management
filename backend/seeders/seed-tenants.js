const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating Sample Tenant: Demo Company...');
  
  // Demo Company tenant
  const demoTenantId = uuidv4();
  
  await client.query(`
    INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (subdomain) DO NOTHING
    RETURNING id
  `, [
    demoTenantId,
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,  // Pro plan: 25 users
    15   // Pro plan: 15 projects
  ]);
  
  // Store tenant ID for use in other seeders
  global.demoTenantId = demoTenantId;
  
  console.log('  ✓ Tenant: Demo Company');
  console.log('  ✓ Subdomain: demo');
  console.log('  ✓ Status: active');
  console.log('  ✓ Plan: pro (25 users, 15 projects)');
  console.log(`  ✓ Tenant ID: ${demoTenantId}`);
}

module.exports = { seed };
