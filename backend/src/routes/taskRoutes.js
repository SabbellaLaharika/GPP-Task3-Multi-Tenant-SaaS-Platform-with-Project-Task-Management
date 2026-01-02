const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');

router.post('/projects/:projectId/tasks', authenticate, tenantFilter, validate(schemas.createTask), taskController.createTask);
router.get('/projects/:projectId/tasks', authenticate, tenantFilter, taskController.listProjectTasks);
router.patch('/tasks/:taskId/status', authenticate, tenantFilter, taskController.updateTaskStatus);
router.put('/tasks/:taskId', authenticate, tenantFilter, validate(schemas.updateTask), taskController.updateTask);
router.delete('/tasks/:taskId', authenticate, tenantFilter, taskController.deleteTask);
module.exports = router;
