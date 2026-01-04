# 🚀 Multi-Tenant SaaS Platform with Project & Task Management

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive multi-tenant Software-as-a-Service (SaaS) platform with complete project and task management capabilities. Built with modern technologies and enterprise-grade security features.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Status](#project-status)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Docker Setup](#docker-setup)           
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This is a full-stack multi-tenant SaaS application that enables organizations to manage projects and tasks in an isolated, secure environment. Each tenant (organization) has complete data isolation, custom subdomain access, and configurable subscription plans.

### Key Highlights

- 🏢 **Multi-Tenancy**: Complete tenant isolation with subdomain-based routing
- 🔐 **Enterprise Security**: JWT authentication, role-based access control, password encryption
- 📊 **Project Management**: Full CRUD operations with status tracking
- ✅ **Task Management**: Kanban board with priority levels and assignments
- 👥 **User Management**: Tenant-level user administration with role management
- ⚙️ **Tenant Settings**: Configurable organization settings and subscription plans
- 🎨 **Modern UI**: Responsive design with Tailwind CSS and smooth animations
- 🔔 **Real-time Feedback**: Toast notifications and loading states

---

## ✨ Features

### Core Functionality

#### 🔐 Authentication & Authorization
- User registration with tenant creation
- Secure login with JWT tokens
- Role-based access control (Super Admin, Tenant Admin, User)
- Session management and logout
- Password hashing with bcrypt

#### 🏢 Multi-Tenant Architecture
- Complete data isolation between tenants
- Subdomain-based tenant identification
- Tenant-specific user management
- Configurable subscription plans (Basic, Professional, Enterprise)
- Resource limits per tenant (max users, max projects)

#### 📊 Project Management
- Create, read, update, and delete projects
- Project status tracking (Active, Archived, Completed)
- Search and filter projects
- Project-level task organization
- Assignment to specific users

#### ✅ Task Management
- Kanban-style task board with 3 columns (To Do, In Progress, Completed)
- Task priority levels (Low, Medium, High)
- Task assignment to team members
- Due date tracking
- Task status transitions
- Rich task descriptions
- Task creation, editing, and deletion

#### 👥 User Management
- Add users to tenant organization
- Update user roles (User, Tenant Admin)
- Activate/deactivate users
- View user activity and assignments
- Delete users (with proper constraints)

#### ⚙️ Tenant Administration
- View tenant information
- Update organization name
- View subscription plan details
- Monitor resource usage (current vs max users/projects)
- Super admin dashboard for all tenants

### Security Features

- 🔒 **JWT Authentication**: Secure token-based authentication
- 🔒 **Password Encryption**: Bcrypt hashing for all passwords
- 🔒 **Role-Based Access**: Three-tier permission system
- 🔒 **Tenant Isolation**: Complete data separation using tenant filters
- 🔒 **Input Validation**: Server-side validation for all inputs
- 🔒 **CORS Protection**: Configured cross-origin resource sharing
- 🔒 **SQL Injection Prevention**: Parameterized queries
- 🔒 **XSS Protection**: Input sanitization

### UI/UX Features

- 🎨 **Modern Design**: Clean, professional interface with Tailwind CSS
- 🎨 **Responsive Layout**: Mobile, tablet, and desktop support
- 🎨 **Smooth Animations**: Fade-in, slide-up, and scale-in effects
- 🎨 **Color-Coded Badges**: Visual status and priority indicators
- 🎨 **Toast Notifications**: User-friendly feedback messages
- 🎨 **Loading States**: Spinners and skeletons for better UX
- 🎨 **Empty States**: Helpful messages and call-to-actions
- 🎨 **Confirmation Dialogs**: Prevent accidental deletions
- 🎨 **Custom Scrollbars**: Styled scrollbars for better aesthetics

---

## 🏗️ System Architecture

![System Architecture](docs/images/system-architecture.png)

The application follows a three-tier architecture:

1. **Presentation Layer**: React-based SPA with component-driven design
2. **Application Layer**: Express.js REST API with JWT middleware
3. **Data Layer**: PostgreSQL with tenant-aware data access

### Database Schema

![Database ERD](docs/images/database-erd.png)

The database uses UUID primary keys for all tables and implements:
- Foreign key relationships with proper cascading
- Indexes for performance optimization
- Triggers for automatic timestamp updates
- Check constraints for data integrity

For detailed architecture documentation, see: [Architecture Documentation](docs/architecture.md)

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18+ | Web framework |
| PostgreSQL | 14+ | Relational database |
| jsonwebtoken | 9.0+ | JWT authentication |
| bcryptjs | 2.4+ | Password hashing |
| pg | 8.11+ | PostgreSQL client |
| express-validator | 7.0+ | Input validation |
| winston | 3.8+ | Logging |
| helmet | 7.0+ | Security headers |
| cors | 2.8+ | CORS handling |
| dotenv | 16.0+ | Environment variables |
| morgan | 1.10+ | HTTP logging |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.0+ | UI library |
| Vite | 4.0+ | Build tool |
| React Router | 6.0+ | Client-side routing |
| Tailwind CSS | 3.0+ | Utility-first CSS |
| Axios | 1.0+ | HTTP client |
| Framer Motion | 10.0+ | Animations |
| React Hot Toast | 2.4+ | Notifications |
| React Icons | 4.11+ | Icon library |
| date-fns | 2.30+ | Date formatting |

### Development Tools

- **nodemon**: Auto-restart development server
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Git**: Version control

---

## 📊 Project Status

### Backend API Status: ✅ 19/19 APIs Complete (100%)

#### Authentication APIs (4/4) ✅
- ✅ `POST /api/auth/register-tenant` - Register new tenant with admin user
- ✅ `POST /api/auth/login` - User login with tenant subdomain
- ✅ `GET /api/auth/me` - Get current authenticated user
- ✅ `POST /api/auth/logout` - User logout

#### Tenant APIs (3/3) ✅
- ✅ `GET /api/tenants/:id` - Get tenant details
- ✅ `PUT /api/tenants/:id` - Update tenant information
- ✅ `GET /api/tenants` - List all tenants (Super Admin only)

#### User APIs (4/4) ✅
- ✅ `POST /api/tenants/:id/users` - Create new user in tenant
- ✅ `GET /api/tenants/:id/users` - List all users in tenant
- ✅ `PUT /api/users/:id` - Update user details
- ✅ `DELETE /api/users/:id` - Delete user

#### Project APIs (4/4) ✅
- ✅ `POST /api/projects` - Create new project
- ✅ `GET /api/projects` - List all projects (with search/filter)
- ✅ `PUT /api/projects/:id` - Update project
- ✅ `DELETE /api/projects/:id` - Delete project

#### Task APIs (4/4) ✅
- ✅ `POST /api/projects/:id/tasks` - Create task in project
- ✅ `GET /api/projects/:id/tasks` - List all tasks in project
- ✅ `PATCH /api/tasks/:id/status` - Update task status
- ✅ `PUT /api/tasks/:id` - Update task details
- ✅ `DELETE /api/tasks/:id` - Delete task (Bonus API)

**Total: 20 API endpoints implemented**

### Frontend Status: ✅ 14/19 APIs Integrated (74%)

#### Implemented in UI ✅
1. ✅ Register Tenant - Registration page with form
2. ✅ Login - Login page with subdomain field
3. ✅ Get Current User - Navbar profile display
4. ✅ Logout - User dropdown menu
5. ✅ Get Tenant Details - Settings page
6. ✅ Update Tenant - Settings edit functionality
7. ✅ Create User - Users page with modal
8. ✅ List Users - Users table display
9. ✅ Delete User - Users table action
10. ✅ Create Project - Projects page with modal
11. ✅ List Projects - Projects grid display
12. ✅ Create Task - Project details page
13. ✅ List Tasks - Kanban board view
14. ✅ Update Task Status - Drag and status buttons

#### Pending in UI ⏳
15. ⏳ List All Tenants (Super Admin) - Admin page created, needs integration
16. ⏳ Update User - Edit modal structure exists
17. ⏳ Update Project - Edit functionality structure exists
18. ⏳ Delete Project - Delete confirmation exists
19. ⏳ Update Task - Edit modal structure exists
20. ⏳ Delete Task - Delete confirmation exists

**Note**: The frontend has all components and UI elements built. The pending items require connecting existing UI components to backend APIs.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js**: v18.0.0 or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm**: v9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`

- **PostgreSQL**: v14.0 or higher
  - Download: https://www.postgresql.org/download/
  - Verify: `psql --version`

- **Git**: Latest version
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional but Recommended

- **pgAdmin 4**: PostgreSQL GUI tool
- **Postman**: API testing tool
- **VS Code**: Code editor with recommended extensions
  - ESLint
  - Prettier
  - PostgreSQL
  - Tailwind CSS IntelliSense

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Internet**: Required for npm package installation

---

## 📥 Installation Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd multi-tenant-saas-platform

# Or if you have the project folder
cd GPP-Task3-Multi-Tenant-SaaS-Platform-with-Project-Task-Management
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Expected packages installed:
# - express, pg, bcryptjs, jsonwebtoken, cors, helmet
# - express-validator, winston, morgan, dotenv
# - nodemon (dev dependency)
```

**Verify installation:**
```bash
# Check if node_modules folder exists
ls node_modules

# Should see folders for all dependencies
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Expected packages installed:
# - react, react-dom, react-router-dom
# - axios, tailwindcss, framer-motion
# - react-hot-toast, react-icons, date-fns
# - vite (dev dependency)
```

**Verify installation:**
```bash
# Check if node_modules folder exists
ls node_modules

# Should see folders for all dependencies
```

### Step 4: Verify Installation

```bash
# Backend verification
cd backend
npm list --depth=0

# Frontend verification
cd ../frontend
npm list --depth=0
```

---

## 🗄️ Database Setup

### Step 1: Start PostgreSQL Service

**Windows:**
```bash
# Open Services (services.msc)
# Find "postgresql-x64-14" (or your version)
# Click "Start" if not running

# Or using command line:
net start postgresql-x64-14
```

**macOS:**
```bash
# Using Homebrew
brew services start postgresql@14

# Or directly
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**
```bash
# Using systemctl
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# You'll be prompted for password
# Default password is often: postgres
```

**In PostgreSQL prompt:**
```sql
-- Create the database
CREATE DATABASE multitenant_saas;

-- Verify database created
\l

-- Connect to the database
\c multitenant_saas

-- You should see: "You are now connected to database "multitenant_saas""
```

### Step 3: Run Database Migrations

**Option A: Using psql (Recommended)**

```bash
# Navigate to migrations folder
cd backend/migrations

# Run the migration script
psql -U postgres -d multitenant_saas -f 001_initial_schema.sql

# Expected output: Multiple "CREATE TABLE" messages
```

**Option B: Using npm script**

```bash
# From backend directory
cd backend

# Run migration
npm run migrate

# This executes: node migrations/run-migrations.js
```

### Step 4: Verify Database Schema

```sql
-- Connect to database
psql -U postgres -d multitenant_saas

-- List all tables
\dt

-- Should see:
-- tenants
-- users
-- projects
-- tasks

-- Check tenants table structure
\d tenants

-- Check users table structure
\d users

-- Check projects table structure
\d projects

-- Check tasks table structure
\d tasks

-- Verify UUID extension
SELECT uuid_generate_v4();

-- Should return a UUID like: 550e8400-e29b-41d4-a716-446655440000
```

### Step 5: Seed Demo Data

```bash
# Navigate to seeds folder
cd backend/seeds

# Run the seed script
psql -U postgres -d multitenant_saas -f 001_seed_data.sql

# Expected output: Multiple "INSERT" messages
```

**Or using npm:**
```bash
cd backend
npm run seed
```

### Step 6: Verify Seed Data

```sql
-- Connect to database
psql -U postgres -d multitenant_saas

-- Check tenants
SELECT id, name, subdomain, subscription_plan FROM tenants;

-- Should see:
-- System tenant (subdomain: system)
-- Demo tenant (subdomain: demo)

-- Check users
SELECT id, email, full_name, role FROM users;

-- Should see:
-- superadmin@system.com (super_admin)
-- admin@demo.com (tenant_admin)
-- user@demo.com (user)

-- Check projects
SELECT id, name, status FROM projects;

-- Should see sample projects

-- Check tasks
SELECT id, title, status, priority FROM tasks;

-- Should see sample tasks
```

### Database Troubleshooting

**Issue: "peer authentication failed"**
```bash
# Edit pg_hba.conf
# Find: local all all peer
# Change to: local all all md5
# Restart PostgreSQL
```

**Issue: "database does not exist"**
```bash
# Create database manually
createdb -U postgres multitenant_saas
```

**Issue: "UUID extension not found"**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## ⚙️ Configuration

### Step 1: Backend Configuration

**Create `.env` file in `backend/` directory:**

```bash
# Navigate to backend folder
cd backend

# Copy example env file
cp .env.example .env

# Or create manually
touch .env
```

**Edit `backend/.env` with your settings:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multitenant_saas
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important Notes:**
- Replace `your_postgres_password_here` with your actual PostgreSQL password
- Change `JWT_SECRET` to a strong, random string (minimum 32 characters)
- For production, use environment-specific secrets

**Verify configuration:**
```bash
# Check if .env file exists and has content
cat .env

# Make sure .env is in .gitignore
grep .env .gitignore
```

### Step 2: Frontend Configuration

**Create `.env` file in `frontend/` directory:**

```bash
# Navigate to frontend folder
cd frontend

# Create .env file
touch .env
```

**Edit `frontend/.env`:**

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Multi-Tenant SaaS Platform
VITE_APP_VERSION=1.0.0
```

**Note:** Vite requires environment variables to be prefixed with `VITE_`

### Step 3: Verify Configuration Files

**Backend config verification:**
```bash
cd backend

# Check database config
cat src/config/database.js

# Should read from process.env.DB_*
```

**Frontend config verification:**
```bash
cd frontend

# Check API service
cat src/services/api.js

# Should use import.meta.env.VITE_API_URL
```

### Configuration Checklist

- [ ] `backend/.env` file created
- [ ] PostgreSQL password updated in `backend/.env`
- [ ] JWT secret changed in `backend/.env`
- [ ] `frontend/.env` file created
- [ ] API URL configured in `frontend/.env`
- [ ] Both `.env` files in `.gitignore`
- [ ] No sensitive data committed to Git

---

## 🐳 Docker Setup (Quick Start)

Run the entire application stack using Docker in under 5 minutes!

### Prerequisites for Docker

- **Docker**: v20.0.0 or higher
  - Download: https://www.docker.com/get-started
  - Verify: `docker --version`

- **Docker Compose**: v2.0.0 or higher (included with Docker Desktop)
  - Verify: `docker-compose --version`

### Step 1: Pull Docker Images
```bash
# Pull backend image
docker pull sabbellalaharika/gpp-task3-backend:latest

# Pull frontend image
docker pull sabbellalaharika/gpp-task3-frontend:latest

# Pull PostgreSQL image
docker pull postgres:14
```

### Step 2: Create Docker Compose File

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14
    container_name: multitenant-postgres
    environment:
      POSTGRES_DB: multitenant_saas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    image: sabbellalaharika/gpp-task3-backend:latest
    container_name: multitenant-backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: multitenant_saas
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your_super_secret_jwt_key_change_this_in_production_min_32_chars
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "5000:5000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Application
  frontend:
    image: sabbellalaharika/gpp-task3-frontend:latest
    container_name: multitenant-frontend
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:5000
    ports:
      - "3000:3000"

volumes:
  postgres_data:
    driver: local
```

### Step 3: Start Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 4: Initialize Database
```bash
# Run migrations (if not auto-run)
docker-compose exec backend npm run migrate

# Run seeds
docker-compose exec backend npm run seed

```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Docker Management Commands
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d multitenant_saas

# Rebuild and restart
docker-compose up -d --build
```

### Troubleshooting Docker

**Issue: Port already in use**
```bash
# Change ports in docker-compose.yml
ports:
  - "5001:5000"  # Backend
  - "3001:3000"  # Frontend
  - "5433:5432"  # Database
```

**Issue: Database not ready**
```bash
# Check database health
docker-compose ps

# Wait for health check to pass
docker-compose logs postgres
```

**Issue: Backend can't connect to database**
```bash
# Ensure DB_HOST=postgres (container name)
# Not localhost or 127.0.0.1
```

### Docker vs Manual Setup

| Feature | Docker | Manual |
|---------|--------|--------|
| Setup Time | 5 minutes | 30+ minutes |
| Dependencies | Docker only | Node, PostgreSQL, npm |
| Isolation | Complete | System-wide |
| Portability | High | Medium |
| Best For | Quick start, testing | Development, debugging |

---

## 🚀 Running the Application

### Step 1: Start PostgreSQL

**Ensure PostgreSQL is running:**

```bash
# Windows
net start postgresql-x64-14

# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

**Verify connection:**
```bash
psql -U postgres -c "SELECT version();"
```

### Step 2: Start Backend Server

**Terminal 1 - Backend:**

```bash
# Navigate to backend directory
cd backend

# Start development server
npm run dev

# Or start production server
npm start
```

**Expected Output:**
```
[nodemon] starting `node src/server.js`
✅ Connected to PostgreSQL database
✅ Database connection established
🚀 Server running on port 5000
📡 Environment: development
🔗 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
```

**Verify backend is running:**
```bash
# Open new terminal
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Step 3: Start Frontend Application

**Terminal 2 - Frontend:**

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Verify frontend is running:**
- Open browser: http://localhost:3000
- You should see the login page with blue-purple gradient

### Step 4: Access the Application

**Open browser and navigate to:**
```
http://localhost:3000
```

**You should see:**
- Modern login page with gradient background
- Email, Password, and Subdomain input fields
- "Sign In" button
- "Sign up" link at the bottom

### Step 5: Login with Demo Credentials

**Demo Admin Account:**
```
Email: admin@demo.com
Password: Demo@123
Subdomain: demo
```

**Super Admin Account:**
```
Email: superadmin@system.com
Password: Admin@123
Subdomain: system
```

**Regular User Account:**
```
Email: user@demo.com
Password: User@123
Subdomain: demo
```

### Step 6: Verify Application is Working

After successful login, you should see:

1. ✅ **Dashboard Page**
   - Stats cards showing counts
   - Recent projects list
   - Navigation sidebar
   - User profile in navbar

2. ✅ **Navigation Works**
   - Click "Projects" in sidebar
   - See projects grid
   - Click "Users" in sidebar
   - See users table

3. ✅ **Create Functionality**
   - Click "New Project" button
   - Modal opens
   - Can fill form and submit

### Running Both Servers Simultaneously

**Option A: Two Terminal Windows**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Option B: Using Concurrently (if installed)**
```bash
# From root directory
npm install -g concurrently

# Create script in root package.json
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

**Option C: Using tmux (Linux/macOS)**
```bash
# Start tmux
tmux

# Split pane
Ctrl+B then "

# In first pane: cd backend && npm run dev
# In second pane: cd frontend && npm run dev
```

### Stopping the Application

**To stop servers:**
```bash
# In each terminal window
Ctrl + C

# Or close terminal windows
```

**To stop PostgreSQL:**
```bash
# Windows
net stop postgresql-x64-14

# macOS
brew services stop postgresql@14

# Linux
sudo systemctl stop postgresql
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All API requests (except register and login) require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints Overview

#### 🔐 Authentication APIs

##### 1. Register Tenant
```http
POST /api/auth/register-tenant
Content-Type: application/json

{
  "tenantName": "Tech Company",
  "subdomain": "techco",
  "adminEmail": "admin@techco.com",
  "adminPassword": "Admin@123",
  "adminFullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": { "id": "...", "name": "Tech Company", "subdomain": "techco" },
    "user": { "id": "...", "email": "admin@techco.com", "role": "tenant_admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "admin@demo.com",
    "fullName": "Demo Admin",
    "role": "tenant_admin",
    "tenantId": "...",
    "tenantName": "Demo Company"
  }
}
```

##### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 🏢 Tenant APIs

##### 5. Get Tenant Details
```http
GET /api/tenants/:tenantId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscription_plan": "professional",
    "max_users": 50,
    "max_projects": 100,
    "total_users": 3,
    "total_projects": 5,
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

##### 6. Update Tenant
```http
PUT /api/tenants/:tenantId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Demo Company International"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "...",
    "name": "Demo Company International",
    "subdomain": "demo"
  }
}
```

##### 7. List All Tenants (Super Admin Only)
```http
GET /api/tenants?page=1&limit=10&status=active&search=demo
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "...",
        "name": "Demo Company",
        "subdomain": "demo",
        "status": "active",
        "subscription_plan": "professional",
        "total_users": 3,
        "total_projects": 5
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 👥 User APIs

##### 8. Create User
```http
POST /api/tenants/:tenantId/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@demo.com",
  "password": "User@123",
  "fullName": "New User",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "email": "newuser@demo.com",
    "fullName": "New User",
    "role": "user",
    "isActive": true
  }
}
```

##### 9. List Tenant Users
```http
GET /api/tenants/:tenantId/users
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "...",
        "email": "admin@demo.com",
        "fullName": "Demo Admin",
        "role": "tenant_admin",
        "isActive": true,
        "created_at": "2024-12-20T10:00:00Z"
      }
    ],
    "total": 3
  }
}
```

##### 10. Update User
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "role": "tenant_admin",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "...",
    "fullName": "Updated Name",
    "role": "tenant_admin",
    "isActive": true
  }
}
```

##### 11. Delete User
```http
DELETE /api/users/:userId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### 📊 Project APIs

##### 12. Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "...",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "created_by": "...",
    "created_at": "2024-12-26T10:00:00Z"
  }
}
```

##### 13. List Projects
```http
GET /api/projects?search=website&status=active&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "...",
        "name": "Website Redesign",
        "description": "Complete redesign",
        "status": "active",
        "task_count": 5,
        "created_by_name": "Demo Admin",
        "created_at": "2024-12-26T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

##### 14. Update Project
```http
PUT /api/projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign v2.0",
  "description": "Updated requirements",
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "...",
    "name": "Website Redesign v2.0",
    "status": "in_progress"
  }
}
```

##### 15. Delete Project
```http
DELETE /api/projects/:projectId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

#### ✅ Task APIs

##### 16. Create Task
```http
POST /api/projects/:projectId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create wireframes and mockups",
  "priority": "high",
  "assignedTo": "user-id-here",
  "dueDate": "2024-12-31"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "...",
    "title": "Design homepage mockup",
    "description": "Create wireframes and mockups",
    "status": "todo",
    "priority": "high",
    "assigned_to": "...",
    "due_date": "2024-12-31"
  }
}
```

##### 17. List Project Tasks
```http
GET /api/projects/:projectId/tasks?status=todo&priority=high
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "...",
        "title": "Design homepage mockup",
        "description": "Create wireframes",
        "status": "todo",
        "priority": "high",
        "assigned_to_name": "John Doe",
        "due_date": "2024-12-31",
        "created_at": "2024-12-26T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

##### 18. Update Task Status
```http
PATCH /api/tasks/:taskId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "...",
    "status": "in_progress"
  }
}
```

##### 19. Update Task
```http
PUT /api/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "assignedTo": "new-user-id",
  "dueDate": "2025-01-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "...",
    "title": "Updated title",
    "priority": "medium"
  }
}
```

##### 20. Delete Task (Bonus API)
```http
DELETE /api/tasks/:taskId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Error Responses

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### API Testing with curl

**Register tenant:**
```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "subdomain": "testco",
    "adminEmail": "admin@testco.com",
    "adminPassword": "Admin@123",
    "adminFullName": "Test Admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'
```

**Get projects (with token):**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

For complete API documentation with Postman collection, see: [API Documentation](docs/api-documentation.md)

---

## 🎨 Frontend Features

### Pages and Components

#### 1. **Login Page** (`/login`)
- Email, password, and subdomain inputs
- Form validation
- Error handling
- Beautiful gradient background
- Responsive design

#### 2. **Registration Page** (`/register`)
- Tenant registration form
- Organization name, subdomain, admin details
- Password strength validation
- Auto-login after registration
- Link back to login

#### 3. **Dashboard** (`/dashboard`)
- Overview statistics cards:
  - Total Projects
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
- Recent projects list
- Quick navigation cards
- Greeting message based on time

#### 4. **Projects Page** (`/projects`)
- Grid view of all projects
- Search functionality
- Status filter (Active, Archived, Completed)
- Create new project modal
- Edit project modal
- Delete confirmation dialog
- Project cards showing:
  - Project name
  - Description (truncated)
  - Status badge
  - Task count
  - Created date
  - Edit/Delete buttons

#### 5. **Project Details Page** (`/projects/:id`)
- Back navigation to projects
- Project name header
- Add Task button
- **Kanban Board** with 3 columns:
  - To Do (gray)
  - In Progress (blue)
  - Completed (green)
- Task cards showing:
  - Title
  - Description
  - Priority badge (Low/Medium/High)
  - Assigned user
  - Due date
  - Action buttons (Start/Complete)
  - Edit/Delete icons
- Create task modal
- Edit task modal
- Delete task confirmation

#### 6. **Users Page** (`/users`)
- Table view of all users
- Add User button
- User table columns:
  - Name
  - Email
  - Role (badge)
  - Status (Active/Inactive badge)
  - Created Date
  - Actions (Edit/Delete icons)
- Create user modal
- Edit user modal
- Delete confirmation dialog

#### 7. **Settings Page** (`/settings`)
- Two sections:
  - **Tenant Information:**
    - Organization name
    - Subdomain
    - Subscription plan
    - Max users/projects
    - Edit button
  - **User Profile:**
    - Full name
    - Email
    - Role

#### 8. **Admin Tenants Page** (`/admin/tenants`) (Super Admin Only)
- List of all tenants
- Search and filter functionality
- Tenant cards/table showing:
  - Organization name
  - Subdomain
  - Subscription plan
  - Status
  - User count
  - Project count
  - Created date
- Pagination

### UI Components

#### Common Components
- **Button**: Customizable with variants (primary, secondary, danger)
- **Input**: Form input with label, error, and icon support
- **Modal**: Reusable modal dialog
- **Loading**: Spinner for async operations
- **Badge**: Color-coded status badges
- **EmptyState**: Placeholder for empty lists
- **ConfirmDialog**: Confirmation for destructive actions

#### Layout Components
- **Layout**: Main application layout wrapper
- **Navbar**: Top navigation with user profile
- **Sidebar**: Left navigation menu

#### Auth Components
- **PrivateRoute**: Route protection wrapper
- **RoleGuard**: Permission-based rendering

### Styling Features

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Blue-purple gradient theme
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and effects
- **Dark Mode Ready**: Color scheme prepared
- **Custom Scrollbars**: Styled scrollbars
- **Hover Effects**: Interactive feedback
- **Focus States**: Accessibility compliance

### State Management

- **Auth Context**: Global authentication state
- **Local Storage**: Persistent token storage
- **React Hooks**: useState, useEffect, useContext
- **Form State**: Controlled components

---

## 📁 Project Structure

```
multi-tenant-saas-platform/
│
├── backend/                          # Backend application
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── projectController.js # Project CRUD logic
│   │   │   ├── taskController.js    # Task CRUD logic
│   │   │   ├── userController.js    # User management logic
│   │   │   └── tenantController.js  # Tenant management logic
│   │   ├── db/
│   │   │   └── pool.js              # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── authenticate.js      # JWT authentication middleware
│   │   │   ├── authorize.js         # Role-based authorization
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   ├── tenantFilter.js      # Tenant isolation middleware
│   │   │   └── validator.js         # Input validation middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Authentication endpoints
│   │   │   ├── projectRoutes.js     # Project endpoints
│   │   │   ├── taskRoutes.js        # Task endpoints
│   │   │   ├── userRoutes.js        # User endpoints
│   │   │   └── tenantRoutes.js      # Tenant endpoints
│   │   ├── services/
│   │   │   ├── authService.js       # Authentication business logic
│   │   │   ├── projectService.js    # Project business logic
│   │   │   ├── taskService.js       # Task business logic
│   │   │   ├── userService.js       # User business logic
│   │   │   └── tenantService.js     # Tenant business logic
│   │   ├── utils/
│   │   │   └── logger.js            # Winston logger configuration
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── migrations/
│   │   ├── 001_create_tenants.sql   # Database schema for tenants table
│   │   ├── 002_create_users.sql     # Database schema for users table
│   │   ├── 003_create_projects.sql  # Database schema for projects table
│   │   ├── 004_create_tasks.sql     # Database schema for tasks table
│   │   ├── 005_create_audit_logs.sql# Database schema for audit_logs table
│   │   └── run-migrations.js        # Migration runner script
│   ├── seeds/
│   │   ├── seed_projects.js        # Demo data seed for projects
│   │   ├── seed_super_admin.js     # Demo data seed for super_admin
│   │   ├── seed_tasks.js           # Demo data seed for tasks
│   │   ├── seed_tenants.js         # Demo data seed for tenants
│   │   ├── seed_users.js           # Demo data seed for users
│   │   └── run-seeds.js             # Seed runner script
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # Backend dependencies
│   └── README.md                    # Backend documentation
│
├── frontend/                         # Frontend application
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── PrivateRoute.jsx  # Protected route wrapper
│   │   │   │   └── RoleGuard.jsx     # Role-based rendering
│   │   │   ├── Common/
│   │   │   │   ├── Badge.jsx         # Status badges
│   │   │   │   ├── Button.jsx        # Reusable button
│   │   │   │   ├── ConfirmDialog.jsx # Confirmation dialog
│   │   │   │   ├── EmptyState.jsx    # Empty state placeholder
│   │   │   │   ├── Input.jsx         # Form input
│   │   │   │   ├── Loading.jsx       # Loading spinner
│   │   │   │   └── Modal.jsx         # Modal dialog
│   │   │   └── Layout/
│   │   │       ├── Layout.jsx        # Main layout wrapper
│   │   │       ├── Navbar.jsx        # Top navigation
│   │   │       └── Sidebar.jsx       # Side navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Dashboard.jsx         # Dashboard page
│   │   │   ├── Projects.jsx          # Projects list page
│   │   │   ├── ProjectDetails.jsx    # Project details & Kanban
│   │   │   ├── Users.jsx             # Users management page
│   │   │   ├── AdminTenants.jsx      # All tenants (super admin)
│   │   │   └── Settings.jsx          # Settings page
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance configuration
│   │   │   ├── authService.js        # Auth API calls
│   │   │   ├── projectService.js     # Project API calls
│   │   │   ├── taskService.js        # Task API calls
│   │   │   ├── userService.js        # User API calls
│   │   │   └── tenantService.js      # Tenant API calls
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   └── helpers.js            # Helper functions
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # App entry point
│   │   └── index.css                 # Global styles
│   ├── .env.example                  # Frontend env template
│   ├── .gitignore                    # Git ignore rules
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Frontend dependencies
│   ├── postcss.config.js             # PostCSS configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── vite.config.js                # Vite configuration
│
├── docs/                             # Documentation
│   ├── images/
│   │   ├── system-architecture.png   # Architecture diagram
│   │   └── database-erd.png          # Database ERD
│   ├── PRD.md                        # Product Requirements Document
│   ├── architecture.md               # Architecture documentation
│   ├── technical-spec.md             # Technical specifications
│   ├── research.md                   # Research and analysis
│   └── API.md                        # API documentation
│
├── .gitignore                        # Root git ignore
└── README.md                         # This file
```

### Key Directories Explained

**Backend Structure:**
- `config/`: Configuration files (database, JWT, etc.)
- `controllers/`: Request handlers and response logic
- `db/`: Database connection setup
- `middleware/`: Express middleware (auth, validation, errors)
- `routes/`: API route definitions
- `services/`: Business logic layer
- `utils/`: Utility functions (logging, helpers)
- `migrations/`: Database schema migrations
- `seeds/`: Database seed data

**Frontend Structure:**
- `components/`: Reusable React components
- `context/`: React Context providers
- `pages/`: Page-level components
- `services/`: API service layer
- `utils/`: Helper functions and constants

**Documentation:**
- `docs/`: All project documentation
- `images/`: Architecture and design diagrams
- Markdown files for specifications

---

## 📚 Documentation

### Complete Documentation Suite

This project includes comprehensive documentation:

1. **[Product Requirements Document (PRD)](docs/PRD.md)**
   - Product vision and goals
   - User stories and requirements
   - Feature specifications
   - Success metrics

2. **[System Architecture](docs/architecture.md)**
   - High-level architecture overview
   - Component diagrams
   - Data flow diagrams
   - Technology decisions

3. **[Technical Specifications](docs/technical-spec.md)**
   - Detailed technical design
   - API specifications
   - Database schema
   - Security implementation

4. **[Research Document](docs/research.md)**
   - Market analysis
   - Technology research
   - Best practices
   - Competitive analysis

5. **[Setup Guide](docs/SETUP-GUIDE.md)**
   - Development environment setup
   - Configuration instructions
   - Deployment guidelines

### Architecture Diagrams

**System Architecture:**
![System Architecture](docs/images/system-architecture.png)
*Three-tier architecture with React frontend, Express backend, and PostgreSQL database*

**Database Schema:**
![Database ERD](docs/images/database-erd.png)
*Entity-Relationship Diagram showing tenants, users, projects, and tasks*

### API Documentation

For complete API documentation with request/response examples:
- See [API Documentation](#api-documentation) section above
- Postman collection available in `/docs/postman/`
- OpenAPI/Swagger specification in `/docs/openapi.yaml`

---

## 🧪 Testing

### Manual Testing

#### Test Authentication Flow
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenantName":"Test","subdomain":"test","adminEmail":"test@test.com","adminPassword":"Test@123","adminFullName":"Test User"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Demo@123","tenantSubdomain":"demo"}'

# Save the token from response
TOKEN="<token_from_login_response>"

# Test protected endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Project Management
```bash
# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Testing","status":"active"}'

# List projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Update project
curl -X PUT http://localhost:5000/api/projects/<project_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Project","status":"completed"}'

# Delete project
curl -X DELETE http://localhost:5000/api/projects/<project_id> \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Task Management
```bash
# Create task
curl -X POST http://localhost:5000/api/projects/<project_id>/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing","priority":"high"}'

# List tasks
curl -X GET http://localhost:5000/api/projects/<project_id>/tasks \
  -H "Authorization: Bearer $TOKEN"

# Update task status
curl -X PATCH http://localhost:5000/api/tasks/<task_id>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# Update task
curl -X PUT http://localhost:5000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","priority":"low"}'

# Delete task
curl -X DELETE http://localhost:5000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Testing Checklist

- [ ] **Login Page**
  - [ ] Can enter credentials
  - [ ] Form validation works
  - [ ] Error messages display
  - [ ] Successful login redirects to dashboard
  - [ ] Sign up link navigates to registration

- [ ] **Registration Page**
  - [ ] All fields required
  - [ ] Password strength validation
  - [ ] Subdomain uniqueness check
  - [ ] Successful registration auto-logs in

- [ ] **Dashboard**
  - [ ] Stats cards load correctly
  - [ ] Recent projects display
  - [ ] Navigation works
  - [ ] User profile shows in navbar

- [ ] **Projects**
  - [ ] Projects list displays
  - [ ] Search works
  - [ ] Filter works
  - [ ] Create project modal opens
  - [ ] Project created successfully
  - [ ] Edit project works
  - [ ] Delete project shows confirmation
  - [ ] Project deleted successfully

- [ ] **Project Details**
  - [ ] Kanban board displays
  - [ ] Tasks in correct columns
  - [ ] Add task modal opens
  - [ ] Task created successfully
  - [ ] Start button moves task to In Progress
  - [ ] Complete button moves task to Completed
  - [ ] Edit task works
  - [ ] Delete task works

- [ ] **Users**
  - [ ] Users table displays
  - [ ] Add user modal opens
  - [ ] User created successfully
  - [ ] Edit user works
  - [ ] Delete user works

- [ ] **Settings**
  - [ ] Tenant information displays
  - [ ] Edit tenant works
  - [ ] User profile displays

- [ ] **Super Admin**
  - [ ] Login as super admin
  - [ ] All tenants page visible
  - [ ] Tenants list displays
  - [ ] Search and filter work

### Backend API Testing

#### Using curl (see examples above)
#### Using Postman
1. Import Postman collection from `/docs/postman/`
2. Set environment variables (API_URL, TOKEN)
3. Run entire collection or individual requests

#### Using Automated Tests
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Backend Won't Start

**Symptoms:**
- `npm run dev` fails
- Error: "Cannot find module"
- Error: "Port 5000 already in use"

**Solutions:**
```bash
# Check if dependencies are installed
cd backend
npm install

# Check if port is in use
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Try different port
# Edit .env: PORT=5001
```

#### Issue 2: Database Connection Failed

**Symptoms:**
- "Database connection failed"
- "ECONNREFUSED"
- "password authentication failed"

**Solutions:**
```bash
# Check if PostgreSQL is running
# Windows: services.msc
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Test connection manually
psql -U postgres -d multitenant_saas

# Check .env file has correct credentials
cat backend/.env

# Recreate database
psql -U postgres
DROP DATABASE IF EXISTS multitenant_saas;
CREATE DATABASE multitenant_saas;
\q

# Run migrations again
cd backend/migrations
psql -U postgres -d multitenant_saas -f 001_initial_schema.sql
```

#### Issue 3: Frontend Won't Start

**Symptoms:**
- `npm start` fails
- White screen
- Blank page

**Solutions:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear cache
rm -rf .vite node_modules/.vite

# Check if backend is running
curl http://localhost:5000/health

# Check .env file
cat .env
```

#### Issue 4: Login Not Working

**Symptoms:**
- "Invalid credentials"
- "User not found"
- "Tenant not found"

**Solutions:**
```sql
-- Check if demo user exists
psql -U postgres -d multitenant_saas

SELECT * FROM users WHERE email = 'admin@demo.com';
SELECT * FROM tenants WHERE subdomain = 'demo';

-- If no results, run seed script again
\i backend/seeds/001_seed_data.sql
```

**Check backend logs:**
```bash
# Look for error messages in terminal where backend is running
```

**Check browser console:**
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors (red text)
```

#### Issue 5: Tasks Not Loading

**Symptoms:**
- Clicking project shows empty Kanban
- "Failed to load tasks" error

**Solutions:**
```bash
# Check backend logs for errors
# Common issue: created_by column missing

# Solution: Recreate database with correct schema
psql -U postgres -d postgres -f backend/migrations/RECREATE-FROM-POSTGRES.sql
```

#### Issue 6: CORS Errors

**Symptoms:**
- "CORS policy blocked"
- "Access-Control-Allow-Origin" error

**Solutions:**
```javascript
// Check backend/.env
CORS_ORIGIN=http://localhost:3000

// Check backend/src/app.js has cors configured
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

#### Issue 7: JWT Token Errors

**Symptoms:**
- "Invalid token"
- "Token expired"
- "No token provided"

**Solutions:**
```bash
# Check JWT_SECRET in backend/.env
JWT_SECRET=your_secret_key_min_32_chars

# Clear browser local storage
# F12 → Application → Local Storage → Clear

# Login again to get new token
```

#### Issue 8: Build Failures

**Symptoms:**
- `npm run build` fails
- Deployment errors

**Solutions:**
```bash
# Frontend build
cd frontend
rm -rf dist
npm run build

# Check for build errors
# Usually CSS or import issues

# Backend (no build needed for Node)
cd backend
npm install --production
```

### Database Issues

#### Reset Database Completely
```sql
-- Connect to postgres database
psql -U postgres -d postgres

-- Drop and recreate
DROP DATABASE IF EXISTS multitenant_saas;
CREATE DATABASE multitenant_saas;

\c multitenant_saas

-- Enable UUID
CREATE EXTENSION "uuid-ossp";

-- Run migration
\i /path/to/backend/migrations/001_initial_schema.sql

-- Run seed
\i /path/to/backend/seeds/001_seed_data.sql
```

#### Check Database Schema
```sql
\c multitenant_saas

-- List all tables
\dt

-- Check specific table
\d users
\d tasks

-- Verify data
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
```

### Performance Issues

#### Slow API Responses
```sql
-- Check for missing indexes
\di

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tasks WHERE project_id = 'some-uuid';
```

#### Frontend Slow
```bash
# Check network tab in browser DevTools
# Look for slow API calls

# Optimize bundle size
npm run build
# Check dist/assets folder sizes
```

### Debugging Tips

**Enable Debug Logging:**
```javascript
// backend/src/utils/logger.js
// Change level to 'debug'
level: 'debug'
```

**Use console.log strategically:**
```javascript
// In controllers/services
console.log('Request body:', req.body);
console.log('User:', req.user);
console.log('Query result:', result.rows);
```

**Check all logs:**
- Backend terminal
- Frontend terminal  
- Browser console (F12)
- PostgreSQL logs

---

## 🚀 Future Enhancements

### Planned Features

#### Phase 1: Core Enhancements
- [ ] Email notifications for task assignments
- [ ] Real-time updates with WebSockets
- [ ] File attachments for tasks
- [ ] Comments and activity logs
- [ ] Advanced search with filters

#### Phase 2: Collaboration Features
- [ ] Team chat/messaging
- [ ] @mentions in comments
- [ ] Task dependencies
- [ ] Gantt chart view
- [ ] Calendar view

#### Phase 3: Advanced Features
- [ ] Time tracking
- [ ] Billing and invoicing
- [ ] Custom fields
- [ ] Workflow automation
- [ ] API webhooks

#### Phase 4: Enterprise Features
- [ ] SSO integration (SAML, OAuth)
- [ ] Advanced analytics
- [ ] Custom branding per tenant
- [ ] Audit logs
- [ ] Data export/import

#### Phase 5: Mobile & Integrations
- [ ] Mobile app (React Native)
- [ ] Slack integration
- [ ] Jira integration
- [ ] GitHub integration
- [ ] Google Calendar sync

### Technical Improvements

#### Performance
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Lazy loading components
- [ ] Image optimization

#### Security
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting
- [ ] IP whitelisting
- [ ] Security headers enhancement
- [ ] Penetration testing

#### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Load balancing
- [ ] Monitoring and alerting

#### Code Quality
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests with Cypress
- [ ] Code linting rules
- [ ] Documentation generation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

- **Developer**: Sabbella Laharika
- **Project**: Multi-Tenant SaaS Platform
- **Date**: December 2025

---


## 🙏 Acknowledgments

- React team for amazing frontend library
- Express.js community
- PostgreSQL database
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Files**: 25+
- **Frontend Components**: 20+
- **API Endpoints**: 19
- **Database Tables**: 4
- **Development Time**: 40+ hours

---

Last Updated: January 2, 2026
