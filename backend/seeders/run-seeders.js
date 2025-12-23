const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/pool');

async function runSeeders() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('=' .repeat(60));
    
    // Get all seed files in order
    const seederFiles = [
      'seed-super-admin.js',
      'seed-tenants.js',
      'seed-users.js',
      'seed-projects.js',
      'seed-tasks.js'
    ];
    
    for (const file of seederFiles) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        continue;
      }
      
      console.log(`\n📝 Running seeder: ${file}`);
      console.log('-'.repeat(60));
      const seeder = require(filePath);
      await seeder.seed(client);
      console.log('-'.repeat(60));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All seeders completed successfully!\n');
    
    // Display summary
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as tenants,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM tasks) as tasks,
        (SELECT COUNT(*) FROM audit_logs) as audit_logs
    `);
    
    console.log('📊 Database Summary:');
    console.log('-'.repeat(60));
    console.log(`  ✓ Tenants:     ${counts.rows[0].tenants}`);
    console.log(`  ✓ Users:       ${counts.rows[0].users}`);
    console.log(`  ✓ Projects:    ${counts.rows[0].projects}`);
    console.log(`  ✓ Tasks:       ${counts.rows[0].tasks}`);
    console.log(`  ✓ Audit Logs:  ${counts.rows[0].audit_logs}`);
    console.log('-'.repeat(60));
    
    // Display login credentials
    console.log('\n🔑 Test Credentials:');
    console.log('-'.repeat(60));
    console.log('Super Admin:');
    console.log('  Email:    superadmin@system.com');
    console.log('  Password: Admin@123');
    console.log('  Role:     super_admin\n');
    
    console.log('Demo Company - Tenant Admin:');
    console.log('  Email:    admin@demo.com');
    console.log('  Password: Demo@123');
    console.log('  Role:     tenant_admin\n');
    
    console.log('Demo Company - Regular Users:');
    console.log('  User 1:   user1@demo.com / User@123');
    console.log('  User 2:   user2@demo.com / User@123');
    console.log('-'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Seeding failed!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeders
runSeeders()
  .then(() => {
    console.log('\n✅ Seeding process completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed!\n');
    process.exit(1);
  });
