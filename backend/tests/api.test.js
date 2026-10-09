const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-key-for-api-tests';
const { getMockDb } = require('./helpers/mockDb');
const mockDb = getMockDb();

const app = require('../app');
const { generateToken } = require('../middleware/auth');

const adminToken = generateToken({ id: 1, username: 'admin', role: 'admin' });
const userToken = generateToken({ id: 2, username: 'user', role: 'user' });

describe('backend API integration tests (app & routes)', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('GET /api/health', () => {
        it('returns 200 when database responds', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ solution: 2 }]);
            });

            const res = await request(app).get('/api/health');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.status, 'ok');
            assert.strictEqual(res.body.database, 'connected');
        });

        it('returns 500 when database query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Connection lost'));
            });

            const res = await request(app).get('/api/health');
            assert.strictEqual(res.status, 500);
            assert.strictEqual(res.body.status, 'unhealthy');
            assert.strictEqual(res.body.error, 'Connection lost');
        });
    });

    describe('404 catch-all handler', () => {
        it('returns 404 for nonexistent route', async () => {
            const res = await request(app).get('/api/does-not-exist');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.error, "Endpoint '/api/does-not-exist' not found");
        });
    });

    describe('Categories API (/api/categories)', () => {
        it('GET /api/categories returns category list', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, name: 'General', slug: 'general' }]);
            });

            const res = await request(app).get('/api/categories');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.categories.length, 1);
        });

        it('GET /api/categories/:id returns 404 when missing', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const res = await request(app).get('/api/categories/999');
            assert.strictEqual(res.status, 404);
        });

        it('POST /api/categories requires admin token', async () => {
            const unauth = await request(app).post('/api/categories').send({ name: 'Dev' });
            assert.strictEqual(unauth.status, 401);

            const forbidden = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Dev' });
            assert.strictEqual(forbidden.status, 403);

            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 10 });
            });
            const success = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Dev' });
            assert.strictEqual(success.status, 201);
            assert.strictEqual(success.body.category.name, 'Dev');
        });
    });

    describe('Shortcuts API (/api/shortcuts)', () => {
        it('GET /api/shortcuts returns list of shortcuts', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, title: 'Copy', keyCombo: 'Ctrl+C' }]);
            });

            const res = await request(app).get('/api/shortcuts?q=copy');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.shortcuts.length, 1);
        });

        it('GET /api/shortcuts/:id returns 200 when found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, title: 'Copy' }]);
            });

            const res = await request(app).get('/api/shortcuts/1');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.shortcut.id, 1);
        });

        it('POST /api/shortcuts creates shortcut for admin', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 5 });
            });

            const res = await request(app)
                .post('/api/shortcuts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Paste', keyCombo: 'Ctrl+V', description: 'Paste item' });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.shortcut.id, 5);
        });

        it('DELETE /api/shortcuts/:id deletes shortcut for admin', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const res = await request(app)
                .delete('/api/shortcuts/5')
                .set('Authorization', `Bearer ${adminToken}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
        });
    });

    describe('Users API (/api/users)', () => {
        it('GET /api/users returns public user list', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, username: 'alice' }]);
            });

            const res = await request(app).get('/api/users');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.users.length, 1);
        });

        it('POST /api/users/register registers user and returns token', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users')) return cb(null, []);
                if (sql.includes('INSERT INTO users')) return cb(null, { insertId: 20 });
                cb(null, []);
            });

            const res = await request(app).post('/api/users/register').send({
                username: 'tester',
                email: 'tester@test.com',
                password: 'password123'
            });

            assert.strictEqual(res.status, 201);
            assert.ok(res.body.token);
            assert.strictEqual(res.body.user.username, 'tester');
        });

        it('POST /api/users/login logs in user', async () => {
            const passwordHash = bcrypt.hashSync('correctpass', 10);
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{
                    id: 3,
                    username: 'user3',
                    password_hash: passwordHash,
                    role: 'user'
                }]);
            });

            const res = await request(app).post('/api/users/login').send({
                username: 'user3',
                password: 'correctpass'
            });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.token);
            assert.strictEqual(res.body.user.id, 3);
        });

        it('GET /api/users/me returns authenticated profile', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 2, username: 'user', email: 'user@test.com' }]);
            });

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.user.email, 'user@test.com');
        });

        it('PUT /api/users/:id updates profile', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const res = await request(app)
                .put('/api/users/2')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ displayName: 'New Name' });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Profile updated successfully');
        });

        it('DELETE /api/users/:id deletes profile', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const res = await request(app)
                .delete('/api/users/2')
                .set('Authorization', `Bearer ${userToken}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'User 2 deleted successfully');
        });
    });

    describe('Quiz Questions and Attempts API', () => {
        const questionRow = {
            id: 'q1',
            type: 'single_choice',
            prompt: 'Shortcut to lock?',
            payload_json: JSON.stringify({ options: [{ id: 'opt1', isCorrect: true }] })
        };

        it('GET /api/questions and GET /api/questions/:id', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [questionRow]);
            });

            const listRes = await request(app).get('/api/questions');
            assert.strictEqual(listRes.status, 200);

            const itemRes = await request(app).get('/api/questions/q1');
            assert.strictEqual(itemRes.status, 200);
            assert.strictEqual(itemRes.body.question.id, 'q1');
        });

        it('POST /api/questions, PUT /api/questions/:id, DELETE /api/questions/:id by admin', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 1, affectedRows: 1 });
            });

            const postRes = await request(app)
                .post('/api/questions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ id: 'new_q', type: 'single_choice', prompt: 'P' });
            assert.strictEqual(postRes.status, 201);

            const putRes = await request(app)
                .put('/api/questions/new_q')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ prompt: 'Updated P' });
            assert.strictEqual(putRes.status, 200);

            const delRes = await request(app)
                .delete('/api/questions/new_q')
                .set('Authorization', `Bearer ${adminToken}`);
            assert.strictEqual(delRes.status, 200);
        });

        it('POST /api/quiz/attempts submits attempt for guest and authenticated user', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [questionRow]);
            });

            // Guest attempt
            const guestRes = await request(app)
                .post('/api/quiz/attempts')
                .send({
                    guestName: 'Guest1',
                    answers: { q1: 'opt1' }
                });
            assert.strictEqual(guestRes.status, 201);
            assert.strictEqual(guestRes.body.attempt.score, 1);

            // Authenticated attempt
            const authRes = await request(app)
                .post('/api/quiz/attempts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    answers: { q1: 'opt1' }
                });
            assert.strictEqual(authRes.status, 201);
            assert.strictEqual(authRes.body.attempt.score, 1);
        });

        it('GET /api/quiz/leaderboard and GET /api/quiz/attempts/user/:userId', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, score: 10 }]);
            });

            const lbRes = await request(app).get('/api/quiz/leaderboard?limit=5');
            assert.strictEqual(lbRes.status, 200);
            assert.strictEqual(lbRes.body.leaderboard.length, 1);

            const attRes = await request(app).get('/api/quiz/attempts/user/2');
            assert.strictEqual(attRes.status, 200);
            assert.strictEqual(attRes.body.attempts.length, 1);
        });

        it('GET /api/quizzes and GET /api/quizzes/:id', async () => {
            const quizRow = { id: 1, title: 'Navigation Quiz' };
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quizzes')) return cb(null, [quizRow]);
                if (sql.includes('FROM quiz_questions')) return cb(null, [questionRow]);
                cb(null, []);
            });

            const listRes = await request(app).get('/api/quizzes');
            assert.strictEqual(listRes.status, 200);
            assert.strictEqual(listRes.body.quizzes.length, 1);

            const itemRes = await request(app).get('/api/quizzes/1');
            assert.strictEqual(itemRes.status, 200);
            assert.strictEqual(itemRes.body.quiz.id, 1);
        });

        it('POST /api/quizzes, PUT /api/quizzes/:id, DELETE /api/quizzes/:id by admin', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 10, affectedRows: 1 });
            });

            const postRes = await request(app)
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'New Admin Quiz' });
            assert.strictEqual(postRes.status, 201);
            assert.strictEqual(postRes.body.quiz.id, 10);

            const putRes = await request(app)
                .put('/api/quizzes/10')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Updated Admin Quiz' });
            assert.strictEqual(putRes.status, 200);

            const delRes = await request(app)
                .delete('/api/quizzes/10')
                .set('Authorization', `Bearer ${adminToken}`);
            assert.strictEqual(delRes.status, 200);
        });

        it('GET /api/quiz/attempts/:id/details returns attempt with breakdown for owner and admin, rejects unauthorized', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quiz_attempts a')) return cb(null, [{ id: 7, userId: 2, score: 1 }]);
                if (sql.includes('FROM result_questions rq')) return cb(null, [{ id: 1, questionId: 'q1', isCorrect: true }]);
                cb(null, []);
            });

            // Owner can fetch their attempt breakdown
            const ownerRes = await request(app)
                .get('/api/quiz/attempts/7/details')
                .set('Authorization', `Bearer ${userToken}`);
            assert.strictEqual(ownerRes.status, 200);
            assert.strictEqual(ownerRes.body.attempt.id, 7);
            assert.strictEqual(ownerRes.body.attempt.questions.length, 1);

            // Anonymous request without token is rejected with 401
            const anonRes = await request(app).get('/api/quiz/attempts/7/details');
            assert.strictEqual(anonRes.status, 401);

            // Non-owner request is rejected with 403
            const otherToken = generateToken({ id: 99, username: 'other', role: 'user' });
            const otherRes = await request(app)
                .get('/api/quiz/attempts/7/details')
                .set('Authorization', `Bearer ${otherToken}`);
            assert.strictEqual(otherRes.status, 403);

            // Admin can fetch any attempt breakdown
            const adminRes = await request(app)
                .get('/api/quiz/attempts/7/details')
                .set('Authorization', `Bearer ${adminToken}`);
            assert.strictEqual(adminRes.status, 200);
        });

        it('GET /api/quiz/attempts/:id/details requires token for guest attempt', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quiz_attempts a')) return cb(null, [{ id: 8, userId: null, score: 1 }]);
                if (sql.includes('FROM result_questions rq')) return cb(null, [{ id: 1, questionId: 'q1', isCorrect: true }]);
                cb(null, []);
            });

            // Anonymous request without token is rejected with 403
            const anonRes = await request(app).get('/api/quiz/attempts/8/details');
            assert.strictEqual(anonRes.status, 403);

            // Guest with valid attempt token succeeds
            const guestToken = generateToken({ attemptId: 8, role: 'guest_attempt' });
            const guestRes = await request(app)
                .get('/api/quiz/attempts/8/details')
                .set('x-attempt-token', guestToken);
            assert.strictEqual(guestRes.status, 200);
            assert.strictEqual(guestRes.body.attempt.id, 8);
        });
    });
});
