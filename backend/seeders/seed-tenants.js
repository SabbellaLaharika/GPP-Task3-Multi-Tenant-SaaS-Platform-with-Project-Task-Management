const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating Sample Tenant: Demo Company...');

  // Demo Company tenant
  const demoTenantId = uuidv4();

  const res = await client.query(`
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

  if (res.rows.length > 0) {
    // New tenant created
    global.demoTenantId = res.rows[0].id;

    // Audit Log for Tenant Creation (only if new)
    await client.query(`
        INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
      uuidv4(),
      global.demoTenantId,
      null, // System action
      'CREATE_TENANT',
      'tenant',
      global.demoTenantId,
      'system-seed'
    ]);
  } else {
    // Tenant exists, get its ID from DB (NOT from the new uuidv4)
    console.log('  ➜ Tenant "Demo Company" already exists, retrieving ID...');
    const existing = await client.query('SELECT id FROM tenants WHERE subdomain = $1', ['demo']);
    global.demoTenantId = existing.rows[0].id;
  }

  console.log('  ✓ Tenant: Demo Company');
  console.log('  ✓ Subdomain: demo');
  console.log('  ✓ Status: active');
  console.log('  ✓ Plan: pro (25 users, 15 projects)');
  console.log(`  ✓ Tenant ID: ${demoTenantId} `);
}

module.exports = { seed };
