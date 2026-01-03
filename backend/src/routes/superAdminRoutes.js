const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authenticate = require('../middleware/authenticate');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');

// Super Admin Dashboard Stats
router.get('/stats', authenticate, checkSuperAdmin, superAdminController.getSystemStats);

// Get all tenants with stats
router.get('/tenants', authenticate, checkSuperAdmin, superAdminController.getAllTenantsWithStats);

router.get('/projects', authenticate, checkSuperAdmin, superAdminController.getAllProjects);

module.exports = router;