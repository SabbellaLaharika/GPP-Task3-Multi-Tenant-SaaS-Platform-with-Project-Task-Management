const baseUrl = 'http://localhost:5000/api';

async function runTests() {
    console.log('🚀 Starting Full API Verification (APIs 1-19)...\n');

    // 0. Health Check
    try {
        const res = await fetch(`${baseUrl}/health`);
        if (res.status === 200) console.log(`✅ [Health] Status: ${res.status} ${res.statusText}`);
        else { console.error('❌ Backend not reachable!'); process.exit(1); }
    } catch (e) {
        console.error('❌ Backend not reachable!');
        process.exit(1);
    }

    let adminToken, userToken, superToken, tenantId, userId, projectId, taskId;
    const uniqueSubdomain = `verify${Date.now()}`;
    const uniqueEmail = `admin@${uniqueSubdomain}.com`;

    // API 1: Register Tenant
    try {
        console.log('\n👉 [API 1] Testing Register Tenant...');
        const res = await fetch(`${baseUrl}/auth/register-tenant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantName: 'Verify Tenant',
                subdomain: uniqueSubdomain,
                adminEmail: uniqueEmail,
                adminPassword: 'Test@123',
                adminFullName: 'Verify Admin'
            })
        });
        const data = await res.json();
        if (res.status === 201 && data.success) {
            console.log(`✅ [API 1] Register Tenant Successful (${uniqueSubdomain})`);
        } else {
            console.error('❌ [API 1] Register Tenant Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 1] Error:', e.message); }

    // API 2: Login
    try {
        console.log('\n👉 [API 2] Testing Login...');
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'Test@123',
                tenantSubdomain: uniqueSubdomain
            })
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ [API 2] Login Successful');
            adminToken = data.data.token;
            tenantId = data.data.user.tenantId;
        } else {
            console.error('❌ [API 2] Login Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 2] Error:', e.message); }

    if (!adminToken) { console.error('❌ Cannot proceed without Admin Token'); return; }

    // API 3: Get Current User
    try {
        console.log('\n👉 [API 3] Testing Get Current User...');
        const res = await fetch(`${baseUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            console.log('✅ [API 3] Get Current User Successful');
        } else {
            console.error('❌ [API 3] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 3] Error:', e.message); }

    // API 5: Get Tenant Details (Moved before Logout)
    try {
        console.log('\n👉 [API 5] Testing Get Tenant Details...');
        const res = await fetch(`${baseUrl}/tenants/${tenantId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            console.log('✅ [API 5] Get Tenant Details Successful');
        } else {
            console.error('❌ [API 5] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 5] Error:', e.message); }

    // API 6: Update Tenant
    try {
        console.log('\n👉 [API 6] Testing Update Tenant...');
        const res = await fetch(`${baseUrl}/tenants/${tenantId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Updated Verify Tenant' })
        });
        const data = await res.json();
        if (res.status === 200 && data.success && data.data.name === 'Updated Verify Tenant') {
            console.log('✅ [API 6] Update Tenant Successful');
        } else {
            console.error('❌ [API 6] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 6] Error:', e.message); }

    // API 7: List All Tenants (Super Admin)
    try {
        console.log('\n👉 [API 7] Testing List All Tenants (Super Admin)...');
        // Login as Super Admin first
        const resLogin = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@system.com',
                password: 'Admin@123'
            })
        });
        const dataLogin = await resLogin.json();
        if (dataLogin.success && dataLogin.data.user.role === 'super_admin') {
            superToken = dataLogin.data.token;
            const res = await fetch(`${baseUrl}/super-admin/tenants?page=1&limit=5`, { // Adjusted URL to match superAdminRoutes
                headers: { 'Authorization': `Bearer ${superToken}` }
            });
            const data = await res.json();
            if (res.status === 200 && data.success) {
                console.log(`✅ [API 7] List All Tenants Successful (Total: ${data.data.totalTenants})`);
            } else {
                console.error('❌ [API 7] Failed:', data.message);
            }
        } else {
            console.error('⚠️ [API 7] Skipped - Super Admin Login Failed (Ensure seed ran)');
        }
    } catch (e) { console.error('❌ [API 7] Error:', e.message); }

    // API 8: Create User
    try {
        console.log('\n👉 [API 8] Testing Create User...');
        const userEmail = `user${Date.now()}@${uniqueSubdomain}.com`;
        const res = await fetch(`${baseUrl}/tenants/${tenantId}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: 'User@123',
                fullName: 'Test User',
                role: 'user'
            })
        });
        const data = await res.json();
        if (res.status === 201 && data.success) {
            console.log('✅ [API 8] Create User Successful');
            userId = data.data.id;
        } else {
            console.error('❌ [API 8] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 8] Error:', e.message); }

    // API 9: List All Users
    try {
        console.log('\n👉 [API 9] Testing List All Users...');
        const res = await fetch(`${baseUrl}/tenants/${tenantId}/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            console.log(`✅ [API 9] List All Users Successful (Total: ${data.data.total})`);
        } else {
            console.error('❌ [API 9] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 9] Error:', e.message); }

    // API 10: Update User
    if (userId) {
        try {
            console.log(`\n👉 [API 10] Testing Update User (${userId})...`);
            const res = await fetch(`${baseUrl}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName: 'Updated User Name' })
            });
            const data = await res.json();
            if (res.status === 200 && data.success && data.data.full_name === 'Updated User Name') {
                console.log('✅ [API 10] Update User Successful');
            } else {
                console.error('❌ [API 10] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 10] Error:', e.message); }
    }

    // API 12: Create Project (Order swapped with Delete User for flow)
    try {
        console.log('\n👉 [API 12] Testing Create Project...');
        const res = await fetch(`${baseUrl}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Verify Project',
                description: 'Project for verification',
                status: 'active'
            })
        });
        const data = await res.json();
        if (res.status === 201 && data.success) {
            console.log('✅ [API 12] Create Project Successful');
            projectId = data.data.id;
        } else {
            console.error('❌ [API 12] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 12] Error:', e.message); }

    // API 13: List All Projects
    try {
        console.log('\n👉 [API 13] Testing List All Projects...');
        const res = await fetch(`${baseUrl}/projects`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            console.log(`✅ [API 13] List All Projects Successful (Total: ${data.data.total})`);
        } else {
            console.error('❌ [API 13] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 13] Error:', e.message); }

    // API 14: Update Project
    if (projectId) {
        try {
            console.log(`\n👉 [API 14] Testing Update Project (${projectId})...`);
            const res = await fetch(`${baseUrl}/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: 'Updated Verify Project' })
            });
            const data = await res.json();
            if (res.status === 200 && data.success && data.data.name === 'Updated Verify Project') {
                console.log('✅ [API 14] Update Project Successful');
            } else {
                console.error('❌ [API 14] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 14] Error:', e.message); }
    }

    // API 16: Create Task
    if (projectId) {
        try {
            console.log('\n👉 [API 16] Testing Create Task...');
            const res = await fetch(`${baseUrl}/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Verify Task',
                    priority: 'medium',
                    status: 'todo',
                    assignedTo: userId || null // Assign to user if created
                })
            });
            const data = await res.json();
            if (data.success) {
                console.log('✅ [API 16] Create Task Successful');
                taskId = data.data.id;
            } else {
                console.error('❌ [API 16] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 16] Error:', e.message); }
    }

    // API 17: List All Tasks
    if (projectId) {
        try {
            console.log('\n👉 [API 17] Testing List All Tasks...');
            const res = await fetch(`${baseUrl}/projects/${projectId}/tasks`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (res.status === 200 && data.success) {
                console.log(`✅ [API 17] List All Tasks Successful (Total: ${data.data.total})`);
            } else {
                console.error('❌ [API 17] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 17] Error:', e.message); }
    }

    // API 18: Update Task Status
    if (taskId) {
        try {
            console.log(`\n👉 [API 18] Testing Update Task Status (${taskId})...`);
            const res = await fetch(`${baseUrl}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'in_progress' })
            });
            const data = await res.json();
            if (res.status === 200 && data.success && data.data.status === 'in_progress') {
                console.log('✅ [API 18] Update Task Status Successful');
            } else {
                console.error('❌ [API 18] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 18] Error:', e.message); }
    }

    // API 19: Update Task
    if (taskId) {
        try {
            console.log(`\n👉 [API 19] Testing Update Task (${taskId})...`);
            const res = await fetch(`${baseUrl}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'Updated Verify Task' })
            });
            const data = await res.json();
            if (res.status === 200 && data.success && data.data.title === 'Updated Verify Task') {
                console.log('✅ [API 19] Update Task Successful');
            } else {
                console.error('❌ [API 19] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 19] Error:', e.message); }
    }

    // API 20 (Delete Task - Added as per routes list)
    if (taskId) {
        try {
            // Note: API 20 Delete Task is in the list, though user asked for "19 apis". 
            // Assuming "19" meant the list ending at 19, or maybe a miscount. 
            // Better to include Delete Task for cleanup if it exists in routes.
            // But strict 1-19 means we stop at Update Task. 
            // However, typical CRUD includes Delete. 
            // The file shows "20: Delete Task".
            // I will test it as extra or skip?
            // User said "verify all 19 apis". I will stop at 19 explicitly as requested?
            // Actually, API 11 and 15 are deletes. Let's do 15 (Project) and 11 (User) now for cleanup.
        } catch (e) { }
    }

    // API 15: Delete Project
    if (projectId) {
        try {
            console.log(`\n👉 [API 15] Testing Delete Project (${projectId})...`);
            const res = await fetch(`${baseUrl}/projects/${projectId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (res.status === 200 && data.success) {
                console.log('✅ [API 15] Delete Project Successful');
            } else {
                console.error('❌ [API 15] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 15] Error:', e.message); }
    }

    // API 11: Delete User
    if (userId) {
        try {
            console.log(`\n👉 [API 11] Testing Delete User (${userId})...`);
            const res = await fetch(`${baseUrl}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (res.status === 200 && data.success) {
                console.log('✅ [API 11] Delete User Successful');
            } else {
                console.error('❌ [API 11] Failed:', data.message);
            }
        } catch (e) { console.error('❌ [API 11] Error:', e.message); }
    }

    // API 4: Logout
    try {
        console.log('\n👉 [API 4] Testing Logout...');
        const res = await fetch(`${baseUrl}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            console.log('✅ [API 4] Logout Successful');
        } else {
            console.error('❌ [API 4] Failed:', data.message);
        }
    } catch (e) { console.error('❌ [API 4] Error:', e.message); }

    console.log('\n✨ Full Verification Complete.');
}

runTests();
