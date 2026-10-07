const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

process.env.JWT_SECRET = 'test-secret-key-for-controllers';
const mockDb = getMockDb();
const userController = require('../controllers/userController');
const bcrypt = require('bcryptjs');

function createMockResponse() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        }
    };
    return res;
}

describe('backend/controllers/userController', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getUsers', () => {
        it('returns 200 with list of users', async () => {
            const users = [{ id: 1, username: 'alice' }];
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, users);
            });

            const req = {};
            const res = createMockResponse();

            await userController.getUsers(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
            assert.deepStrictEqual(res.body.users, users);
        });

        it('returns 500 on failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Users fetch error'));
            });

            const req = {};
            const res = createMockResponse();

            await userController.getUsers(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Users fetch error');
        });
    });

    describe('getUser', () => {
        it('returns 200 with user when found', async () => {
            const user = { id: 1, username: 'alice' };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [user]);
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await userController.getUser(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body.user, user);
        });

        it('returns 404 when user is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 99 } };
            const res = createMockResponse();

            await userController.getUser(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, 'User with id 99 not found');
        });

        it('returns 500 on error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('User find error'));
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await userController.getUser(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'User find error');
        });
    });

    describe('getMe', () => {
        it('returns 401 when req.user is missing or lacks id', async () => {
            const req = { user: null };
            const res = createMockResponse();

            await userController.getMe(req, res);
            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(res.body.error, 'Not authenticated');
        });

        it('returns 404 when user account no longer exists in DB', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { user: { id: 5 } };
            const res = createMockResponse();

            await userController.getMe(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, 'User not found');
        });

        it('returns 200 with user profile on success', async () => {
            const profile = { id: 5, username: 'alice', email: 'alice@test.com' };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [profile]);
            });

            const req = { user: { id: 5 } };
            const res = createMockResponse();

            await userController.getMe(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body.user, profile);
        });

        it('returns 500 on database error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Me lookup failure'));
            });

            const req = { user: { id: 5 } };
            const res = createMockResponse();

            await userController.getMe(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Me lookup failure');
        });
    });

    describe('register', () => {
        it('returns 400 when username, email, or password is missing', async () => {
            const req = { body: { username: 'test' } };
            const res = createMockResponse();

            await userController.register(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'Username, email, and password are required');
        });

        it('returns 201 with auth token and created user on success', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users')) return cb(null, []);
                if (sql.includes('INSERT INTO users')) return cb(null, { insertId: 10 });
                cb(null, []);
            });

            const req = {
                body: {
                    username: 'charlie',
                    email: 'charlie@example.com',
                    password: 'password123',
                    displayName: 'Charlie'
                }
            };
            const res = createMockResponse();

            await userController.register(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.token);
            assert.strictEqual(res.body.user.id, 10);
            assert.strictEqual(res.body.user.username, 'charlie');
        });

        it('returns 400 when registration fails (e.g. duplicate username)', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users')) {
                    return cb(null, [{ id: 1, username: 'charlie' }]);
                }
                cb(null, []);
            });

            const req = {
                body: {
                    username: 'charlie',
                    email: 'charlie@example.com',
                    password: 'password123'
                }
            };
            const res = createMockResponse();

            await userController.register(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'Username or email already in use');
        });
    });

    describe('login', () => {
        it('returns 400 when username or password is missing', async () => {
            const req = { body: { username: 'test' } };
            const res = createMockResponse();

            await userController.login(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'Username and password are required');
        });

        it('returns 200 with token and user profile on successful authentication', async () => {
            const passwordHash = bcrypt.hashSync('validpass', 10);
            const userRow = {
                id: 8,
                username: 'alice',
                email: 'alice@test.com',
                password_hash: passwordHash,
                display_name: 'Alice',
                role: 'user',
                avatar: null,
                xp: 150
            };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [userRow]);
            });

            const req = { body: { username: 'alice', password: 'validpass' } };
            const res = createMockResponse();

            await userController.login(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.token);
            assert.strictEqual(res.body.user.id, 8);
        });

        it('returns 401 when credentials do not match', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { body: { username: 'alice', password: 'wrong' } };
            const res = createMockResponse();

            await userController.login(req, res);
            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(res.body.error, 'Invalid username/email or password');
        });
    });

    describe('updateProfile', () => {
        it('returns 403 when user is not account owner and not admin', async () => {
            const req = {
                params: { id: '10' },
                user: { id: 9, role: 'user' },
                body: { displayName: 'Hacker' }
            };
            const res = createMockResponse();

            await userController.updateProfile(req, res);
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.error, 'Forbidden: You can only update your own profile');
        });

        it('returns 200 when account owner updates their profile', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = {
                params: { id: '10' },
                user: { id: 10, role: 'user' },
                body: { displayName: 'Updated Me', avatar: 'cat.png' }
            };
            const res = createMockResponse();

            await userController.updateProfile(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, 'Profile updated successfully');
        });

        it('returns 200 when admin updates another user profile', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = {
                params: { id: '10' },
                user: { id: 1, role: 'admin' },
                body: { displayName: 'Admin Override' }
            };
            const res = createMockResponse();

            await userController.updateProfile(req, res);
            assert.strictEqual(res.statusCode, 200);
        });

        it('returns 500 on database error during update', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update error'));
            });

            const req = {
                params: { id: '10' },
                user: { id: 10, role: 'user' },
                body: { displayName: 'Test' }
            };
            const res = createMockResponse();

            await userController.updateProfile(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Update error');
        });
    });

    describe('deleteUser', () => {
        it('returns 403 when user is not owner and not admin', async () => {
            const req = {
                params: { id: '10' },
                user: { id: 9, role: 'user' }
            };
            const res = createMockResponse();

            await userController.deleteUser(req, res);
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.error, 'Forbidden: Insufficient permissions to delete this account');
        });

        it('returns 200 when owner deletes account', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = {
                params: { id: '10' },
                user: { id: 10, role: 'user' }
            };
            const res = createMockResponse();

            await userController.deleteUser(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, 'User 10 deleted successfully');
        });

        it('returns 200 when admin deletes user account', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = {
                params: { id: '10' },
                user: { id: 1, role: 'admin' }
            };
            const res = createMockResponse();

            await userController.deleteUser(req, res);
            assert.strictEqual(res.statusCode, 200);
        });

        it('returns 500 on database error during deletion', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete DB error'));
            });

            const req = {
                params: { id: '10' },
                user: { id: 10, role: 'user' }
            };
            const res = createMockResponse();

            await userController.deleteUser(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Delete DB error');
        });
    });
});
