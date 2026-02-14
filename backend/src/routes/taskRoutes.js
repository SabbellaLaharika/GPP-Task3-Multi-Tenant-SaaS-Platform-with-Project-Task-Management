const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Project not found"
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task created successfully"
 *               data:
 *                 id: "770e8400-e29b-41d4-a716-446655440000"
 *                 title: "Design Home Page"
 *                 status: "todo"
 *                 priority: "high"
 *                 assignedTo: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 */
router.post('/projects/:projectId/tasks', authenticate, tenantFilter, validate(schemas.createTask), taskController.createTask);
/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: List tasks for a project
 *     tags: [Tasks]
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
 *         description: List of tasks
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 tasks:
 *                   - id: "770e8400-e29b-41d4-a716-446655440000"
 *                     title: "Design Home Page"
 *                     status: "in_progress"
 *                     priority: "high"
 *                     assignedTo: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 2
 *                   totalTasks: 15
 */
router.get('/projects/:projectId/tasks', authenticate, tenantFilter, taskController.listProjectTasks);
/**
 * @swagger
 * /tasks/{taskId}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task status updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task status updated"
 *               data:
 *                 id: "770e8400-e29b-41d4-a716-446655440000"
 *                 status: "completed"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Task not found"
 */
router.patch('/tasks/:taskId/status', authenticate, tenantFilter, taskController.updateTaskStatus);
/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task updated successfully"
 *               data:
 *                 id: "770e8400-e29b-41d4-a716-446655440000"
 *                 title: "Design Home Page V2"
 *                 description: "Updated description"
 */
router.put('/tasks/:taskId', authenticate, tenantFilter, validate(schemas.updateTask), taskController.updateTask);
/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task deleted successfully"
 */
router.delete('/tasks/:taskId', authenticate, tenantFilter, taskController.deleteTask);
router.patch('/:id/status', authenticate, taskController.updateTaskStatus);
router.get('/users/:userId/tasks', authenticate, taskController.getUserTasks);
module.exports = router;
