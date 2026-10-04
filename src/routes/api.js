// Define application routes with Swagger annotations in src/routes/api.js:

const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const wallet = require('../controllers/wallet.controller');
const verifyToken = require('../middleware/auth');

const { authLimiter } = require('../middleware/rateLimiter');

// attach authLimiter to sensitive routes:
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/auth/register', auth.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/auth/login', auth.login);

/**
 * @openapi
 * /api/wallet/accounts:
 *   get:
 *     summary: Get user accounts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/wallet/accounts', verifyToken, wallet.getAccounts);

/**
 * @openapi
 * /api/wallet/transfer:
 *   post:
 *     summary: Transfer funds between accounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderAccountId: { type: string }
 *               receiverAccountNum: { type: string }
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/wallet/transfer', verifyToken, wallet.transfer);

module.exports = router;