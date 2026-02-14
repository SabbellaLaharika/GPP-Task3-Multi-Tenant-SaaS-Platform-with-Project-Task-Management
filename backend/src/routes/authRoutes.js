const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { validate, schemas } = require('../middleware/validator');

// Public routes
/**
 * @swagger
 * /auth/register-tenant:
 *   post:
 *     summary: Register a new tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantName
 *               - subdomain
 *               - adminEmail
 *               - adminPassword
 *               - adminFullName
 *             properties:
 *               tenantName:
 *                 type: string
 *               subdomain:
 *                 type: string
 *               adminEmail:
 *                 type: string
 *               adminPassword:
 *                 type: string
 *               adminFullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tenant registered successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tenant registered successfully"
 *               data:
 *                 tenantId: "550e8400-e29b-41d4-a716-446655440000"
 *                 subdomain: "demo"
 *                 adminUser:
 *                   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                   role: "tenant_admin"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "\"email\" must be a valid email"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subdomain already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
 */
router.post('/register-tenant', validate(schemas.registerTenant), authController.registerTenant);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               tenantSubdomain:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                   email: "admin@demo.com"
 *                   fullName: "John Doe"
 *                   role: "tenant_admin"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: 86400
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid credentials"
 *       403:
 *         description: Account suspended
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Account suspended/inactive"
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Tenant not found"
 */
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 email: "user@demo.com"
 *                 fullName: "Jane Doe"
 *                 role: "user"
 *                 isActive: true
 *                 tenant:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Demo Company"
 *                   subscriptionPlan: "pro"
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getCurrentUser);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
