const { pool } = require('./src/db/pool');

async function testConnection() {
  console.log('🔍 Testing PostgreSQL database connection...\n');
  
  try {
    // Get a client from the pool
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query - get current timestamp
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('\n📅 Current time from database:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    
    // Release the client back to the pool
    client.release();
    
    // Check pool status
    console.log('\n📊 Connection Pool Status:');
    console.log('   Total connections:', pool.totalCount);
    console.log('   Idle connections:', pool.idleCount);
    console.log('   Waiting requests:', pool.waitingCount);
    
    console.log('\n🎉 Database test completed successfully!');
    
    // End the pool
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database connection test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check if PostgreSQL is running');
      console.error('   2. Verify DB_HOST and DB_PORT in .env file');
      console.error('   3. Check PostgreSQL service status');
    } else if (error.code === '3D000') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Database does not exist');
      console.error('   2. Run: psql -U postgres');
      console.error('   3. Then: CREATE DATABASE multitenant_saas;');
    } else if (error.code === '28P01') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Incorrect password');
      console.error('   2. Update DB_PASSWORD in .env file');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
