const http = require('http');
const { generateToken } = require('./src/utils/jwt');
const { pool } = require('./src/db/pool');

async function run() {
    const users = await pool.query('SELECT * FROM users LIMIT 1');
    let token = 'invalid-token';
    if (users.rows.length > 0) {
        const user = users.rows[0];
        token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
        });
        console.log('Testing with valid token for user:', user.email);
    } else {
        console.log('No users found in db, testing with dummy token');
    }

    const cases = [
        { name: 'No token', headers: {} },
        { name: 'Invalid token', headers: { 'Authorization': 'Bearer bad-token' } },
        { name: 'Valid token', headers: { 'Authorization': 'Bearer ' + token } },
    ];

    for (const c of cases) {
        console.log(`\n--- ${c.name} ---`);
        await new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/me',
                method: 'GET',
                headers: c.headers
            }, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        console.log(JSON.stringify(JSON.parse(body), null, 2));
                    } catch (e) { console.log(body); }
                    resolve();
                });
            });
            req.on('error', (e) => {
                console.error(`Problem with request: ${e.message}`);
                resolve();
            });
            req.end();
        });
    }
    process.exit(0);
}
run().catch(console.error);
