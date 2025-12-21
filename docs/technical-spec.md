# Technical Specification Document
## Multi-Tenant SaaS Platform - Project & Task Management

**Version**: 1.0  
**Date**: December 2025  
**Status**: Approved for Development

---

## 📑 Table of Contents

1. [📁 Project Structure](#-project-structure)
2. [⚙️ Development Setup Guide](#️-development-setup-guide)
3. [🐳 Docker Deployment](#-docker-deployment)

---

## 📁 Project Structure

### Complete Project Organization

```
multi-tenant-saas-platform/
├── 📄 .gitignore                    # Git ignore rules
├── 📄 README.md                     # Project documentation
├── 📄 docker-compose.yml            # Docker orchestration
├── 📄 submission.json               # Test credentials for evaluation
│
├── 📂 backend/                      # Backend API (Node.js + Express)
│   ├── 📄 .env                      # Environment variables
│   ├── 📄 .env.example              # Environment template
│   ├── 📄 Dockerfile                # Backend Docker image
│   ├── 📄 package.json              # Node.js dependencies
│   ├── 📄 .eslintrc.js              # ESLint configuration
│   ├── 📄 .prettierrc               # Prettier configuration
│   │
│   ├── 📂 src/                      # Source code
│   │   ├── 📄 server.js             # Entry point
│   │   ├── 📄 app.js                # Express app configuration
│   │   │
│   │   ├── 📂 config/               # Configuration files
│   │   │   ├── 📄 database.js       # Database connection config
│   │   │   ├── 📄 jwt.js            # JWT configuration
│   │   │   └── 📄 constants.js      # Application constants
│   │   │
│   │   ├── 📂 middleware/           # Express middleware
│   │   │   ├── 📄 auth.js           # JWT authentication
│   │   │   ├── 📄 multiTenancy.js   # Tenant isolation
│   │   │   ├── 📄 authorize.js      # Role-based authorization
│   │   │   ├── 📄 validate.js       # Input validation
│   │   │   ├── 📄 errorHandler.js   # Global error handler
│   │   │   └── 📄 rateLimiter.js    # Rate limiting
│   │   │
│   │   ├── 📂 models/               # Database models (if using ORM)
│   │   │   ├── 📄 Tenant.js         # Tenant model
│   │   │   ├── 📄 User.js           # User model
│   │   │   ├── 📄 Project.js        # Project model
│   │   │   ├── 📄 Task.js           # Task model
│   │   │   └── 📄 AuditLog.js       # Audit log model
│   │   │
│   │   ├── 📂 routes/               # API route definitions
│   │   │   ├── 📄 index.js          # Main router
│   │   │   ├── 📄 auth.routes.js    # Auth routes
│   │   │   ├── 📄 tenant.routes.js  # Tenant routes
│   │   │   ├── 📄 user.routes.js    # User routes
│   │   │   ├── 📄 project.routes.js # Project routes
│   │   │   ├── 📄 task.routes.js    # Task routes
│   │   │   └── 📄 health.routes.js  # Health check route
│   │   │
│   │   ├── 📂 controllers/          # Request handlers
│   │   │   ├── 📄 auth.controller.js    # Auth logic
│   │   │   ├── 📄 tenant.controller.js  # Tenant logic
│   │   │   ├── 📄 user.controller.js    # User logic
│   │   │   ├── 📄 project.controller.js # Project logic
│   │   │   ├── 📄 task.controller.js    # Task logic
│   │   │   └── 📄 health.controller.js  # Health check logic
│   │   │
│   │   ├── 📂 services/             # Business logic layer
│   │   │   ├── 📄 auth.service.js       # Auth operations
│   │   │   ├── 📄 tenant.service.js     # Tenant operations
│   │   │   ├── 📄 user.service.js       # User operations
│   │   │   ├── 📄 project.service.js    # Project operations
│   │   │   ├── 📄 task.service.js       # Task operations
│   │   │   └── 📄 audit.service.js      # Audit logging
│   │   │
│   │   ├── 📂 utils/                # Helper functions
│   │   │   ├── 📄 hash.js           # Password hashing utilities
│   │   │   ├── 📄 jwt.js            # JWT utilities
│   │   │   ├── 📄 logger.js         # Winston logger setup
│   │   │   ├── 📄 response.js       # Standard response format
│   │   │   └── 📄 validators.js     # Custom validators
│   │   │
│   │   └── 📂 db/                   # Database related
│   │       ├── 📄 pool.js           # PostgreSQL connection pool
│   │       └── 📄 queries.js        # SQL query helpers
│   │
│   ├── 📂 migrations/               # Database migrations
│   │   ├── 📄 001_create_tenants.sql
│   │   ├── 📄 002_create_users.sql
│   │   ├── 📄 003_create_projects.sql
│   │   ├── 📄 004_create_tasks.sql
│   │   ├── 📄 005_create_audit_logs.sql
│   │   └── 📄 run-migrations.js     # Migration runner script
│   │
│   ├── 📂 seeders/                  # Seed data scripts
│   │   ├── 📄 seed-super-admin.js   # Create super admin
│   │   ├── 📄 seed-tenants.js       # Create test tenants
│   │   ├── 📄 seed-users.js         # Create test users
│   │   ├── 📄 seed-projects.js      # Create test projects
│   │   ├── 📄 seed-tasks.js         # Create test tasks
│   │   └── 📄 run-seeders.js        # Seeder runner script
│   │
│   ├── 📂 tests/                    # Test files
│   │   ├── 📂 unit/                 # Unit tests
│   │   │   ├── 📄 auth.test.js
│   │   │   ├── 📄 tenant.test.js
│   │   │   └── 📄 user.test.js
│   │   ├── 📂 integration/          # Integration tests
│   │   │   ├── 📄 auth.integration.test.js
│   │   │   └── 📄 multitenancy.test.js
│   │   └── 📄 setup.js              # Test setup
│   │
│   └── 📂 scripts/                  # Utility scripts
│       ├── 📄 create-super-admin.js # Manual super admin creation
│       ├── 📄 reset-db.js           # Database reset script
│       └── 📄 generate-jwt-secret.js # JWT secret generator
│
├── 📂 frontend/                     # Frontend React App
│   ├── 📄 .env                      # Environment variables
│   ├── 📄 .env.example              # Environment template
│   ├── 📄 Dockerfile                # Frontend Docker image
│   ├── 📄 package.json              # Node.js dependencies
│   ├── 📄 .eslintrc.js              # ESLint configuration
│   ├── 📄 .prettierrc               # Prettier configuration
│   │
│   ├── 📂 public/                   # Static files
│   │   ├── 📄 index.html            # HTML template
│   │   ├── 📄 favicon.ico           # Favicon
│   │   └── 📄 manifest.json         # PWA manifest
│   │
│   └── 📂 src/                      # Source code
│       ├── 📄 index.js              # Entry point
│       ├── 📄 App.js                # Root component
│       ├── 📄 App.css               # Global styles
│       │
│       ├── 📂 components/           # Reusable components
│       │   ├── 📂 common/           # Common UI components
│       │   │   ├── 📄 Button.jsx
│       │   │   ├── 📄 Input.jsx
│       │   │   ├── 📄 Modal.jsx
│       │   │   ├── 📄 Table.jsx
│       │   │   ├── 📄 Card.jsx
│       │   │   ├── 📄 Spinner.jsx
│       │   │   └── 📄 ErrorMessage.jsx
│       │   │
│       │   ├── 📂 layout/           # Layout components
│       │   │   ├── 📄 Header.jsx
│       │   │   ├── 📄 Sidebar.jsx
│       │   │   ├── 📄 Footer.jsx
│       │   │   └── 📄 Layout.jsx
│       │   │
│       │   ├── 📂 auth/             # Auth components
│       │   │   ├── 📄 LoginForm.jsx
│       │   │   ├── 📄 RegisterForm.jsx
│       │   │   └── 📄 ProtectedRoute.jsx
│       │   │
│       │   ├── 📂 projects/         # Project components
│       │   │   ├── 📄 ProjectList.jsx
│       │   │   ├── 📄 ProjectCard.jsx
│       │   │   ├── 📄 ProjectForm.jsx
│       │   │   └── 📄 ProjectDetails.jsx
│       │   │
│       │   ├── 📂 tasks/            # Task components
│       │   │   ├── 📄 TaskList.jsx
│       │   │   ├── 📄 TaskCard.jsx
│       │   │   ├── 📄 TaskForm.jsx
│       │   │   └── 📄 TaskDetails.jsx
│       │   │
│       │   └── 📂 users/            # User components
│       │       ├── 📄 UserList.jsx
│       │       ├── 📄 UserCard.jsx
│       │       └── 📄 UserForm.jsx
│       │
│       ├── 📂 pages/                # Page components
│       │   ├── 📄 LoginPage.jsx
│       │   ├── 📄 RegisterPage.jsx
│       │   ├── 📄 Dashboard.jsx
│       │   ├── 📄 ProjectsPage.jsx
│       │   ├── 📄 ProjectDetailsPage.jsx
│       │   ├── 📄 TasksPage.jsx
│       │   ├── 📄 UsersPage.jsx
│       │   └── 📄 NotFoundPage.jsx
│       │
│       ├── 📂 context/              # React Context
│       │   ├── 📄 AuthContext.jsx   # Authentication state
│       │   └── 📄 ThemeContext.jsx  # Theme state
│       │
│       ├── 📂 services/             # API service layer
│       │   ├── 📄 api.js            # Axios instance
│       │   ├── 📄 auth.service.js   # Auth API calls
│       │   ├── 📄 tenant.service.js # Tenant API calls
│       │   ├── 📄 user.service.js   # User API calls
│       │   ├── 📄 project.service.js # Project API calls
│       │   └── 📄 task.service.js   # Task API calls
│       │
│       ├── 📂 utils/                # Helper functions
│       │   ├── 📄 constants.js      # Constants
│       │   ├── 📄 validators.js     # Form validators
│       │   ├── 📄 formatters.js     # Data formatters
│       │   └── 📄 storage.js        # localStorage utilities
│       │
│       ├── 📂 hooks/                # Custom React hooks
│       │   ├── 📄 useAuth.js        # Auth hook
│       │   ├── 📄 useApi.js         # API hook
│       │   └── 📄 useForm.js        # Form hook
│       │
│       └── 📂 styles/               # CSS/SCSS files
│           ├── 📄 variables.css     # CSS variables
│           ├── 📄 components.css    # Component styles
│           └── 📄 pages.css         # Page styles
│
└── 📂 docs/                         # Documentation
    ├── 📄 research.md               # Research document ✅
    ├── 📄 PRD.md                    # Product requirements ✅
    ├── 📄 architecture.md           # Architecture doc ✅
    ├── 📄 technical-spec.md         # This document ✅
    ├── 📄 API.md                    # API documentation (optional)
    └── 📂 images/                   # Diagrams and images
        ├── 📄 system-architecture.png
        └── 📄 database-erd.png
```

---

### 📝 Folder Purpose Explanations

#### Backend Structure

| Folder/File | Purpose |
|-------------|---------|
| **src/config/** | Configuration files for database, JWT, and application constants |
| **src/middleware/** | Express middleware for auth, validation, error handling, multi-tenancy |
| **src/models/** | Database models (if using Sequelize/TypeORM) or schema definitions |
| **src/routes/** | API route definitions (maps URLs to controllers) |
| **src/controllers/** | Request handlers (receive requests, call services, return responses) |
| **src/services/** | Business logic layer (handles data operations, validations) |
| **src/utils/** | Helper functions (hashing, JWT, logging, response formatting) |
| **src/db/** | Database connection pool and query helpers |
| **migrations/** | SQL migration files for database schema creation/updates |
| **seeders/** | Scripts to populate database with test data |
| **tests/** | Unit and integration tests |
| **scripts/** | Utility scripts for admin tasks |

#### Frontend Structure

| Folder/File | Purpose |
|-------------|---------|
| **src/components/common/** | Reusable UI components (buttons, inputs, modals, tables) |
| **src/components/layout/** | Layout components (header, sidebar, footer) |
| **src/components/auth/** | Authentication-related components |
| **src/components/projects/** | Project-specific components |
| **src/components/tasks/** | Task-specific components |
| **src/components/users/** | User management components |
| **src/pages/** | Page-level components (one per route) |
| **src/context/** | React Context providers (auth, theme) |
| **src/services/** | API service layer (Axios HTTP calls) |
| **src/utils/** | Helper functions (validators, formatters, storage) |
| **src/hooks/** | Custom React hooks (useAuth, useApi, useForm) |
| **src/styles/** | CSS/SCSS stylesheets |

---

## ⚙️ Development Setup Guide

### 📋 Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | v18.x or v20.x | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| **npm** | v9.x or v10.x | Package manager | Included with Node.js |
| **PostgreSQL** | v14.x or v16.x | Database | [postgresql.org](https://postgresql.org) |
| **Docker** | v24.x+ | Containerization | [docker.com](https://docker.com) |
| **Docker Compose** | v2.x+ | Multi-container orchestration | Included with Docker Desktop |
| **Git** | v2.x+ | Version control | [git-scm.com](https://git-scm.com) |

**Optional but Recommended:**
- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - PostgreSQL GUI
- **VS Code** - Code editor with extensions:
  - ESLint
  - Prettier
  - Thunder Client (API testing)

---

### 🚀 Quick Start (Local Development)

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/multi-tenant-saas-platform.git
cd multi-tenant-saas-platform
```

#### 2️⃣ Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Backend `.env` Configuration:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multitenant_saas
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Or use DATABASE_URL (alternative)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/multitenant_saas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

**Create PostgreSQL Database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE multitenant_saas;

# Exit PostgreSQL
\q
```

**Run Database Migrations:**

```bash
# Run migrations to create tables
npm run migrate

# Run seeders to populate test data
npm run seed
```

**Start Backend Server:**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend should now be running at `http://localhost:5000`

**Test Backend:**

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

---

#### 3️⃣ Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Frontend `.env` Configuration:**

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# App Configuration
REACT_APP_NAME=Multi-Tenant SaaS Platform
REACT_APP_VERSION=1.0.0

# Optional: Enable debugging
REACT_APP_DEBUG=true
```

**Start Frontend Server:**

```bash
# Development mode (with hot reload)
npm start

# Build for production
npm run build
```

Frontend should now be running at `http://localhost:3000`

---

### 🧪 Running Tests

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js
```

#### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (default for create-react-app)
npm test
```

---

### 📦 Package Scripts

#### Backend (`backend/package.json`)

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node migrations/run-migrations.js",
    "seed": "node seeders/run-seeders.js",
    "reset-db": "node scripts/reset-db.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.js\""
  }
}
```

#### Frontend (`frontend/package.json`)

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

---

### 🔐 Test Credentials

After running seeders, you'll have these test accounts:

#### Super Admin (Access to all tenants)
```
Email: admin@platform.com
Password: SuperAdmin123!
Role: super_admin
```

#### Tenant Admin - Acme Corp
```
Email: admin@acme.com
Password: AcmeAdmin123!
Role: tenant_admin
Tenant: Acme Corp (subdomain: acme)
```

#### Regular User - Acme Corp
```
Email: user@acme.com
Password: AcmeUser123!
Role: user
Tenant: Acme Corp (subdomain: acme)
```

#### Tenant Admin - Globex Inc
```
Email: admin@globex.com
Password: GlobexAdmin123!
Role: tenant_admin
Tenant: Globex Inc (subdomain: globex)
```

#### Regular User - Globex Inc
```
Email: user@globex.com
Password: GlobexUser123!
Role: user
Tenant: Globex Inc (subdomain: globex)
```

*All test credentials should be documented in `submission.json` for evaluation.*

---

## 🐳 Docker Deployment

### Docker Compose Setup

The application is fully containerized with Docker. All three services (database, backend, frontend) can be started with a single command.

#### 📄 docker-compose.yml Structure

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:16-alpine
    container_name: multitenant-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: multitenant_saas
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: multitenant-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: multitenant_saas
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your-production-jwt-secret-change-this
      JWT_EXPIRES_IN: 24h
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      database:
        condition: service_healthy
    networks:
      - app-network
    command: sh -c "npm run migrate && npm run seed && npm start"

  # Frontend React App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: multitenant-frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

---

### 🚀 Docker Commands

#### Start All Services

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

#### Stop All Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

#### Rebuild Services

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

#### Access Container Shell

```bash
# Access backend container
docker exec -it multitenant-backend sh

# Access database container
docker exec -it multitenant-db psql -U postgres -d multitenant_saas
```

#### View Service Status

```bash
# Check running containers
docker-compose ps

# Check service health
docker-compose ps database
```

---

### 📄 Backend Dockerfile

```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Stage 2: Production stage
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built node_modules and source from builder
COPY --from=builder --chown=nodejs:nodejs /app .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
```

---

### 📄 Frontend Dockerfile

```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf:**

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### ✅ Verification After Docker Setup

After running `docker-compose up -d`, verify everything is working:

#### 1. Check Service Status
```bash
docker-compose ps

# All services should show "Up" status
```

#### 2. Test Health Endpoint
```bash
curl http://localhost:5000/api/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

#### 3. Test Frontend
```bash
# Open browser
open http://localhost:3000

# You should see the login page
```

#### 4. Test Database Connection
```bash
docker exec -it multitenant-db psql -U postgres -d multitenant_saas -c "\dt"

# Should list all tables: tenants, users, projects, tasks, audit_logs
```

#### 5. Test API Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@platform.com","password":"SuperAdmin123!"}'

# Should return JWT token
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env file
PORT=5001
```

---

#### Issue: Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status  # Linux
brew services list  # Mac

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # Mac

# Check credentials in .env match your PostgreSQL setup
```

---

#### Issue: Migrations Not Running

**Error:** `relation "tenants" does not exist`

**Solution:**
```bash
# Manually run migrations
cd backend
npm run migrate

# Check if tables exist
psql -U postgres -d multitenant_saas -c "\dt"

# If tables don't exist, check migration files
```

---

#### Issue: Frontend Can't Connect to Backend

**Error:** `Network Error` or `CORS Error`

**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:3000

# Check REACT_APP_API_URL in frontend .env
REACT_APP_API_URL=http://localhost:5000

# Restart both servers after changing .env
```

---

#### Issue: Docker Build Fails

**Error:** Various Docker build errors

**Solution:**
```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build

# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
```

---

## 📚 Additional Resources

### Development Tools

- **API Documentation**: Once backend is running, visit `http://localhost:5000/api-docs` for Swagger documentation
- **Database GUI**: Use DBeaver or pgAdmin to visually inspect database
- **API Testing**: Use Postman collection (import from `docs/postman-collection.json`)

### Useful Commands Cheat Sheet

```bash
# Backend Development
npm run dev           # Start with auto-reload
npm run migrate       # Run database migrations
npm run seed          # Populate test data
npm test             # Run tests
npm run lint         # Check code style

# Frontend Development
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code style

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose ps                 # Check service status
docker exec -it multitenant-backend sh  # Access backend shell
```

---

## 📝 Summary

This technical specification provides complete setup instructions for local development and Docker deployment. The project structure is organized for scalability and maintainability, following industry best practices.

**Key Points:**
- ✅ Complete folder structure for backend and frontend
- ✅ Detailed setup instructions for local development
- ✅ Docker Compose configuration for containerized deployment
- ✅ Environment variable documentation
- ✅ Test credentials and verification steps
- ✅ Troubleshooting guide for common issues
