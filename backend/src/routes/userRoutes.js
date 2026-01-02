const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const tenantFilter = require('../middleware/tenantFilter');
const { validate, schemas } = require('../middleware/validator');

router.post('/tenants/:tenantId/users', authenticate, authorize('tenant_admin'), tenantFilter, validate(schemas.createUser), userController.addUserToTenant);
router.get('/tenants/:tenantId/users', authenticate, tenantFilter, userController.listTenantUsers);
router.put('/users/:userId', authenticate, validate(schemas.updateUser), userController.updateUser);
router.delete('/users/:userId', authenticate, authorize('tenant_admin'), userController.deleteUser);
//router.get('/:id/tasks', authenticate, userController.getUserTasks);
module.exports = router;
