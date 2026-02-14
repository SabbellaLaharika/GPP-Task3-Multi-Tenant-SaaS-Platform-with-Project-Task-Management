const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authenticate = require('../middleware/authenticate');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');

// Super Admin Dashboard Stats
/**
 * @swagger
 * /superadmin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Forbidden: Super Admin only"
 *       200:
 *         description: System stats
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalTenants: 50
 *                 totalUsers: 250
 *                 totalProjects: 100
 *                 activeTenants: 45
 */
router.get('/stats', authenticate, checkSuperAdmin, superAdminController.getSystemStats);

// Get all tenants with stats
/**
 * @swagger
 * /superadmin/tenants:
 *   get:
 *     summary: Get all tenants with stats
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants with stats
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 tenants:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Demo Corp"
 *                     userCount: 12
 *                     projectCount: 5
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 */
router.get('/tenants', authenticate, checkSuperAdmin, superAdminController.getAllTenantsWithStats);

/**
 * @swagger
 * /superadmin/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 projects:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Project A"
 *                     tenantName: "Demo Corp"
 *                     status: "active"
 *                 pagination:
 *                   currentPage: 1
 *                   totalProjects: 150
 */
router.get('/projects', authenticate, checkSuperAdmin, superAdminController.getAllProjects);

module.exports = router;