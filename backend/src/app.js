require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  // ADD THESE: Otherwise the browser will block your injected headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-User-Id',
    'X-User-Email',
    'X-User-Role',
    'X-Tenant-Id'
  ]
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
// Request logging
app.use((req, res, next) => {
  // Extract our custom Swagger headers for the log
  const swaggerHeaders = {
    tenantId: req.headers['x-tenant-id'],
    userId: req.headers['x-user-id'],
    role: req.headers['x-user-role']
  };

  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    // Add this line to see the injected headers in your terminal
    injectedHeaders: swaggerHeaders
  });

  // IMPORTANT: Automatically populate req.user so your controllers work
  if (swaggerHeaders.tenantId) {
    req.user = {
      id: swaggerHeaders.userId,
      email: req.headers['x-user-email'],
      role: swaggerHeaders.role,
      tenantId: swaggerHeaders.tenantId
    };
  }

  next();
});

app.use('/api', healthRoutes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  swaggerOptions: {
    operationsSorter: null, // Disable sorting to respect JSON order
    tagsSorter: null, // Disable tag sorting (optional, but good for custom order)
    persistAuthorization: true,
    responseInterceptor: (res) => {
      // Debug: Log every response to see if we are catching the right one
      if (res.url.includes('/auth/login')) {
        console.log("Swagger: Login response detected!", res);

        // Try to find the token in standard locations
        const token = res.body.data.token;

        if (token) {
          // Save to Browser's LocalStorage
          localStorage.setItem('swagger_token', token);
          console.log("✅ Swagger: Token captured and saved to LocalStorage!");

          // Trigger a UI refresh (optional, helps sometimes)
          window.ui.preauthorizeApiKey("Bearer", token);
        } else {
          console.warn("⚠️ Swagger: Login succeeded but could not find 'token' or 'accessToken' in response body.");
        }
      }
      return res;
    },

    // 2. Inject Token (Runs in Browser)
    requestInterceptor: (req) => {
      // Read from Browser's LocalStorage
      const token = localStorage.getItem('swagger_token');

      if (token) {
        // A. Inject Authorization Header
        req.headers.Authorization = "Bearer " + token;

        // B. Decode Token for Custom Headers (TenantId, UserId)
        try {
          // Simple Base64 decode for the browser
          const payload = JSON.parse(atob(token.split('.')[1]));

          // Force headers
          req.headers['X-Tenant-Id'] = payload.tenantId;
          req.headers['X-User-Id'] = payload.userId || payload.id;
          req.headers['X-User-Email'] = payload.email;
          req.headers['X-User-Role'] = payload.role;

          console.log("💉 Swagger: Auto-injected headers for", req.url);
        } catch (e) {
          console.error("Swagger: Token decode failed", e);
        }
      }
      return req;
    }
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/superadmin', superAdminRoutes);
// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);


module.exports = app;
