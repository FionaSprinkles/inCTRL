const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const userService = require('../services/userService');

describe('backend/services/userService', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getAllUsers', () => {
        it('resolves with public user list', async () => {
            const users = [
                { id: 1, username: 'alice', displayName: 'Alice', xp: 100 },
                { id: 2, username: 'bob', displayName: 'Bob', xp: 50 }
            ];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('SELECT id, username, display_name'));
                cb(null, users);
            });

            const result = await userService.getAllUsers();
            assert.deepStrictEqual(result, users);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('User query failed'));
            });

            await assert.rejects(
                async () => await userService.getAllUsers(),
                /User query failed/
            );
        });
    });

    describe('getUserById', () => {
        it('resolves with public user profile when found', async () => {
            const user = { id: 1, username: 'alice', displayName: 'Alice' };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, [1]);
                cb(null, [user]);
            });

            const result = await userService.getUserById(1);
            assert.deepStrictEqual(result, user);
        });

        it('resolves with null when user is not found or empty rows', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await userService.getUserById(999);
            assert.strictEqual(result, null);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Lookup error'));
            });

            await assert.rejects(
                async () => await userService.getUserById(1),
                /Lookup error/
            );
        });
    });

    describe('getUserProfileById', () => {
        it('resolves with private profile including email when found', async () => {
            const fullProfile = { id: 1, username: 'alice', email: 'alice@example.com', role: 'user' };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, [1]);
                cb(null, [fullProfile]);
            });

            const result = await userService.getUserProfileById(1);
            assert.deepStrictEqual(result, fullProfile);
        });

        it('resolves with null when profile is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await userService.getUserProfileById(999);
            assert.strictEqual(result, null);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Profile lookup error'));
            });

            await assert.rejects(
                async () => await userService.getUserProfileById(1),
                /Profile lookup error/
            );
        });
    });

    describe('getUserByUsernameOrEmail', () => {
        it('resolves with user record when found', async () => {
            const row = { id: 1, username: 'alice', email: 'alice@example.com', password_hash: 'hash' };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, ['alice', 'alice']);
                cb(null, [row]);
            });

            const result = await userService.getUserByUsernameOrEmail('alice');
            assert.deepStrictEqual(result, row);
        });

        it('resolves with null when not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await userService.getUserByUsernameOrEmail('nonexistent');
            assert.strictEqual(result, null);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('DB search failure'));
            });

            await assert.rejects(
                async () => await userService.getUserByUsernameOrEmail('alice'),
                /DB search failure/
            );
        });
    });

    describe('register', () => {
        it('successfully registers a new user with password hashing', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users WHERE')) {
                    // No existing user
                    return cb(null, []);
                }
                if (sql.includes('INSERT INTO users')) {
                    assert.strictEqual(params[0], 'newuser');
                    assert.strictEqual(params[1], 'newuser@example.com');
                    assert.ok(bcrypt.compareSync('secret123', params[2]));
                    assert.strictEqual(params[3], 'New User');
                    return cb(null, { insertId: 42 });
                }
                cb(null, []);
            });

            const result = await userService.register({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'secret123',
                displayName: 'New User'
            });

            assert.deepStrictEqual(result, {
                id: 42,
                username: 'newuser',
                email: 'newuser@example.com',
                displayName: 'New User',
                role: 'user',
                xp: 0
            });
        });

        it('throws an error if username or email is already taken', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users WHERE')) {
                    return cb(null, [{ id: 1, username: 'existing' }]);
                }
                cb(null, []);
            });

            await assert.rejects(
                async () => await userService.register({
                    username: 'existing',
                    email: 'existing@example.com',
                    password: 'password'
                }),
                /Username or email already in use/
            );
        });

        it('rejects if database insertion fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('SELECT * FROM users WHERE')) {
                    return cb(null, []);
                }
                if (sql.includes('INSERT INTO users')) {
                    return cb(new Error('Insert duplicate error'));
                }
                cb(null, []);
            });

            await assert.rejects(
                async () => await userService.register({
                    username: 'test',
                    email: 'test@example.com',
                    password: 'password'
                }),
                /Insert duplicate error/
            );
        });
    });

    describe('login', () => {
        it('authenticates user and returns profile when password matches', async () => {
            const passwordHash = bcrypt.hashSync('correctpassword', 10);
            const userRow = {
                id: 10,
                username: 'loginuser',
                email: 'login@example.com',
                password_hash: passwordHash,
                display_name: 'Login User',
                role: 'user',
                avatar: 'avatar1.png',
                xp: 250
            };

            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [userRow]);
            });

            const result = await userService.login({
                username: 'loginuser',
                password: 'correctpassword'
            });

            assert.deepStrictEqual(result, {
                id: 10,
                username: 'loginuser',
                email: 'login@example.com',
                displayName: 'Login User',
                role: 'user',
                avatar: 'avatar1.png',
                xp: 250
            });
        });

        it('throws an error when user is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            await assert.rejects(
                async () => await userService.login({ username: 'missing', password: 'password' }),
                /Invalid username\/email or password/
            );
        });

        it('throws an error when password does not match', async () => {
            const passwordHash = bcrypt.hashSync('correctpassword', 10);
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, username: 'test', password_hash: passwordHash }]);
            });

            await assert.rejects(
                async () => await userService.login({ username: 'test', password: 'wrongpassword' }),
                /Invalid username\/email or password/
            );
        });
    });

    describe('updateUser', () => {
        it('updates user display name and avatar', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('UPDATE users SET'));
                assert.deepStrictEqual(params, ['Updated Name', 'new_avatar.png', 5]);
                cb(null, { affectedRows: 1 });
            });

            const result = await userService.updateUser(5, {
                displayName: 'Updated Name',
                avatar: 'new_avatar.png'
            });

            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects when update query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update failed'));
            });

            await assert.rejects(
                async () => await userService.updateUser(5, { displayName: 'Fail' }),
                /Update failed/
            );
        });
    });

    describe('deleteUser', () => {
        it('deletes user by id', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('DELETE FROM users WHERE id = ?'));
                assert.deepStrictEqual(params, [7]);
                cb(null, { affectedRows: 1 });
            });

            const result = await userService.deleteUser(7);
            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects when delete query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete user failed'));
            });

            await assert.rejects(
                async () => await userService.deleteUser(7),
                /Delete user failed/
            );
        });
    });
});
