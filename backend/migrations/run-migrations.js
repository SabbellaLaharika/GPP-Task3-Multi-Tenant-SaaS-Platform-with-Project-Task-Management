const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/pool');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...\n');
    console.log('=' .repeat(60));
    
    // Get all migration files in order
    const migrationFiles = [
      '001_create_tenants.sql',
      '002_create_users.sql',
      '003_create_projects.sql',
      '004_create_tasks.sql',
      '005_create_audit_logs.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        continue;
      }
      
      console.log(`\n📝 Running migration: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All migrations completed successfully!\n');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables created in database:');
    console.log('-'.repeat(60));
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name.padEnd(20)} (${row.column_count} columns)`);
    });
    console.log('-'.repeat(60));
    
    // Show foreign key relationships
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `);
    
    console.log('\n🔗 Foreign Key Relationships:');
    console.log('-'.repeat(60));
    fkResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    console.log('-'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✅ Migration process completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed!\n');
    process.exit(1);
  });
