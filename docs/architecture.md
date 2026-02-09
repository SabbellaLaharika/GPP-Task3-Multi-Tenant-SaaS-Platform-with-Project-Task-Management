# Architecture Document
## Multi-Tenant SaaS Platform - Project & Task Management

**Version**: 1.0  
**Date**: December 2025 
**Status**: Approved for Development

---

## 📑 Table of Contents

1. [🏗️ System Architecture](#️-system-architecture)
2. [🗄️ Database Schema Design](#️-database-schema-design)
3. [🔌 API Architecture](#-api-architecture)

---

## 🏗️ System Architecture

### High-Level Architecture Overview

Our multi-tenant SaaS platform follows a standard three-tier web application architecture with clear separation of concerns.

![System Architecture](images/system-architecture.png)


### 🔄 Request Flow Example

**Scenario**: User creates a new task in a project

```
1. Frontend (React)
   ↓
   POST /api/tasks
   Headers: { Authorization: "Bearer <JWT>" }
   Body: { project_id: "123", title: "Fix bug", status: "todo" }
   
2. Backend Middleware Chain
   ↓
   a) CORS → Check origin allowed
   b) Body Parser → Parse JSON body
   c) Logger → Log request details
   d) JWT Auth → Verify token, extract user_id, tenant_id, role
   e) Multi-Tenancy → Attach tenant_id to request context
   f) Authorization → Check user has access to project
   g) Validation → Validate request body fields
   
3. Route Handler → TaskController.createTask()
   ↓
   a) Extract data from request
   b) Call TaskService.createTask()
   
4. Business Logic (TaskService)
   ↓
   a) Verify project exists and belongs to tenant
   b) Check subscription limits
   c) Create task record with tenant_id
   d) Log action to audit_logs
   
5. Database Query
   ↓
   INSERT INTO tasks (tenant_id, project_id, title, status, created_by)
   VALUES ($1, $2, $3, $4, $5)
   
6. Response Path (Back to client)
   ↓
   Backend → JSON response: { success: true, data: { task } }
   ↓
   Frontend → Update UI with new task
```

### 🔐 Authentication Flow

```
┌─────────────┐                                   ┌─────────────┐
│   Client    │                                   │   Backend   │
│  (React)    │                                   │  (Express)  │
└──────┬──────┘                                   └──────┬──────┘
       │                                                 │
       │  POST /api/auth/login                          │
       │  { email, password }                           │
       ├────────────────────────────────────────────────>│
       │                                                 │
       │                                    1. Validate credentials
       │                                    2. Hash password check (bcrypt)
       │                                    3. Generate JWT token
       │                                       Payload: {
       │                                         user_id: "uuid",
       │                                         tenant_id: "uuid",
       │                                         role: "user",
       │                                         exp: timestamp
       │                                       }
       │                                                 │
       │  200 OK                                        │
       │  { success: true, data: { token, user } }     │
       │<────────────────────────────────────────────────┤
       │                                                 │
       │  Store token in localStorage/context           │
       │                                                 │
       │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
       │                                                 │
       │  Subsequent Requests:                          │
       │  GET /api/projects                             │
       │  Authorization: Bearer <token>                 │
       ├────────────────────────────────────────────────>│
       │                                                 │
       │                                    1. Verify JWT signature
       │                                    2. Check expiry
       │                                    3. Extract tenant_id
       │                                    4. Filter: WHERE tenant_id = ?
       │                                                 │
       │  200 OK                                        │
       │  { success: true, data: [projects] }          │
       │<────────────────────────────────────────────────┤
       │                                                 │
```

### 🏢 Multi-Tenancy Implementation

**Data Isolation Strategy:**

```javascript
// Middleware: Extract tenant context from JWT
async function multiTenancyMiddleware(req, res, next) {
  // JWT already verified by authMiddleware
  const { tenant_id, role } = req.user;
  
  if (role === 'super_admin') {
    // Super admins can access any tenant
    req.tenantId = null; // No filter
  } else {
    // Regular users and tenant admins: filter by their tenant
    req.tenantId = tenant_id;
  }
  
  next();
}

// Example: Get all projects (automatically filtered)
async function getProjects(req, res) {
  const tenantId = req.tenantId;
  
  let query = 'SELECT * FROM projects';
  let params = [];
  
  if (tenantId) {
    query += ' WHERE tenant_id = $1';
    params.push(tenantId);
  }
  
  const projects = await db.query(query, params);
  res.json({ success: true, data: projects });
}
```

### 🐳 Docker Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   frontend      │  │    backend      │  │   database   │  │
│  │                 │  │                 │  │              │  │
│  │  React App      │  │  Node.js API    │  │ PostgreSQL   │  │
│  │  Port: 3000     │  │  Port: 5000     │  │ Port: 5432   │  │
│  │  (nginx serve)  │  │                 │  │              │  │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │
│           │                    │                   │           │
│           │  API Calls         │  DB Queries       │           │
│           │ http://backend:5000│ postgres://db:5432│           │
│           └────────────────────┴───────────────────┘           │
│                                                                 │
│  Volume Mounts:                                                │
│  • postgres-data:/var/lib/postgresql/data (persistence)       │
│                                                                 │
│  Environment Variables:                                        │
│  • Backend: DATABASE_URL, JWT_SECRET, PORT                    │
│  • Frontend: REACT_APP_API_URL                                │
│  • Database: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### Entity Relationship Diagram (ERD)

![Database ERD](images/database-erd.png)

### Table Definitions

#### 📋 Table: `tenants`

Stores organization/company information. Each tenant represents one customer organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique tenant identifier |
| name | VARCHAR(255) | NOT NULL | Organization name |
| subdomain | VARCHAR(100) | UNIQUE, NOT NULL | Unique subdomain (e.g., 'acme') |
| subscription_plan | VARCHAR(50) | NOT NULL, DEFAULT 'free' | Plan: free, pro, enterprise |
| max_users | INTEGER | NOT NULL, DEFAULT 5 | Maximum users allowed |
| max_projects | INTEGER | NOT NULL, DEFAULT 3 | Maximum projects allowed |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Status: active, suspended, deleted |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `subdomain`

---

#### 👥 Table: `users`

Stores all user accounts across all tenants. Super admins have `tenant_id = NULL`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| tenant_id | UUID | FOREIGN KEY → tenants(id), NULLABLE | Tenant association (NULL for super_admin) |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role | VARCHAR(50) | NOT NULL | Role: super_admin, tenant_admin, user |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Status: active, inactive |
| last_login | TIMESTAMP | NULLABLE | Last successful login |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraints:**
- UNIQUE (tenant_id, email) - Email unique per tenant, not globally
- FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `email`

---

#### 📁 Table: `projects`

Stores projects within each tenant. All projects belong to a tenant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique project identifier |
| tenant_id | UUID | FOREIGN KEY → tenants(id), NOT NULL | Owner tenant |
| created_by | UUID | FOREIGN KEY → users(id), NOT NULL | User who created project |
| name | VARCHAR(255) | NOT NULL | Project name |
| description | TEXT | NULLABLE | Project description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Status: active, archived |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraints:**
- FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `created_by`

---

#### ✅ Table: `tasks`

Stores tasks within projects. Tasks belong to projects and tenants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique task identifier |
| tenant_id | UUID | FOREIGN KEY → tenants(id), NOT NULL | Owner tenant |
| project_id | UUID | FOREIGN KEY → projects(id), NOT NULL | Parent project |
| created_by | UUID | FOREIGN KEY → users(id), NOT NULL | User who created task |
| assigned_to | UUID | FOREIGN KEY → users(id), NULLABLE | Assigned user (can be NULL) |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULLABLE | Task description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'todo' | Status: todo, in_progress, done |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | Priority: low, medium, high |
| due_date | DATE | NULLABLE | Task due date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraints:**
- FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
- FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `project_id`
- INDEX on `assigned_to`
- INDEX on `created_by`

---

#### 📋 Table: `audit_logs`

Immutable log of all important actions for security and compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| user_id | UUID | FOREIGN KEY → users(id), NULLABLE | User who performed action |
| tenant_id | UUID | FOREIGN KEY → tenants(id), NULLABLE | Tenant context |
| action | VARCHAR(100) | NOT NULL | Action type (CREATE_USER, UPDATE_PROJECT, etc.) |
| entity_type | VARCHAR(50) | NOT NULL | Entity type (user, project, task, tenant) |
| entity_id | UUID | NULLABLE | ID of affected entity |
| ip_address | VARCHAR(45) | NULLABLE | IP address of request |
| user_agent | TEXT | NULLABLE | Browser/client user agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
- **NO UPDATE OR DELETE allowed** - Logs are immutable

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `user_id`
- INDEX on `created_at` (for time-based queries)
- INDEX on `action`

---

### 🔑 Database Constraints Summary

**Referential Integrity:**
- All `tenant_id` foreign keys use `ON DELETE CASCADE` - Deleting a tenant removes all associated data
- All `user_id` foreign keys use `ON DELETE SET NULL` - Deleting a user doesn't delete their created entities

**Unique Constraints:**
- `tenants.subdomain` - Globally unique
- `(users.tenant_id, users.email)` - Email unique per tenant, same email can exist in different tenants

**Check Constraints:**
- `users.role` - Must be one of: super_admin, tenant_admin, user
- `users.status` - Must be one of: active, inactive
- `projects.status` - Must be one of: active, archived
- `tasks.status` - Must be one of: todo, in_progress, done
- `tasks.priority` - Must be one of: low, medium, high
- `tenants.subscription_plan` - Must be one of: free, pro, enterprise

---

## 🔌 API Architecture

### API Endpoint Organization

All API endpoints follow RESTful conventions and are organized by resource type.

**Base URL**: `http://localhost:5000/api`

### 📊 Complete API Endpoint List

#### 🔐 Authentication Endpoints (Public)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/auth/register` | Register new tenant with admin user | ❌ No | None |
| POST | `/api/auth/login` | Login user and receive JWT token | ❌ No | None |

**Endpoint Details:**

##### POST `/api/auth/register`
Register a new tenant organization with an initial admin user.

**Request Body:**
```json
{
  "companyName": "Acme Corp",
  "subdomain": "acme",
  "adminName": "John Doe",
  "adminEmail": "john@acme.com",
  "adminPassword": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp",
      "subdomain": "acme",
      "subscription_plan": "free"
    },
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "tenant_admin"
    },
    "token": "jwt-token-here"
  }
}
```

##### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@acme.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "tenant_admin",
      "tenant_id": "uuid"
    }
  }
}
```

---

#### 🏢 Tenant Management Endpoints (Super Admin Only)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/tenants` | List all tenants (paginated) | ✅ Yes | super_admin |
| GET | `/api/tenants/:id` | Get tenant details | ✅ Yes | super_admin |
| PUT | `/api/tenants/:id` | Update tenant | ✅ Yes | super_admin |
| DELETE | `/api/tenants/:id` | Delete tenant (cascades all data) | ✅ Yes | super_admin |

**Endpoint Details:**

##### GET `/api/tenants`
Get paginated list of all tenants.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (active, suspended)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "Acme Corp",
        "subdomain": "acme",
        "subscription_plan": "pro",
        "status": "active",
        "user_count": 15,
        "project_count": 8,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

##### GET `/api/tenants/:id`
Get detailed information for a specific tenant.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "subdomain": "acme",
    "subscription_plan": "pro",
    "max_users": 25,
    "max_projects": 15,
    "current_users": 18,
    "current_projects": 10,
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-12-20T15:30:00Z"
  }
}
```

##### PUT `/api/tenants/:id`
Update tenant properties.

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "subscription_plan": "enterprise",
  "max_users": 100,
  "max_projects": 50,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "subscription_plan": "enterprise",
    "status": "active"
  }
}
```

##### DELETE `/api/tenants/:id`
Permanently delete a tenant and all associated data.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tenant deleted successfully",
  "data": {
    "deleted_tenant_id": "uuid",
    "deleted_users": 18,
    "deleted_projects": 10,
    "deleted_tasks": 145
  }
}
```

---

#### 👥 User Management Endpoints (Tenant Admin)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/users` | List users in tenant | ✅ Yes | tenant_admin |
| POST | `/api/users` | Create new user | ✅ Yes | tenant_admin |
| GET | `/api/users/:id` | Get user details | ✅ Yes | tenant_admin |
| PUT | `/api/users/:id` | Update user | ✅ Yes | tenant_admin |
| DELETE | `/api/users/:id` | Delete user | ✅ Yes | tenant_admin |

**Endpoint Details:**

##### GET `/api/users`
Get all users in the authenticated tenant.

**Query Parameters:**
- `role` (optional): Filter by role (tenant_admin, user)
- `status` (optional): Filter by status (active, inactive)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@acme.com",
      "role": "user",
      "status": "active",
      "last_login": "2024-12-20T09:15:00Z",
      "created_at": "2024-02-10T14:00:00Z"
    }
  ]
}
```

##### POST `/api/users`
Create a new user in the tenant.

**Request Body:**
```json
{
  "name": "Bob Johnson",
  "email": "bob@acme.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "name": "Bob Johnson",
    "email": "bob@acme.com",
    "role": "user",
    "tenant_id": "uuid"
  }
}
```

##### GET `/api/users/:id`
Get specific user details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bob Johnson",
    "email": "bob@acme.com",
    "role": "user",
    "status": "active",
    "last_login": "2024-12-20T10:30:00Z",
    "created_at": "2024-03-15T11:00:00Z"
  }
}
```

##### PUT `/api/users/:id`
Update user information.

**Request Body:**
```json
{
  "name": "Robert Johnson",
  "role": "tenant_admin",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "Robert Johnson",
    "role": "tenant_admin"
  }
}
```

##### DELETE `/api/users/:id`
Delete a user from the tenant.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deleted_user_id": "uuid"
  }
}
```

---

#### 📁 Project Management Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/projects` | List projects (filtered by tenant/access) | ✅ Yes | Any authenticated |
| POST | `/api/projects` | Create new project | ✅ Yes | tenant_admin, user |
| GET | `/api/projects/:id` | Get project details | ✅ Yes | Any authenticated |
| PUT | `/api/projects/:id` | Update project | ✅ Yes | tenant_admin or creator |
| DELETE | `/api/projects/:id` | Delete project | ✅ Yes | tenant_admin or creator |

**Endpoint Details:**

##### GET `/api/projects`
Get projects (tenant admins see all, users see assigned projects).

**Query Parameters:**
- `status` (optional): Filter by status (active, archived)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "Redesign company website",
      "status": "active",
      "created_by": "uuid",
      "creator_name": "John Doe",
      "task_count": 15,
      "completed_tasks": 8,
      "created_at": "2024-11-01T10:00:00Z"
    }
  ]
}
```

##### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "name": "Mobile App Development",
    "description": "Build iOS and Android apps",
    "status": "active",
    "tenant_id": "uuid",
    "created_by": "uuid"
  }
}
```

##### GET `/api/projects/:id`
Get specific project details with tasks.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "status": "active",
    "created_by": "uuid",
    "creator_name": "John Doe",
    "tasks": [
      {
        "id": "uuid",
        "title": "Design homepage mockup",
        "status": "done",
        "priority": "high",
        "assigned_to_name": "Jane Smith"
      }
    ],
    "created_at": "2024-11-01T10:00:00Z"
  }
}
```

##### PUT `/api/projects/:id`
Update project information.

**Request Body:**
```json
{
  "name": "Website Redesign v2",
  "description": "Updated description",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "name": "Website Redesign v2",
    "status": "active"
  }
}
```

##### DELETE `/api/projects/:id`
Delete a project (cascades to tasks).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "deleted_project_id": "uuid",
    "deleted_tasks": 15
  }
}
```

---

#### ✅ Task Management Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/tasks` | List tasks (with optional filters) | ✅ Yes | Any authenticated |
| POST | `/api/tasks` | Create new task | ✅ Yes | Any authenticated |
| GET | `/api/tasks/:id` | Get task details | ✅ Yes | Any authenticated |
| PUT | `/api/tasks/:id` | Update task | ✅ Yes | Any authenticated |
| DELETE | `/api/tasks/:id` | Delete task | ✅ Yes | tenant_admin or creator |

**Endpoint Details:**

##### GET `/api/tasks`
Get tasks with optional filters.

**Query Parameters:**
- `project_id` (optional): Filter by project
- `status` (optional): Filter by status (todo, in_progress, done)
- `assigned_to` (optional): Filter by assigned user ID
- `priority` (optional): Filter by priority (low, medium, high)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Fix login bug",
      "description": "Users can't login with email",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2024-12-25",
      "project_id": "uuid",
      "project_name": "Website Redesign",
      "assigned_to": "uuid",
      "assigned_to_name": "Jane Smith",
      "created_by_name": "John Doe",
      "created_at": "2024-12-15T09:00:00Z"
    }
  ]
}
```

##### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "project_id": "uuid",
  "title": "Write API documentation",
  "description": "Document all 19 endpoints",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-30",
  "assigned_to": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "Write API documentation",
    "status": "todo",
    "priority": "medium",
    "project_id": "uuid",
    "tenant_id": "uuid"
  }
}
```

##### GET `/api/tasks/:id`
Get specific task details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Fix login bug",
    "description": "Users can't login with email",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-12-25",
    "project_id": "uuid",
    "project_name": "Website Redesign",
    "assigned_to": "uuid",
    "assigned_to_name": "Jane Smith",
    "created_by": "uuid",
    "created_by_name": "John Doe",
    "created_at": "2024-12-15T09:00:00Z",
    "updated_at": "2024-12-20T14:30:00Z"
  }
}
```

##### PUT `/api/tasks/:id`
Update task information.

**Request Body:**
```json
{
  "title": "Fix login bug (URGENT)",
  "status": "done",
  "priority": "high",
  "assigned_to": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "Fix login bug (URGENT)",
    "status": "done"
  }
}
```

##### DELETE `/api/tasks/:id`
Delete a task.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "deleted_task_id": "uuid"
  }
}
```

---

#### 🏥 System Health Endpoint (Public)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/health` | Health check for system status | ❌ No | None |

**Endpoint Details:**

##### GET `/api/health`
Check system health status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-20T15:45:30Z"
}
```

**Response (500 Error - if database down):**
```json
{
  "status": "error",
  "database": "disconnected",
  "timestamp": "2024-12-20T15:45:30Z"
}
```

---

### 📊 API Summary Statistics

**Total Endpoints**: 19

**By Category:**
- 🔐 Authentication: 2 endpoints
- 🏢 Tenant Management: 4 endpoints (super_admin only)
- 👥 User Management: 5 endpoints (tenant_admin)
- 📁 Project Management: 5 endpoints
- ✅ Task Management: 5 endpoints
- 🏥 System Health: 1 endpoint

**By HTTP Method:**
- GET: 9 endpoints (read operations)
- POST: 4 endpoints (create operations)
- PUT: 5 endpoints (update operations)
- DELETE: 3 endpoints (delete operations)

**Authentication:**
- Public (no auth required): 3 endpoints (register, login, health)
- Requires JWT: 16 endpoints

---

## 📝 Summary

This architecture document provides a complete blueprint for implementing the multi-tenant SaaS platform. The system follows industry-standard patterns with clear separation of concerns, robust data isolation, and comprehensive API coverage.

**Key Highlights:**
- ✅ Three-tier architecture (Frontend, Backend, Database)
- ✅ Shared database with tenant_id filtering
- ✅ 5 core database tables with proper relationships
- ✅ 19 RESTful API endpoints
- ✅ Complete authentication and authorization flow
- ✅ Docker-based deployment architecture
