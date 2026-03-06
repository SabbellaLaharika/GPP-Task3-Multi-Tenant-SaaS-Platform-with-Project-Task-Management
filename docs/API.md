# 📡 Multi-Tenant SaaS Platform - API Documentation

## Overview

This document provides comprehensive documentation for all 19 API endpoints in the Multi-Tenant SaaS Platform. The API follows RESTful principles and uses JWT (JSON Web Token) for authentication.

**Base URL:** `http://localhost:5000/api`

**Swagger UI:** [View API Testing Swagger Details](http://localhost:5000/api/docs)

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
  "tenantName": "Test Company Alpha",
  "subdomain": "testalpha",
  "adminEmail": "admin@testalpha.com",
  "adminPassword": "TestPass@123",
  "adminFullName": "Alpha Admin"
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
    "tenantId": "uuid",
    "subdomain": "value",
    "adminUser": {
      "id": "uuid",
      "email": "value",
      "fullName": "value",
      "role": "tenant_admin"
    }
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
      "id": "bbbbbbbb-bbbb-bbbb",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "22222222-2222-2222"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "86400"
  }
}
```

**Error Responses:**

```json
// 401 - Invalid Credentials
{
  "success": false,
  "message": "Invalid credentials"
}

// 404 - Tenant Not Found
{
  "success": false,
  "message": "Tenant not found"
}

// 403 - Inactive User
{
  "success": false,
  "message": "Account suspended/inactive"
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
  "message": "User details fetched successfully",
  "data": {
    "id": "bbbbbbbb-bbbb-bbbb",
    "email": "admin@demo.com",
    "fullName": "Demo Admin",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "22222222-2222-2222",
      "name": "Demo Company",
      "subdomain": "demo",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 3
    }
  }
}
```

**Error Responses:**

```json
// 401 - Invalid/Expired Token
{
  "success": false,
  "message": "Unauthorized access"
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
  "message": "Tenant details retrieved successfully",
  "data": {
    "id": "22222222",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 15,
    "maxProjects": 100,
    "createdAt": "2024-12-26T10:00:00.000Z",
    "stats": {
      "totalUsers": 5,
      "totalProjects": 3,
      "totalTasks": 15
    }
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
  "name": "Updated Project via Swagger"
}
```

**Request Body (Super Admin):**

```json
{
  "name": "Updated Project via Swagger"
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
    "id": "2222",
    "name": "Updated Project via Swagger",
    "updatedAt": "2024-12-26T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
        "id": "1111",
        "name": "Demo Company",
        "subdomain": "demo",
        "status": "active",
        "subscriptionPlan": "professional",
        "totalUsers": 3,
        "totalProjects": 2,
        "createdAt": "2024-12-26T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
  "password": "NewUser@123",
  "fullName": "New User from Swagger",
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
    "id": "user-id-uuid",
    "email": "newuser@demo.com",
    "fullName": "New User from Swagger",
    "role": "user",
    "tenantId": "22222222-2222",
    "isActive": true,
    "createdAt": "2026-03-04T00:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Max Users Reached
{
  "success": false,
  "message": "Subscription limit reached"
}

// 409 - Email Already Exists
{
  "success": false,
  "message": "Email already exists in this tenant"
}

// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
    "fullName": "New User",
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
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "user-id-uuid",
        "email": "admin@demo.com",
        "fullName": "Demo Admin",
        "role": "tenant_admin",
        "isActive": true,
        "createdAt": "2024-12-26T10:00:00.000Z"
      }
    ],
    "total": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
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
  "fullName": "Updated User Name",
  "role": "tenant_admin",
  "isActive": true
}
```

**Request Body (Regular User):**

```json
{
  "fullName": "Updated User Name",
  "role": "tenant_admin",
  "isActive": true
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
    "id": "user-uuid",
    "fullName": "Updated User Name",
    "role": "tenant_admin",
    "updatedAt": "2024-12-26T10:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
    "fullName": "Updated Name",
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
  "message": "Cannot delete self"
}

// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
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
  "name": "Swagger Test Project",
  "description": "This project was created via Swagger testing",
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
    "id": "project-uuid",
    "tenantId": "tenant-uuid",
    "name": "Swagger Test Project",
    "description": "This project was created via Swagger testing",
    "status": "active",
    "createdBy": "creator-uuid",
    "createdAt": "2024-12-27T08:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Max Projects Reached
{
  "success": false,
  "message": "Project limit reached"
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
        "id": "project-uuid",
        "name": "Swagger Test Project",
        "description": "This project was created via Swagger testing",
        "status": "active",
        "createdBy": {
          "id": "creator-uuid",
          "fullName": "Demo Admin"
        },
        "taskCount": 5,
        "completedTaskCount": 2,
        "createdAt": "2024-12-27T08:00:00.000Z"
      }
    ],
    "total": 2,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 20
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
  "name": "Updated Project Name",
  "description": "Updated description via Postman",
  "status": "archived"
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
    "id": "project-uuid",
    "name": "Updated Project Name",
    "description": "Updated description via Postman",
    "status": "archived",
    "updatedAt": "2024-12-27T08:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
}

// 404 - Not Found
{
  "success": false,
  "message": "Project not found or invalid project id provided"
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
  "message": "Project deleted successfully"
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Unauthorized access"
}

// 404 - Not Found
{
  "success": false,
  "message": "Project not found or invalid project id provided"
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
  "title": "Test Task from Swagger",
  "description": "This is a test task created via Swagger",
  "priority": "high",
  "assignedTo": null,
  "dueDate": "2025-01-15"
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
    "id": "task-uuid",
    "projectId": "project-uuid",
    "tenantId": "tenant-uuid",
    "title": "Test Task from Swagger",
    "description": "This is a test task created via Swagger",
    "status": "todo",
    "priority": "medium",
    "assignedTo": null,
    "dueDate": "2025-01-15",
    "createdAt": "2024-12-27T08:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 404 - Project Not Found
{
  "success": false,
  "message": "Project not found or invalid project id provided"
}

// 400 - Invalid Assignment
{
  "success": false,
  "message": "assignedTo user doesn\'t belong to same tenant"
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
    "assignedTo": "880gb733-h5ce-74g7-d049-779988773333",
    "dueDate": "2024-12-31"
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
        "id": "task-uuid",
        "title": "Test Task from Postman",
        "description": "This is a test task created via Postman",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": {
          "id": "assigned user uuid",
          "fullName": "Demo user 1",
          "email": "user1@demo.com"
        },
        "dueDate": "2025-01-15",
        "createdAt": "2024-12-27T08:00:00.000Z"
      }
    ],
    "total": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
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
    "id": "task-uuid",
    "status": "in_progress",
    "updatedAt": "2024-12-27T08:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Task doesn\'t belong to user\'s tenant"
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
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "low",
  "assignedTo": null,
  "dueDate": "2025-01-20"
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
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Test Task from Postman",
        "description": "This is a test task created via Postman",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": {
          "id": "assigned user uuid",
          "fullName": "Demo user 1",
          "email": "user1@demo.com"
        },
        "dueDate": "2025-01-15",
        "updatedAt": "2024-12-27T08:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

```json
// 403 - Forbidden
{
  "success": false,
  "message": "Task doesn\'t belong to user\'s tenant"
}

// 404 - Not Found
{
  "success": false,
  "message": "Task not found"
}

// 400 - Invalid Assignment
{
  "success": false,
  "message": "assignedTo user doesn\'t belong to same tenant"
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
    "dueDate": "2025-01-15"
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
  "message": "Task doesn\'t belong to user\'s tenant"
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
  "message": "Unauthorized access"
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
  "message": "Email already exists in this tenant"
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
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 200
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
    "fullName": "New User",
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
    "dueDate": "2024-12-30"
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
    "fullName": "Updated Name"
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
