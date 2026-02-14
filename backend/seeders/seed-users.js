const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating Users for Demo Company...');

  const tenantId = global.demoTenantId;

  if (!tenantId) {
    console.error('  ❌ Demo tenant ID not found! Run seed-tenants first.');
    return;
  }

  // Hash passwords
  const adminPassword = await bcrypt.hash('Demo@123', 10);
  const user1Password = await bcrypt.hash('User@123', 10);
  const user2Password = await bcrypt.hash('User@123', 10);

  // 1. Tenant Admin for Demo Company
  const adminId = uuidv4();
  await client.query(`
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, email) DO NOTHING
  `, [
    adminId,
    tenantId,
    'admin@demo.com',
    adminPassword,
    'Demo Admin',
    'tenant_admin',
    true
  ]);

  // Audit Log for Admin Creation
  await client.query(`
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    tenantId,
    null, // System action / Super Admin
    'CREATE_USER',
    'user',
    adminId,
    'system-seed'
  ]);

  console.log('  ✓ Tenant Admin: admin@demo.com / Demo@123');
  global.demoAdminId = adminId;

  // 2. Regular User 1 for Demo Company
  const user1Id = uuidv4();
  await client.query(`
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, email) DO NOTHING
  `, [
    user1Id,
    tenantId,
    'user1@demo.com',
    user1Password,
    'Demo User 1',
    'user',
    true
  ]);

  // Audit Log for User 1 Creation
  await client.query(`
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    tenantId,
    adminId, // Created by Admin
    'CREATE_USER',
    'user',
    user1Id,
    'system-seed'
  ]);

  console.log('  ✓ Regular User 1: user1@demo.com / User@123');
  global.demoUser1Id = user1Id;

  // 3. Regular User 2 for Demo Company
  const user2Id = uuidv4();
  await client.query(`
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, email) DO NOTHING
  `, [
    user2Id,
    tenantId,
    'user2@demo.com',
    user2Password,
    'Demo User 2',
    'user',
    true
  ]);

  // Audit Log for User 2 Creation
  await client.query(`
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
  `, [
    uuidv4(),
    tenantId,
    adminId, // Created by Admin
    'CREATE_USER',
    'user',
    user2Id,
    'system-seed'
  ]);

  console.log('  ✓ Regular User 2: user2@demo.com / User@123');
  global.demoUser2Id = user2Id;

  console.log('  ✓ Total users created: 3 (1 admin + 2 users)');
}

module.exports = { seed };
