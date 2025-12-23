const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed(client) {
  console.log('  Creating Super Admin Account...');
  
  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  // Super Admin data (not associated with any tenant)
  const superAdminId = uuidv4();
  
  await client.query(`
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at)
    VALUES ($1, NULL, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, email) DO NOTHING
  `, [
    superAdminId,
    'superadmin@system.com',
    hashedPassword,
    'Super Administrator',
    'super_admin',
    true
  ]);
  
  console.log('  ✓ Super Admin: superadmin@system.com / Admin@123');
  console.log('  ✓ Role: super_admin');
  console.log('  ✓ Not associated with any tenant');
}

module.exports = { seed };
