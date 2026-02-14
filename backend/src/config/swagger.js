const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Tenant SaaS Platform API',
            version: '1.0.0',
            description: 'API documentation for the Multi-Tenant SaaS Platform with Project & Task Management',
            contact: {
                name: 'Developer',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Local Development Server',
            },
            // You can add production URL here later
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication' },
            { name: 'Tenants', description: 'Tenant Management' },
            { name: 'Users', description: 'User Management' },
            { name: 'Projects', description: 'Project Management' },
            { name: 'Tasks', description: 'Task Management' },
            { name: 'SuperAdmin', description: 'Super Admin Operations' }
        ],
    },
    apis: ['./src/routes/*.js', './src/models/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

// Custom sorting to match user requirements
const desiredPathOrder = [
    '/auth/register-tenant',
    '/auth/login',
    '/auth/me',
    '/auth/logout',
    '/tenants/{tenantId}',
    '/tenants',
    '/tenants/{tenantId}/users',
    '/users/{userId}',
    '/projects',
    '/projects/{projectId}',
    '/projects/{projectId}/tasks',
    '/tasks/{taskId}/status',
    '/tasks/{taskId}'
];

const sortedPaths = {};

// 1. Add desired paths in order
desiredPathOrder.forEach(path => {
    if (specs.paths[path]) {
        sortedPaths[path] = specs.paths[path];
    }
});

// 2. Add remaining paths
if (specs.paths) {
    Object.keys(specs.paths).forEach(path => {
        if (!sortedPaths[path]) {
            sortedPaths[path] = specs.paths[path];
        }
    });
}

specs.paths = sortedPaths;

module.exports = specs;
