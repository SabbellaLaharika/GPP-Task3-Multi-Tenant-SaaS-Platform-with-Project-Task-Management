# 📡 Multi-Tenant SaaS Platform - API Documentation

## Overview

This document provides comprehensive documentation for all 19 API endpoints in the Multi-Tenant SaaS Platform. The API follows RESTful principles and uses JWT (JSON Web Token) for authentication.

**Base URL:** `http://localhost:5000/api`

**Postman Collection:** [View in Postman](https://www.postman.com/laharika-7870951/workspace/multi-tenant-saas-api/collection/46220444-88bb70b8-19a9-4ac4-b9a7-d573497e7655?action=share&creator=46220444&active-environment=46220444-1102035d-ed7f-4272-90d7-e4963984e6e7)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authentication APIs](#authentication-apis)
   - [Register Tenant](#1-register-tenant)
   - [Login](#2-login)
   - [Get Current User](#3-get-current-user)
   - [Logout](#4-logout)
3. [Tenant APIs](#tenant-apis)
   - [Get Tenant Details](#5-get-tenant-details)
   - [Update Tenant](#6-update-tenant)
   - [List All Tenants](#7-list-all-tenants-super-admin-only)
4. [User APIs](#user-apis)
   - [Create User](#8-create-user)
   - [List Tenant Users](#9-list-tenant-users)
   - [Update User](#10-update-user)
   - [Delete User](#11-delete-user)
5. [Project APIs](#project-apis)
   - [Create Project](#12-create-project)
   - [List Projects](#13-list-projects)
   - [Update Project](#14-update-project)
   - [Delete Project](#15-delete-project)
6. [Task APIs](#task-apis)
   - [Create Task](#16-create-task)
   - [List Project Tasks](#17-list-project-tasks)
   - [Update Task Status](#18-update-task-status)
   - [Update Task](#19-update-task)
   - [Delete Task](#20-delete-task-bonus)
7. [Error Handling](#error-handling)
8. [Status Codes](#status-codes)

---

## Authentication

### Authentication Method

The API uses **JWT (JSON Web Token)** for authentication. After successful login or registration, you'll receive a token that must be included in subsequent requests.

### Including the Token

Include the JWT token in the `Authorization` header of your requests:

```
Authorization: Bearer <your_jwt_token>
```

### Example Request with Authentication

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Public Endpoints (No Authentication Required)

- `POST /api/auth/register-tenant` - Register new tenant
- `POST /api/auth/login` - User login

### Protected Endpoints (Authentication Required)

All other endpoints require a valid JWT token.

---

## Authentication APIs

### 1. Register Tenant

Register a new tenant organization with an admin user.

**Endpoint:** `POST /api/auth/register-tenant`

**Authentication:** Not required

**Request Body:**

```json
{
  "tenantName": "Tech Company",
  "subdomain": "techco",
  "adminEmail": "admin@techco.com",
  "adminPassword": "Admin@123",
  "adminFullName": "John Doe"
}
```

**Field Validations:**
- `tenantName`: Required, 2-100 characters
- `subdomain`: Required, 3-50 characters, alphanumeric and hyphens only, must be unique
- `adminEmail`: Required, valid email format, must be unique
- `adminPassword`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `adminFullName`: Required, 2-100 characters

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tech Company",
      "subdomain": "techco",
      "status": "active",
      "subscription_plan": "basic",
      "max_users": 10,
      "max_projects": 20,
      "created_at": "2024-12-28T10:00:00.000Z"
    },
    "user": {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "email": "admin@techco.com",
      "full_name": "John Doe",
      "role": "tenant_admin",
      "is_active": true,
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjBmOTUxMS1mM2FjLTUyZTUtYjgyNy01NTc3NjY1NTExMTEiLCJyb2xlIjoidGVuYW50X2FkbWluIiwidGVuYW50SWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDM3NjQ4MDAsImV4cCI6MTcwNDM2OTYwMH0.abc123xyz"
  }
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "subdomain",
      "message": "Subdomain must be between 3 and 50 characters"
    }
  ]
}

// 409 - Conflict (Duplicate)
{
  "success": false,
  "message": "Subdomain already exists"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Tech Company",
    "subdomain": "techco",
    "adminEmail": "admin@techco.com",
    "adminPassword": "Admin@123",
    "adminFullName": "John Doe"
  }'
```

---

### 2. Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
```

**Field Validations:**
- `email`: Required, valid email format
- `password`: Required
- `tenantSubdomain`: Required

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "770fa622-g4bd-63f6-c938-668877662222",
      "email": "admin@demo.com",
      "full_name": "Demo Admin",
      "role": "tenant_admin",
      "is_active": true,
      "tenant_id": "440d7300-d18a-30c3-9605-335544330000",
      "tenant_name": "Demo Company",
      "tenant_subdomain": "demo"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NzBmYTYyMi1nNGJkLTYzZjYtYzkzOC02Njg4Nzc2NjIyMjIiLCJyb2xlIjoidGVuYW50X2FkbWluIiwidGVuYW50SWQiOiI0NDBkNzMwMC1kMThhLTMwYzMtOTYwNS0zMzU1NDQzMzAwMDAiLCJpYXQiOjE3MDM3NjQ4MDAsImV4cCI6MTcwNDM2OTYwMH0.def456uvw"
  }
}
```

**Error Responses:**

```json
// 401 - Invalid Credentials
{
  "success": false,
  "message": "Invalid email or password"
}

// 404 - Tenant Not Found
{
  "success": false,
  "message": "Tenant not found"
}

// 403 - Inactive User
{
  "success": false,
  "message": "User account is inactive"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'
```

---

### 3. Get Current User

Get the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "770fa622-g4bd-63f6-c938-668877662222",
    "email": "admin@demo.com",
    "full_name": "Demo Admin",
    "role": "tenant_admin",
    "is_active": true,
    "tenant_id": "440d7300-d18a-30c3-9605-335544330000",
    "tenant_name": "Demo Company",
    "tenant_subdomain": "demo",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 401 - Invalid/Expired Token
{
  "success": false,
  "message": "Invalid or expired token"
}

// 404 - User Not Found
{
  "success": false,
  "message": "User not found"
}
```

**Example curl:**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Logout

Logout the current user (client-side token removal).

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** This endpoint primarily serves as a confirmation. The actual logout is handled client-side by removing the JWT token from storage.

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Tenant APIs

### 5. Get Tenant Details

Get details of a specific tenant.

**Endpoint:** `GET /api/tenants/:tenantId`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can view their own tenant
- Super Admin: Can view any tenant

**URL Parameters:**
- `tenantId`: UUID of the tenant

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "440d7300-d18a-30c3-9605-335544330000",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscription_plan": "professional",
    "max_users": 50,
    "max_projects": 100,
    "current_users": 3,
    "current_projects": 5,
    "created_at": "2024-12-20T10:00:00.000Z",
    "updated_at": "2024-12-26T15:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Access denied"
}

// 404 - Not Found
{
  "success": false,
  "message": "Tenant not found"
}
```

**Example curl:**

```bash
curl -X GET http://localhost:5000/api/tenants/440d7300-d18a-30c3-9605-335544330000 \
  -H "Authorization: Bearer <token>"
```

---

### 6. Update Tenant

Update tenant information.

**Endpoint:** `PUT /api/tenants/:tenantId`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can update their own tenant name only
- Super Admin: Can update any tenant (name, status, subscription)

**URL Parameters:**
- `tenantId`: UUID of the tenant

**Request Body (Tenant Admin):**

```json
{
  "name": "Demo Company International"
}
```

**Request Body (Super Admin):**

```json
{
  "name": "Demo Company International",
  "status": "active",
  "subscription_plan": "enterprise",
  "max_users": 100,
  "max_projects": 200
}
```

**Field Validations:**
- `name`: Optional, 2-100 characters
- `status`: Optional, enum: ['active', 'suspended', 'inactive']
- `subscription_plan`: Optional, enum: ['basic', 'professional', 'enterprise']
- `max_users`: Optional, positive integer
- `max_projects`: Optional, positive integer

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "440d7300-d18a-30c3-9605-335544330000",
    "name": "Demo Company International",
    "subdomain": "demo",
    "status": "active",
    "subscription_plan": "enterprise",
    "max_users": 100,
    "max_projects": 200,
    "updated_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You can only update your own tenant"
}

// 404 - Not Found
{
  "success": false,
  "message": "Tenant not found"
}
```

**Example curl:**

```bash
curl -X PUT http://localhost:5000/api/tenants/440d7300-d18a-30c3-9605-335544330000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Company International"
  }'
```

---

### 7. List All Tenants (Super Admin Only)

Get a list of all tenants in the system.

**Endpoint:** `GET /api/tenants`

**Authentication:** Required

**Authorization:** Super Admin only

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status (active/suspended/inactive)
- `subscription_plan`: Filter by plan (basic/professional/enterprise)
- `search`: Search by name or subdomain

**Example Request:**

```
GET /api/tenants?page=1&limit=10&status=active&search=demo
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "440d7300-d18a-30c3-9605-335544330000",
        "name": "Demo Company",
        "subdomain": "demo",
        "status": "active",
        "subscription_plan": "professional",
        "max_users": 50,
        "max_projects": 100,
        "current_users": 3,
        "current_projects": 5,
        "created_at": "2024-12-20T10:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Tech Company",
        "subdomain": "techco",
        "status": "active",
        "subscription_plan": "basic",
        "max_users": 10,
        "max_projects": 20,
        "current_users": 1,
        "current_projects": 0,
        "created_at": "2024-12-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Access denied. Super admin role required"
}
```

**Example curl:**

```bash
curl -X GET "http://localhost:5000/api/tenants?page=1&limit=10&status=active" \
  -H "Authorization: Bearer <super_admin_token>"
```

---

## User APIs

### 8. Create User

Create a new user in a tenant organization.

**Endpoint:** `POST /api/tenants/:tenantId/users`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can create users in their own tenant
- Super Admin: Can create users in any tenant

**URL Parameters:**
- `tenantId`: UUID of the tenant

**Request Body:**

```json
{
  "email": "newuser@demo.com",
  "password": "User@123",
  "full_name": "New User",
  "role": "user"
}
```

**Field Validations:**
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 8 characters with complexity rules
- `full_name`: Required, 2-100 characters
- `role`: Optional, enum: ['user', 'tenant_admin'], default: 'user'

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "880gb733-h5ce-74g7-d049-779988773333",
    "email": "newuser@demo.com",
    "full_name": "New User",
    "role": "user",
    "is_active": true,
    "tenant_id": "440d7300-d18a-30c3-9605-335544330000",
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Max Users Reached
{
  "success": false,
  "message": "Maximum user limit reached for this tenant"
}

// 409 - Email Already Exists
{
  "success": false,
  "message": "Email already exists"
}

// 403 - Forbidden
{
  "success": false,
  "message": "Access denied"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/tenants/440d7300-d18a-30c3-9605-335544330000/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@demo.com",
    "password": "User@123",
    "full_name": "New User",
    "role": "user"
  }'
```

---

### 9. List Tenant Users

Get all users in a tenant.

**Endpoint:** `GET /api/tenants/:tenantId/users`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can view users in their own tenant
- Super Admin: Can view users in any tenant
- Regular User: Can view users in their own tenant (limited info)

**URL Parameters:**
- `tenantId`: UUID of the tenant

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `role`: Filter by role
- `isActive`: Filter by active status (true/false)
- `search`: Search by name or email

**Example Request:**

```
GET /api/tenants/440d7300-d18a-30c3-9605-335544330000/users?role=user&isActive=true
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "770fa622-g4bd-63f6-c938-668877662222",
        "email": "admin@demo.com",
        "full_name": "Demo Admin",
        "role": "tenant_admin",
        "is_active": true,
        "created_at": "2024-12-20T10:00:00.000Z",
        "last_login": "2024-12-28T09:30:00.000Z"
      },
      {
        "id": "880gb733-h5ce-74g7-d049-779988773333",
        "email": "user@demo.com",
        "full_name": "Demo User",
        "role": "user",
        "is_active": true,
        "created_at": "2024-12-22T14:00:00.000Z",
        "last_login": "2024-12-27T16:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

**Example curl:**

```bash
curl -X GET http://localhost:5000/api/tenants/440d7300-d18a-30c3-9605-335544330000/users \
  -H "Authorization: Bearer <token>"
```

---

### 10. Update User

Update user information.

**Endpoint:** `PUT /api/users/:userId`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can update users in their own tenant
- Super Admin: Can update any user
- Regular User: Can only update their own full_name

**URL Parameters:**
- `userId`: UUID of the user

**Request Body (Tenant Admin/Super Admin):**

```json
{
  "full_name": "Updated Name",
  "role": "tenant_admin",
  "is_active": true
}
```

**Request Body (Regular User):**

```json
{
  "full_name": "Updated Name"
}
```

**Field Validations:**
- `full_name`: Optional, 2-100 characters
- `role`: Optional, enum: ['user', 'tenant_admin']
- `is_active`: Optional, boolean

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "880gb733-h5ce-74g7-d049-779988773333",
    "email": "user@demo.com",
    "full_name": "Updated Name",
    "role": "tenant_admin",
    "is_active": true,
    "updated_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You can only update your own profile"
}

// 404 - Not Found
{
  "success": false,
  "message": "User not found"
}
```

**Example curl:**

```bash
curl -X PUT http://localhost:5000/api/users/880gb733-h5ce-74g7-d049-779988773333 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "role": "tenant_admin"
  }'
```

---

### 11. Delete User

Delete a user from the system.

**Endpoint:** `DELETE /api/users/:userId`

**Authentication:** Required

**Authorization:** 
- Tenant Admin: Can delete users in their own tenant (except themselves)
- Super Admin: Can delete any user (except super admins)

**URL Parameters:**
- `userId`: UUID of the user

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

```json
// 400 - Cannot Delete Self
{
  "success": false,
  "message": "You cannot delete your own account"
}

// 403 - Forbidden
{
  "success": false,
  "message": "Access denied"
}

// 404 - Not Found
{
  "success": false,
  "message": "User not found"
}

// 409 - Has Dependencies
{
  "success": false,
  "message": "Cannot delete user with assigned tasks. Please reassign tasks first."
}
```

**Example curl:**

```bash
curl -X DELETE http://localhost:5000/api/users/880gb733-h5ce-74g7-d049-779988773333 \
  -H "Authorization: Bearer <token>"
```

---

## Project APIs

### 12. Create Project

Create a new project in the tenant.

**Endpoint:** `POST /api/projects`

**Authentication:** Required

**Authorization:** All authenticated users can create projects

**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website with modern UI/UX",
  "status": "active"
}
```

**Field Validations:**
- `name`: Required, 2-200 characters
- `description`: Optional, max 1000 characters
- `status`: Optional, enum: ['active', 'archived', 'completed'], default: 'active'

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "990hc844-i6df-85h8-e150-880099884444",
    "name": "Website Redesign",
    "description": "Complete redesign of company website with modern UI/UX",
    "status": "active",
    "tenant_id": "440d7300-d18a-30c3-9605-335544330000",
    "created_by": "770fa622-g4bd-63f6-c938-668877662222",
    "created_by_name": "Demo Admin",
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Max Projects Reached
{
  "success": false,
  "message": "Maximum project limit reached for this tenant"
}

// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Project name is required"
    }
  ]
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active"
  }'
```

---

### 13. List Projects

Get all projects for the authenticated user's tenant.

**Endpoint:** `GET /api/projects`

**Authentication:** Required

**Authorization:** 
- Regular users see all projects in their tenant
- Tenant Admin sees all projects in their tenant
- Super Admin sees all projects across all tenants

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (active/archived/completed)
- `search`: Search by name or description
- `sortBy`: Sort field (name/created_at/status)
- `sortOrder`: Sort order (asc/desc)

**Example Request:**

```
GET /api/projects?page=1&limit=10&status=active&search=website&sortBy=created_at&sortOrder=desc
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "990hc844-i6df-85h8-e150-880099884444",
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "active",
        "task_count": 5,
        "completed_tasks": 2,
        "created_by": "770fa622-g4bd-63f6-c938-668877662222",
        "created_by_name": "Demo Admin",
        "created_at": "2024-12-28T10:00:00.000Z",
        "updated_at": "2024-12-28T10:00:00.000Z"
      },
      {
        "id": "aa0id955-j7eg-96i9-f261-991100995555",
        "name": "Mobile App Development",
        "description": "Native mobile application for iOS and Android",
        "status": "active",
        "task_count": 12,
        "completed_tasks": 8,
        "created_by": "770fa622-g4bd-63f6-c938-668877662222",
        "created_by_name": "Demo Admin",
        "created_at": "2024-12-26T14:30:00.000Z",
        "updated_at": "2024-12-27T16:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Example curl:**

```bash
curl -X GET "http://localhost:5000/api/projects?status=active&search=website" \
  -H "Authorization: Bearer <token>"
```

---

### 14. Update Project

Update project information.

**Endpoint:** `PUT /api/projects/:projectId`

**Authentication:** Required

**Authorization:** 
- Project creator can update
- Tenant Admin can update any project in their tenant
- Super Admin can update any project

**URL Parameters:**
- `projectId`: UUID of the project

**Request Body:**

```json
{
  "name": "Website Redesign v2.0",
  "description": "Updated project requirements and scope",
  "status": "completed"
}
```

**Field Validations:**
- `name`: Optional, 2-200 characters
- `description`: Optional, max 1000 characters
- `status`: Optional, enum: ['active', 'archived', 'completed']

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "990hc844-i6df-85h8-e150-880099884444",
    "name": "Website Redesign v2.0",
    "description": "Updated project requirements and scope",
    "status": "completed",
    "updated_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You don't have permission to update this project"
}

// 404 - Not Found
{
  "success": false,
  "message": "Project not found"
}
```

**Example curl:**

```bash
curl -X PUT http://localhost:5000/api/projects/990hc844-i6df-85h8-e150-880099884444 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign v2.0",
    "status": "completed"
  }'
```

---

### 15. Delete Project

Delete a project and all its associated tasks.

**Endpoint:** `DELETE /api/projects/:projectId`

**Authentication:** Required

**Authorization:** 
- Project creator can delete
- Tenant Admin can delete any project in their tenant
- Super Admin can delete any project

**URL Parameters:**
- `projectId`: UUID of the project

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Project and all associated tasks deleted successfully"
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You don't have permission to delete this project"
}

// 404 - Not Found
{
  "success": false,
  "message": "Project not found"
}
```

**Note:** Deleting a project will also delete all tasks associated with it due to CASCADE DELETE constraint.

**Example curl:**

```bash
curl -X DELETE http://localhost:5000/api/projects/990hc844-i6df-85h8-e150-880099884444 \
  -H "Authorization: Bearer <token>"
```

---

## Task APIs

### 16. Create Task

Create a new task in a project.

**Endpoint:** `POST /api/projects/:projectId/tasks`

**Authentication:** Required

**Authorization:** All authenticated users can create tasks in accessible projects

**URL Parameters:**
- `projectId`: UUID of the project

**Request Body:**

```json
{
  "title": "Design homepage mockup",
  "description": "Create wireframes and high-fidelity mockups for homepage",
  "status": "todo",
  "priority": "high",
  "assigned_to": "880gb733-h5ce-74g7-d049-779988773333",
  "due_date": "2024-12-31"
}
```

**Field Validations:**
- `title`: Required, 2-200 characters
- `description`: Optional, max 2000 characters
- `status`: Optional, enum: ['todo', 'in_progress', 'completed'], default: 'todo'
- `priority`: Optional, enum: ['low', 'medium', 'high'], default: 'medium'
- `assigned_to`: Optional, UUID of user in same tenant
- `due_date`: Optional, ISO 8601 date format

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "bb0je066-k8fh-a7j0-g372-aa2211aa6666",
    "title": "Design homepage mockup",
    "description": "Create wireframes and high-fidelity mockups for homepage",
    "status": "todo",
    "priority": "high",
    "project_id": "990hc844-i6df-85h8-e150-880099884444",
    "assigned_to": "880gb733-h5ce-74g7-d049-779988773333",
    "assigned_to_name": "Demo User",
    "due_date": "2024-12-31",
    "created_by": "770fa622-g4bd-63f6-c938-668877662222",
    "created_by_name": "Demo Admin",
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 404 - Project Not Found
{
  "success": false,
  "message": "Project not found"
}

// 400 - Invalid Assignment
{
  "success": false,
  "message": "Cannot assign task to user from different tenant"
}

// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Task title is required"
    }
  ]
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/projects/990hc844-i6df-85h8-e150-880099884444/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage mockup",
    "description": "Create wireframes and mockups",
    "priority": "high",
    "assigned_to": "880gb733-h5ce-74g7-d049-779988773333",
    "due_date": "2024-12-31"
  }'
```

---

### 17. List Project Tasks

Get all tasks for a specific project.

**Endpoint:** `GET /api/projects/:projectId/tasks`

**Authentication:** Required

**Authorization:** Users can see tasks in projects they have access to

**URL Parameters:**
- `projectId`: UUID of the project

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `status`: Filter by status (todo/in_progress/completed)
- `priority`: Filter by priority (low/medium/high)
- `assigned_to`: Filter by assigned user ID
- `search`: Search by title or description

**Example Request:**

```
GET /api/projects/990hc844-i6df-85h8-e150-880099884444/tasks?status=todo&priority=high
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "bb0je066-k8fh-a7j0-g372-aa2211aa6666",
        "title": "Design homepage mockup",
        "description": "Create wireframes and high-fidelity mockups",
        "status": "todo",
        "priority": "high",
        "project_id": "990hc844-i6df-85h8-e150-880099884444",
        "assigned_to": "880gb733-h5ce-74g7-d049-779988773333",
        "assigned_to_name": "Demo User",
        "due_date": "2024-12-31",
        "created_by": "770fa622-g4bd-63f6-c938-668877662222",
        "created_by_name": "Demo Admin",
        "created_at": "2024-12-28T10:00:00.000Z",
        "updated_at": "2024-12-28T10:00:00.000Z"
      },
      {
        "id": "cc0kf177-l9gi-b8k1-h483-bb3322bb7777",
        "title": "Implement responsive navigation",
        "description": "Create mobile-friendly navigation menu",
        "status": "in_progress",
        "priority": "medium",
        "project_id": "990hc844-i6df-85h8-e150-880099884444",
        "assigned_to": "880gb733-h5ce-74g7-d049-779988773333",
        "assigned_to_name": "Demo User",
        "due_date": "2025-01-05",
        "created_by": "770fa622-g4bd-63f6-c938-668877662222",
        "created_by_name": "Demo Admin",
        "created_at": "2024-12-27T14:00:00.000Z",
        "updated_at": "2024-12-28T09:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

**Example curl:**

```bash
curl -X GET "http://localhost:5000/api/projects/990hc844-i6df-85h8-e150-880099884444/tasks?status=todo" \
  -H "Authorization: Bearer <token>"
```

---

### 18. Update Task Status

Update the status of a task (for Kanban board).

**Endpoint:** `PATCH /api/tasks/:taskId/status`

**Authentication:** Required

**Authorization:** 
- Task creator can update
- Assigned user can update
- Tenant Admin can update any task in their tenant
- Super Admin can update any task

**URL Parameters:**
- `taskId`: UUID of the task

**Request Body:**

```json
{
  "status": "in_progress"
}
```

**Field Validations:**
- `status`: Required, enum: ['todo', 'in_progress', 'completed']

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "bb0je066-k8fh-a7j0-g372-aa2211aa6666",
    "title": "Design homepage mockup",
    "status": "in_progress",
    "updated_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You don't have permission to update this task"
}

// 404 - Not Found
{
  "success": false,
  "message": "Task not found"
}

// 400 - Invalid Status
{
  "success": false,
  "message": "Invalid status value"
}
```

**Example curl:**

```bash
curl -X PATCH http://localhost:5000/api/tasks/bb0je066-k8fh-a7j0-g372-aa2211aa6666/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

---

### 19. Update Task

Update task details (full update).

**Endpoint:** `PUT /api/tasks/:taskId`

**Authentication:** Required

**Authorization:** 
- Task creator can update
- Assigned user can update
- Tenant Admin can update any task in their tenant
- Super Admin can update any task

**URL Parameters:**
- `taskId`: UUID of the task

**Request Body:**

```json
{
  "title": "Updated task title",
  "description": "Updated description with more details",
  "status": "in_progress",
  "priority": "medium",
  "assigned_to": "770fa622-g4bd-63f6-c938-668877662222",
  "due_date": "2025-01-15"
}
```

**Field Validations:**
- `title`: Optional, 2-200 characters
- `description`: Optional, max 2000 characters
- `status`: Optional, enum: ['todo', 'in_progress', 'completed']
- `priority`: Optional, enum: ['low', 'medium', 'high']
- `assigned_to`: Optional, UUID of user in same tenant (null to unassign)
- `due_date`: Optional, ISO 8601 date format (null to remove)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "bb0je066-k8fh-a7j0-g372-aa2211aa6666",
    "title": "Updated task title",
    "description": "Updated description with more details",
    "status": "in_progress",
    "priority": "medium",
    "project_id": "990hc844-i6df-85h8-e150-880099884444",
    "assigned_to": "770fa622-g4bd-63f6-c938-668877662222",
    "assigned_to_name": "Demo Admin",
    "due_date": "2025-01-15",
    "updated_at": "2024-12-28T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You don't have permission to update this task"
}

// 404 - Not Found
{
  "success": false,
  "message": "Task not found"
}

// 400 - Invalid Assignment
{
  "success": false,
  "message": "Cannot assign task to user from different tenant"
}
```

**Example curl:**

```bash
curl -X PUT http://localhost:5000/api/tasks/bb0je066-k8fh-a7j0-g372-aa2211aa6666 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "priority": "medium",
    "due_date": "2025-01-15"
  }'
```

---

### 20. Delete Task (Bonus API)

Delete a task from the system.

**Endpoint:** `DELETE /api/tasks/:taskId`

**Authentication:** Required

**Authorization:** 
- Task creator can delete
- Tenant Admin can delete any task in their tenant
- Super Admin can delete any task

**URL Parameters:**
- `taskId`: UUID of the task

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "You don't have permission to delete this task"
}

// 404 - Not Found
{
  "success": false,
  "message": "Task not found"
}
```

**Example curl:**

```bash
curl -X DELETE http://localhost:5000/api/tasks/bb0je066-k8fh-a7j0-g372-aa2211aa6666 \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific field error"
    }
  ]
}
```

### Common Error Types

#### 1. Validation Errors (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

#### 2. Authentication Errors (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

```json
{
  "success": false,
  "message": "No token provided"
}
```

#### 3. Authorization Errors (403 Forbidden)

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

#### 4. Not Found Errors (404 Not Found)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 5. Conflict Errors (409 Conflict)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

```json
{
  "success": false,
  "message": "Subdomain already taken"
}
```

#### 6. Server Errors (500 Internal Server Error)

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE requests |
| 201 | Created | Successful POST requests that create resources |
| 400 | Bad Request | Validation errors, invalid data format |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Requested resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Internal Server Error | Unexpected server errors |

---

## Request Examples by Role

### Super Admin Workflow

```bash
# 1. Login as Super Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@system.com",
    "password": "Admin@123",
    "tenantSubdomain": "system"
  }'

# Save token from response
TOKEN="<super_admin_token>"

# 2. List all tenants
curl -X GET "http://localhost:5000/api/tenants?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 3. View specific tenant details
curl -X GET http://localhost:5000/api/tenants/<tenant_id> \
  -H "Authorization: Bearer $TOKEN"

# 4. Update tenant subscription
curl -X PUT http://localhost:5000/api/tenants/<tenant_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_plan": "enterprise",
    "max_users": 100,
    "max_projects": 200
  }'

# 5. View all projects across tenants
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Tenant Admin Workflow

```bash
# 1. Login as Tenant Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'

# Save token
TOKEN="<tenant_admin_token>"

# 2. Create new user
curl -X POST http://localhost:5000/api/tenants/<tenant_id>/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@demo.com",
    "password": "User@123",
    "full_name": "New User",
    "role": "user"
  }'

# 3. List all users
curl -X GET http://localhost:5000/api/tenants/<tenant_id>/users \
  -H "Authorization: Bearer $TOKEN"

# 4. Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Marketing Campaign",
    "description": "Launch new product marketing campaign",
    "status": "active"
  }'

# 5. View tenant settings
curl -X GET http://localhost:5000/api/tenants/<tenant_id> \
  -H "Authorization: Bearer $TOKEN"

# 6. Update tenant name
curl -X PUT http://localhost:5000/api/tenants/<tenant_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Company International"
  }'
```

### Regular User Workflow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@demo.com",
    "password": "User@123",
    "tenantSubdomain": "demo"
  }'

# Save token
TOKEN="<user_token>"

# 2. List my projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# 3. Create task in project
curl -X POST http://localhost:5000/api/projects/<project_id>/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review design mockups",
    "description": "Provide feedback on homepage designs",
    "priority": "medium",
    "due_date": "2024-12-30"
  }'

# 4. List tasks in project
curl -X GET http://localhost:5000/api/projects/<project_id>/tasks \
  -H "Authorization: Bearer $TOKEN"

# 5. Update task status (move to in progress)
curl -X PATCH http://localhost:5000/api/tasks/<task_id>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'

# 6. Mark task as complete
curl -X PATCH http://localhost:5000/api/tasks/<task_id>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# 7. Update my profile
curl -X PUT http://localhost:5000/api/users/<my_user_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name"
  }'
```

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** button
3. Use the Postman Collection URL:
   ```
   https://www.postman.com/laharika-7870951/workspace/multi-tenant-saas-api/collection/46220444-88bb70b8-19a9-4ac4-b9a7-d573497e7655
   ```
4. Collection will be imported with all 19 endpoints

### Set Environment Variables

Create environment variables in Postman:

```json
{
  "API_URL": "http://localhost:5000/api",
  "TOKEN": "",
  "TENANT_ID": "",
  "USER_ID": "",
  "PROJECT_ID": "",
  "TASK_ID": ""
}
```

### Authentication Flow in Postman

1. **Register or Login** to get token
2. Copy the `token` from response
3. Set `TOKEN` environment variable
4. All subsequent requests will use `{{TOKEN}}` automatically

---

## Rate Limiting

**Note:** Rate limiting is not currently implemented but is recommended for production:

- **Per User:** 100 requests per 15 minutes
- **Per IP:** 1000 requests per hour
- **Authentication endpoints:** 5 requests per 15 minutes

---

## API Versioning

**Current Version:** v1 (implicit in `/api/` path)

Future versions will use explicit versioning:
- v2: `/api/v2/`
- v3: `/api/v3/`

---

## Best Practices

### 1. Always Use HTTPS in Production

```
https://your-domain.com/api/
```

### 2. Store JWT Securely

- **Frontend:** Use secure cookies or httpOnly cookies
- **Mobile:** Use secure keychain/keystore
- **Never:** Store in localStorage without encryption

### 3. Handle Token Expiration

```javascript
// Example: Refresh token on 401
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Validate Input Client-Side

Validate before sending requests to reduce server load:

```javascript
// Example validation
if (!email || !password || !tenantSubdomain) {
  showError('All fields are required');
  return;
}

if (password.length < 8) {
  showError('Password must be at least 8 characters');
  return;
}
```

### 5. Use Pagination for Lists

Always use pagination for list endpoints:

```
GET /api/projects?page=1&limit=10
```

### 6. Handle Errors Gracefully

```javascript
try {
  const response = await api.post('/projects', projectData);
  showSuccess('Project created');
} catch (error) {
  if (error.response) {
    // Server responded with error
    showError(error.response.data.message);
  } else {
    // Network error
    showError('Network error. Please try again.');
  }
}
```

---

## Changelog

### Version 1.0.0 (December 2024)

**Initial Release:**
- ✅ 19 API endpoints implemented
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Multi-tenant data isolation
- ✅ Complete CRUD for tenants, users, projects, tasks
- ✅ Postman collection available

---

## Support

For questions or issues with the API:

- **Documentation:** This file
- **Postman Collection:** [View Collection](https://www.postman.com/laharika-7870951/workspace/multi-tenant-saas-api/collection/46220444-88bb70b8-19a9-4ac4-b9a7-d573497e7655)
- **GitHub Issues:** Create an issue in the repository
