const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const openapi = {
    openapi: "3.0.0",
    info: {
        title: "Multi-Tenant SaaS Platform API",
        version: "1.0.0",
        description: "API documentation for the Multi-Tenant SaaS Platform with Project & Task Management. Fully complies with the 19 API endpoints requirement and the {success, message, data} uniform response format."
    },
    servers: [{ url: "http://localhost:5000/api", description: "Local Development Server" }],
    components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        responses: {
            BadRequest: {
                description: "Bad Request (e.g., Validation Error)",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Invalid input data or validation failed" } } } } }
            },
            Unauthorized: {
                description: "Unauthorized (Token missing or invalid)",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Unauthorized access" } } } } }
            },
            Forbidden: {
                description: "Forbidden (Insufficient permissions)",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Forbidden: You do not have permission" } } } } }
            },
            NotFound: {
                description: "Resource Not Found",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Resource not found" } } } } }
            },
            Conflict: {
                description: "Conflict (e.g., Resource already exists)",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Conflict: Resource already exists" } } } } }
            },
            ServerError: {
                description: "Internal Server Error",
                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Internal server error" } } } } }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: "Auth", description: "Authentication APIs (4)" },
        { name: "Tenants", description: "Tenant Management APIs (3)" },
        { name: "Users", description: "User Management APIs (4)" },
        { name: "Projects", description: "Project Management APIs (4)" },
        { name: "Tasks", description: "Task Management APIs (5)" }
    ],
    paths: {}
};

function successResponse(description, dataProperties, messageStr) {
    const schema = {
        type: "object",
        properties: {
            success: { type: "boolean", example: true }
        }
    };

    if (messageStr) {
        schema.properties.message = { type: "string", example: messageStr };
    }

    if (dataProperties) {
        schema.properties.data = { type: "object", properties: dataProperties };
    }

    return {
        description,
        content: {
            "application/json": {
                schema
            }
        }
    };
}

openapi.paths['/auth/register-tenant'] = {
    post: {
        summary: "1. Register a new tenant",
        tags: ["Auth"],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["tenantName", "subdomain", "adminEmail", "adminPassword", "adminFullName"],
                        properties: {
                            tenantName: { type: "string", example: "Test Company Alpha" },
                            subdomain: { type: "string", example: "testalpha" },
                            adminEmail: { type: "string", format: "email", example: "admin@testalpha.com" },
                            adminPassword: { type: "string", example: "TestPass@123" },
                            adminFullName: { type: "string", example: "Alpha Admin" }
                        }
                    }
                }
            }
        }
    },
    responses: {
        '201': successResponse("Tenant registered successfully", {
            tenantId: { type: "string", example: "uuid" },
            subdomain: { type: "string", example: "value" },
            adminUser: {
                type: "object",
                properties: {
                    id: { type: "string", example: "uuid" },
                    email: { type: "string", example: "value" },
                    fullName: { type: "string", example: "value" },
                    role: { type: "string", example: "tenant_admin" }
                }
            }
        }, "Tenant registered successfully"),
        '400': {
            description: "Validation errors",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean", example: false },
                            message: { type: "string", example: "Validation failed" },
                            errors: {
                                type: "array",
                                items: { type: "object", properties: { field: { type: "string", example: "adminEmail" }, message: { type: "string", example: "Invalid email format" } } }
                            }
                        }
                    }
                }
            }
        },
        '409': {
            description: "Subdomain or email already exists",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Subdomain or email already exists" } } } } }
        },
        '500': { $ref: '#/components/responses/ServerError' }
    }
};

openapi.paths['/auth/login'] = {
    post: {
        summary: "2. Login to the system",
        tags: ["Auth"],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["email", "password"],
                        properties: {
                            email: { type: "string", example: "admin@demo.com" },
                            password: { type: "string", example: "Demo@123" },
                            tenantSubdomain: { type: "string", example: "demo" }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("Login successful", {
                user: {
                    type: "object",
                    properties: { id: { type: "string", example: "bbbbbbbb-bbbb-bbbb" }, email: { type: "string", example: "admin@demo.com" }, fullName: { type: "string", example: "Demo Admin" }, role: { type: "string", example: "tenant_admin" }, tenantId: { type: "string", example: "22222222-2222-2222" } }
                },
                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
            }, "Login successful"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/auth/me'] = {
    get: {
        summary: "3. Get current logged-in user",
        tags: ["Auth"],
        responses: {
            '200': successResponse("Current user details", {
                id: { type: "string", example: "bbbbbbbb-bbbb-bbbb" },
                email: { type: "string", example: "admin@demo.com" },
                fullName: { type: "string", example: "Demo Admin" },
                role: { type: "string", example: "tenant_admin" },
                tenantId: { type: "string", example: "22222222-2222" },
                tenantName: { type: "string", example: "Demo Company" },
                isActive: { type: "boolean", example: true }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/auth/logout'] = {
    post: {
        summary: "4. Logout user",
        tags: ["Auth"],
        responses: {
            '200': successResponse("Logout successful", null, "Logged out successfully"),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/tenants/{tenantId}'] = {
    get: {
        summary: "5. Get tenant details",
        tags: ["Tenants"],
        parameters: [{ in: "path", name: "tenantId", required: true, schema: { type: "string" } }],
        responses: {
            '200': successResponse("Tenant details", {
                id: { type: "string", example: "22222222" },
                name: { type: "string", example: "Demo Company" },
                subdomain: { type: "string", example: "demo" },
                status: { type: "string", example: "active" },
                subscription_plan: { type: "string", example: "professional" },
                max_users: { type: "number", example: 50 },
                max_projects: { type: "number", example: 100 },
                total_users: { type: "number", example: 3 },
                total_projects: { type: "number", example: 2 },
                created_at: { type: "string", example: "2024-12-26T10:00:00.000Z" }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    put: {
        summary: "6. Update tenant details",
        tags: ["Tenants"],
        parameters: [{ in: "path", name: "tenantId", required: true, schema: { type: "string" } }],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            name: { type: "string", example: "Demo Company - Updated via Postman" }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("Tenant updated", {
                id: { type: "string", example: "2222" },
                name: { type: "string", example: "Demo Company - Updated via Postman" },
                subdomain: { type: "string", example: "demo" }
            }, "Tenant updated successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/tenants'] = {
    get: {
        summary: "7. List all tenants (Super Admin Only)",
        tags: ["Tenants"],
        responses: {
            '200': successResponse("List of tenants", {
                tenants: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "1111" },
                            name: { type: "string", example: "Demo Company" },
                            subdomain: { type: "string", example: "demo" },
                            status: { type: "string", example: "active" },
                            subscription_plan: { type: "string", example: "professional" },
                            total_users: { type: "number", example: 3 },
                            total_projects: { type: "number", example: 2 }
                        }
                    }
                },
                total: { type: "number", example: 2 },
                page: { type: "number", example: 1 },
                limit: { type: "number", example: 10 },
                totalPages: { type: "number", example: 1 }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/tenants/{tenantId}/users'] = {
    post: {
        summary: "8. Create User",
        tags: ["Users"],
        parameters: [{ in: "path", name: "tenantId", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["email", "password", "fullName", "role"],
                        properties: {
                            email: { type: "string", example: "newuser@demo.com" },
                            password: { type: "string", example: "NewUser@123" },
                            fullName: { type: "string", example: "New User from Postman" },
                            role: { type: "string", example: "user" }
                        }
                    }
                }
            }
        },
        responses: {
            '201': successResponse("User created", {
                id: { type: "string", example: "user-id-uuid" },
                email: { type: "string", example: "newuser@demo.com" },
                fullName: { type: "string", example: "New User from Postman" },
                role: { type: "string", example: "user" },
                isActive: { type: "boolean", example: true },
                tenantId: { type: "string", example: "22222222-2222" }
            }, "User created successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '409': { $ref: '#/components/responses/Conflict' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    get: {
        summary: "9. List Users",
        tags: ["Users"],
        parameters: [{ in: "path", name: "tenantId", required: true, schema: { type: "string" } }],
        responses: {
            '200': successResponse("List of users", {
                users: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "user-id-uuid" },
                            email: { type: "string", example: "admin@demo.com" },
                            fullName: { type: "string", example: "Demo Admin" },
                            role: { type: "string", example: "tenant_admin" },
                            isActive: { type: "boolean", example: true },
                            created_at: { type: "string", example: "2024-12-26T10:00:00.000Z" }
                        }
                    }
                },
                total: { type: "number", example: 3 }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/users/{userId}'] = {
    put: {
        summary: "10. Update User",
        tags: ["Users"],
        parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string" } }],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            fullName: { type: "string", example: "Updated User Name" },
                            role: { type: "string", example: "tenant_admin" },
                            isActive: { type: "boolean", example: true }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("User updated", {
                id: { type: "string", example: "user-uuid" },
                fullName: { type: "string", example: "Updated User Name" },
                role: { type: "string", example: "tenant_admin" },
                isActive: { type: "boolean", example: true }
            }, "User updated successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    delete: {
        summary: "11. Delete User",
        tags: ["Users"],
        parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string" } }],
        responses: {
            '200': successResponse("User deleted", null, "User deleted successfully"),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/projects'] = {
    post: {
        summary: "12. Create Project",
        tags: ["Projects"],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["name", "status"],
                        properties: {
                            name: { type: "string", example: "Postman Test Project" },
                            description: { type: "string", example: "This project was created via Postman testing" },
                            status: { type: "string", example: "active" }
                        }
                    }
                }
            }
        },
        responses: {
            '201': successResponse("Project created", {
                id: { type: "string", example: "project-uuid" },
                name: { type: "string", example: "Postman Test Project" },
                description: { type: "string", example: "This project was created via Postman testing" },
                status: { type: "string", example: "active" },
                created_by: { type: "string", example: "bbbbbbbb-bbbb-..." },
                tenant_id: { type: "string", example: "22222222-2222-..." },
                created_at: { type: "string", example: "2024-12-27T08:00:00.000Z" }
            }, "Project created successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    get: {
        summary: "13. List Projects",
        tags: ["Projects"],
        responses: {
            '200': successResponse("List of projects", {
                projects: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "project-uuid" },
                            name: { type: "string", example: "Postman Test Project" },
                            description: { type: "string", example: "This project was created via Postman testing" },
                            status: { type: "string", example: "active" },
                            task_count: { type: "number", example: 0 },
                            created_by_name: { type: "string", example: "Demo Admin" },
                            created_at: { type: "string", example: "2024-12-27T08:00:00.000Z" }
                        }
                    }
                },
                total: { type: "number", example: 2 },
                page: { type: "number", example: 1 },
                limit: { type: "number", example: 10 }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/projects/{projectId}'] = {
    put: {
        summary: "14. Update Project",
        tags: ["Projects"],
        parameters: [{ in: "path", name: "projectId", required: true, schema: { type: "string" } }],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            name: { type: "string", example: "Updated Project Name" },
                            description: { type: "string", example: "Updated description via Postman" },
                            status: { type: "string", example: "in_progress" }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("Project updated", {
                id: { type: "string", example: "project-uuid" },
                name: { type: "string", example: "Updated Project Name" },
                description: { type: "string", example: "Updated description via Postman" },
                status: { type: "string", example: "in_progress" }
            }, "Project updated successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    delete: {
        summary: "15. Delete Project",
        tags: ["Projects"],
        parameters: [{ in: "path", name: "projectId", required: true, schema: { type: "string" } }],
        responses: {
            '200': successResponse("Project deleted", null, "Project deleted successfully"),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/projects/{projectId}/tasks'] = {
    post: {
        summary: "16. Create Task",
        tags: ["Tasks"],
        parameters: [{ in: "path", name: "projectId", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["title"],
                        properties: {
                            title: { type: "string", example: "Test Task from Postman" },
                            description: { type: "string", example: "This is a test task created via Postman" },
                            priority: { type: "string", example: "high" },
                            assignedTo: { type: "string", nullable: true, example: null },
                            dueDate: { type: "string", format: "date", example: "2025-01-15" }
                        }
                    }
                }
            }
        },
        responses: {
            '201': successResponse("Task created", {
                id: { type: "string", example: "task-uuid" },
                project_id: { type: "string", example: "project-uuid" },
                title: { type: "string", example: "Test Task from Postman" },
                description: { type: "string", example: "This is a test task created via Postman" },
                status: { type: "string", example: "todo" },
                priority: { type: "string", example: "high" },
                assigned_to: { type: "string", nullable: true, example: null },
                due_date: { type: "string", example: "2025-01-15" },
                created_at: { type: "string", example: "2024-12-27T08:00:00.000Z" }
            }, "Task created successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    },
    get: {
        summary: "17. List Tasks",
        tags: ["Tasks"],
        parameters: [{ in: "path", name: "projectId", required: true, schema: { type: "string" } }],
        responses: {
            '200': successResponse("List of tasks", {
                tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "task-uuid" },
                            title: { type: "string", example: "Test Task from Postman" },
                            description: { type: "string", example: "This is a test task created via Postman" },
                            status: { type: "string", example: "todo" },
                            priority: { type: "string", example: "high" },
                            assigned_to_name: { type: "string", nullable: true, example: null },
                            created_by_name: { type: "string", example: "Demo Admin" },
                            due_date: { type: "string", example: "2025-01-15" },
                            created_at: { type: "string", example: "2024-12-27T08:00:00.000Z" }
                        }
                    }
                },
                total: { type: "number", example: 1 }
            }),
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/tasks/{taskId}/status'] = {
    patch: {
        summary: "18. Update Task Status",
        tags: ["Tasks"],
        parameters: [{ in: "path", name: "taskId", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["status"],
                        properties: {
                            status: { type: "string", example: "in_progress" }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("Task status updated", {
                id: { type: "string", example: "task-uuid" },
                status: { type: "string", example: "in_progress" }
            }, "Task status updated successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

openapi.paths['/tasks/{taskId}'] = {
    put: {
        summary: "19. Update Task (Full Update)",
        tags: ["Tasks"],
        parameters: [{ in: "path", name: "taskId", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            title: { type: "string", example: "Updated Task Title" },
                            description: { type: "string", example: "Updated description" },
                            priority: { type: "string", example: "low" },
                            assignedTo: { type: "string", nullable: true, example: null },
                            dueDate: { type: "string", format: "date", example: "2025-01-20" }
                        }
                    }
                }
            }
        },
        responses: {
            '200': successResponse("Task updated", {
                id: { type: "string", example: "task-uuid" },
                title: { type: "string", example: "Updated Task Title" },
                description: { type: "string", example: "Updated description" },
                priority: { type: "string", example: "low" },
                due_date: { type: "string", example: "2025-01-20" }
            }, "Task updated successfully"),
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/ServerError' }
        }
    }
};

const yamlStr = yaml.dump(openapi, { skipInvalid: true, noRefs: true });
fs.writeFileSync(path.join(__dirname, '../openapi.yml'), yamlStr, 'utf8');
console.log('Successfully generated full API spec to openapi.yml');
