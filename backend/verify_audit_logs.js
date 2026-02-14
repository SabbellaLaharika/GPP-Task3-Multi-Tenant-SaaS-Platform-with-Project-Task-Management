const { pool } = require('./src/db/pool');

async function checkAuditLogs() {
    try {
        const client = await pool.connect();

        // Check recent logs (last 5 mins)
        const res = await client.query(`
      SELECT action, entity_type, created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

        console.log('Recent Audit Logs:');
        res.rows.forEach(r => console.log(`- ${r.action} on ${r.entity_type} at ${r.created_at}`));

        client.release();
    } catch (e) {
        console.error('Error checking logs:', e);
    } finally {
        await pool.end();
    }
}

checkAuditLogs();
