const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');

router.post('/', authenticate, tenantFilter, validate(schemas.createProject), projectController.createProject);
router.get('/', authenticate, tenantFilter, projectController.listProjects);
router.put('/:projectId', authenticate, tenantFilter, validate(schemas.updateProject), projectController.updateProject);
router.delete('/:projectId', authenticate, tenantFilter, projectController.deleteProject);

module.exports = router;
