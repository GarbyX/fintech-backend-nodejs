// src/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fintech API',
            version: '1.0.0',
            description: `Fintech backend service with atomic ledger transactions.
      \n\n **Postman / OpenAPI Spec:** [Download OpenAPI JSON Spec](/api-docs-json)`,
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development Server (Docker)',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>',
                },
            },
            schemas: {
                RegisterInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Unique user email address (supports Postman dynamic variable {{$randomEmail}})',
                            example: 'user_{{$timestamp}}@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'Pa$$wordCyphe#',
                        },
                    },
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user_{{$timestamp}}@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'Pa$$wordCyphe#',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'User registered successfully' },
                        userId: { type: 'string', format: 'uuid', example: '41ce41d8-6849-48aa-b643-feb8060f326b' },
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Invalid credentials or resource not found' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/routes/**/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;