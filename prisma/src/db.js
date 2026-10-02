// Implement Database Client & Auth Middleware

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;