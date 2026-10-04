const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/db');

describe('Fintech Backend Node.js Integration Tests', () => {
    let userToken;
    let userAccountId;

    beforeAll(async () => {
        // Clean database before tests run
        await prisma.transaction.deleteMany();
        await prisma.account.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user and generate a bank account', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@fintech.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('userId');
        });

        it('should reject registration with duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@fintech.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should authenticate user and return JWT token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@fintech.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            userToken = res.body.token;
        });
    });

    describe('GET /api/wallet/accounts', () => {
        it('should fetch user accounts when authenticated', async () => {
            const res = await request(app)
                .get('/api/wallet/accounts')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            userAccountId = res.body[0].id;
        });

        it('should reject unauthenticated request', async () => {
            const res = await request(app).get('/api/wallet/accounts');
            expect(res.statusCode).toEqual(401);
        });
    });
});