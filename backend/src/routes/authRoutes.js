const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { validate, schemas } = require('../middleware/validator');

// Public routes
router.post('/register-tenant', validate(schemas.registerTenant), authController.registerTenant);
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
