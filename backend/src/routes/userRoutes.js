const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');


router.get('/users/:userId/tasks', authenticate, userController.getUserTasks);
/**
 * @swagger
 * /tenants/{tenantId}/users:
 *   post:
 *     summary: Add a user to a tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       403:
 *         description: Forbidden or Limit Reached
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User limit reached for this plan"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email already exists in this tenant"
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User created successfully"
 *               data:
 *                 id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 email: "newuser@demo.com"
 *                 fullName: "New User"
 *                 role: "user"
 *                 isActive: true
 *                 createdAt: "2023-10-27T10:00:00Z"
 */
router.post('/tenants/:tenantId/users', authenticate, authorize('tenant_admin'), tenantFilter, validate(schemas.createUser), userController.addUserToTenant);
/**
 * @swagger
 * /tenants/{tenantId}/users:
 *   get:
 *     summary: List users in a tenant
 *     tags: [Users]
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
 *         description: List of users
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                     email: "user@demo.com"
 *                     fullName: "Jane Doe"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2023-10-26T10:00:00Z"
 *                 total: 15
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 1
 *                   limit: 50
 */
router.get('/tenants/:tenantId/users', authenticate, tenantFilter, userController.listTenantUsers);
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User updated successfully"
 *               data:
 *                 id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 fullName: "Jane Smith"
 *                 role: "tenant_admin"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 */
router.put('/users/:userId', authenticate, validate(schemas.updateUser), userController.updateUser);
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User deleted successfully"
 */
router.delete('/users/:userId', authenticate, authorize('tenant_admin'), userController.deleteUser);
module.exports = router;
