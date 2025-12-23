# Multi-Tenant SaaS Platform - Backend

## 🚀 Quick Start Guide

### Prerequisites
- ✅ PostgreSQL 18.x installed
- ✅ Node.js 20.x or 18.x installed
- ✅ Database `multitenant_saas` created

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env      # Mac/Linux
   ```

2. Update `.env` with your PostgreSQL password:
   ```env
   DB_PASSWORD=your_postgres_password
   ```

### Step 3: Test Database Connection

```bash
npm run test-db
```

Expected output:
```
✅ Database connection successful!
📅 Current time from database: ...
📊 PostgreSQL version: PostgreSQL 18.x
```

### Step 4: Run Migrations

```bash
npm run migrate
```

This will create all 5 tables:
- ✅ tenants
- ✅ users
- ✅ projects
- ✅ tasks
- ✅ audit_logs

### Step 5: Seed Database

```bash
npm run seed
```

This will create:
- 1 Super Admin
- 1 Demo Company (tenant)
- 3 Users (1 admin + 2 regular users)
- 2 Projects
- 5 Tasks

### Step 6: Start Development Server

```bash
npm run dev
```

---

## 📁 Project Structure

```
backend/
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # Dependencies and scripts
├── test-db-connection.js   # Database test script
│
├── migrations/             # Database migrations
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   ├── 003_create_projects.sql
│   ├── 004_create_tasks.sql
│   ├── 005_create_audit_logs.sql
│   └── run-migrations.js
│
├── seeders/                # Seed data
│   ├── seed-super-admin.js
│   ├── seed-tenants.js
│   ├── seed-users.js
│   ├── seed-projects.js
│   ├── seed-tasks.js
│   └── run-seeders.js
│
└── src/
    ├── config/             # Configuration
    │   └── database.js
    ├── db/                 # Database connection
    │   └── pool.js
    ├── middleware/         # Express middleware (TODO)
    ├── routes/             # API routes (TODO)
    ├── controllers/        # Route controllers (TODO)
    ├── services/           # Business logic (TODO)
    └── utils/              # Helper functions (TODO)
```

---

## 🔑 Test Credentials

After running seeders, you can login with:

### Super Admin (Cross-tenant access)
```
Email:    superadmin@system.com
Password: Admin@123
Role:     super_admin
```

### Demo Company - Tenant Admin
```
Email:    admin@demo.com
Password: Demo@123
Role:     tenant_admin
Tenant:   demo
```

### Demo Company - Regular Users
```
User 1:   user1@demo.com / User@123
User 2:   user2@demo.com / User@123
Role:     user
Tenant:   demo
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run test-db` | Test database connection |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Populate database with test data |
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |

---

## 📊 Database Schema

### Tables Created

1. **tenants** - Organization information
   - Columns: id, name, subdomain, status, subscription_plan, max_users, max_projects, timestamps
   
2. **users** - User accounts with tenant association
   - Columns: id, tenant_id, email, password_hash, full_name, role, is_active, timestamps
   - Constraint: UNIQUE(tenant_id, email)
   
3. **projects** - Projects for each tenant
   - Columns: id, tenant_id, name, description, status, created_by, timestamps
   
4. **tasks** - Tasks within projects
   - Columns: id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, timestamps
   
5. **audit_logs** - Security audit trail
   - Columns: id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at

### Foreign Key Relationships

- users.tenant_id → tenants.id (CASCADE DELETE)
- projects.tenant_id → tenants.id (CASCADE DELETE)
- projects.created_by → users.id (SET NULL)
- tasks.project_id → projects.id (CASCADE DELETE)
- tasks.tenant_id → tenants.id (CASCADE DELETE)
- tasks.assigned_to → users.id (SET NULL)
- audit_logs.tenant_id → tenants.id (CASCADE DELETE)
- audit_logs.user_id → users.id (SET NULL)

---

## ❓ Troubleshooting

### Database Connection Failed

**Error:** `connect ECONNREFUSED`

**Solution:**
1. Check if PostgreSQL is running
2. Verify `DB_HOST` and `DB_PORT` in `.env`
3. Check PostgreSQL service status

### Database Does Not Exist

**Error:** `database "multitenant_saas" does not exist`

**Solution:**
```bash
psql -U postgres
CREATE DATABASE multitenant_saas;
\q
```

### Authentication Failed

**Error:** `password authentication failed`

**Solution:**
Update `DB_PASSWORD` in `.env` file with correct PostgreSQL password

### Migration Already Run

If you need to reset the database:

```bash
# Connect to PostgreSQL
psql -U postgres -d multitenant_saas

# Drop all tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

# Exit
\q

# Run migrations again
npm run migrate
npm run seed
```

---

## 📝 Next Steps

1. ✅ Database setup complete
2. ✅ Migrations run successfully
3. ✅ Test data seeded
4. ⏳ Next: Implement API routes (Step 3)
5. ⏳ Next: Implement middleware (Step 3)
6. ⏳ Next: Implement authentication (Step 3)

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running
4. Check `.env` configuration

---

**Status**: ✅ Step 2 Complete - Database Schema Implementation Done!
