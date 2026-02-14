const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       403:
 *         description: Forbidden or Limit Reached
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Project limit reached for this plan"
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Project created successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "Website Redesign"
 *                 description: "Redesigning company website"
 *                 status: "active"
 *                 createdAt: "2023-10-27T10:00:00Z"
 */
router.post('/', authenticate, tenantFilter, validate(schemas.createProject), projectController.createProject);
/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 projects:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Website Redesign"
 *                     status: "active"
 *                     taskCount: 5
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalProjects: 12
 */
router.get('/', authenticate, tenantFilter, projectController.listProjects);
/**
 * @swagger
 * /projects/{projectId}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Project updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "Website Redesign V2"
 *                 status: "completed"
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Project not found"
 */
router.put('/:projectId', authenticate, tenantFilter, validate(schemas.updateProject), projectController.updateProject);
/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Project deleted successfully"
 */
router.delete('/:projectId', authenticate, tenantFilter, projectController.deleteProject);

module.exports = router;
