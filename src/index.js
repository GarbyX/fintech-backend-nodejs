// src/index.js
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient } = require('@prisma/client');
const swaggerSpec = require('./swagger');
const apiRoutes = require('./routes/api');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Healthcheck Route
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'UP', database: 'CONNECTED' });
    } catch (error) {
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
});

// Expose raw OpenAPI JSON spec endpoint for Postman and tools
app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
});

// Swagger UI Configuration
const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
        url: '/api-docs-json',
        persistAuthorization: true, // Retains JWT token on page refreshes
    },
    customCss: '.swagger-ui .topbar { display: flex; }',
    customSiteTitle: 'Fintech API Documentation',
};

// Mount Swagger UI — Pass swaggerSpec directly to ensure fallback rendering
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, async () => {
    try {
        await prisma.$connect();
        console.log(`Database connected successfully.`);
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        console.log(`OpenAPI JSON Spec available at http://localhost:${PORT}/api-docs-json`);
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
});

// Graceful Shutdown Hooks
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed and Prisma client disconnected');
        process.exit(0);
    });
});