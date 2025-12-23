const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const tenantFilter = require('../middleware/tenantFilter');

router.get('/', authenticate, authorize('super_admin'), tenantController.listAllTenants);
router.get('/:tenantId', authenticate, tenantFilter, tenantController.getTenantDetails);
router.put('/:tenantId', authenticate, tenantFilter, tenantController.updateTenant);

module.exports = router;
