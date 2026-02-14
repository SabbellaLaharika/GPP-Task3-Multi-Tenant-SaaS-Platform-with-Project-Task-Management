const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const tenantFilter = require('../middleware/tenantFilter');

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: List all tenants (Super Admin only)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 tenants:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Demo Corp"
 *                     subdomain: "demo"
 *                     status: "active"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 *                   totalTenants: 50
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Access denied"
 */
router.get('/', authenticate, authorize('super_admin'), tenantController.listAllTenants);
/**
 * @swagger
 * /tenants/{tenantId}:
 *   get:
 *     summary: Get tenant details
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "Demo Corp"
 *                 subdomain: "demo"
 *                 status: "active"
 *                 subscriptionPlan: "pro"
 *                 stats:
 *                   totalUsers: 12
 *                   totalProjects: 5
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Tenant not found"
 */
router.get('/:tenantId', authenticate, tenantFilter, tenantController.getTenantDetails);
/**
 * @swagger
 * /tenants/{tenantId}:
 *   put:
 *     summary: Update tenant details
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tenant updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tenant updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "New Name Corp"
 */
router.put('/:tenantId', authenticate, tenantFilter, tenantController.updateTenant);

module.exports = router;
