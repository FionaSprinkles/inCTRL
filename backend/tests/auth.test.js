const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is set for the main auth test suite
process.env.JWT_SECRET = 'test-secret-key-for-unit-testing';
const auth = require('../middleware/auth');

describe('backend/middleware/auth', () => {
    describe('resolveJwtSecret', () => {
        it('exports JWT_SECRET and helper functions', () => {
            assert.strictEqual(auth.JWT_SECRET, 'test-secret-key-for-unit-testing');
            assert.strictEqual(typeof auth.authenticateToken, 'function');
            assert.strictEqual(typeof auth.optionalAuth, 'function');
            assert.strictEqual(typeof auth.requireAdmin, 'function');
            assert.strictEqual(typeof auth.generateToken, 'function');
        });

        it('generateToken signs and returns valid JWT', () => {
            const payload = { id: 1, username: 'testuser', role: 'admin' };
            const token = auth.generateToken(payload);
            const decoded = jwt.verify(token, auth.JWT_SECRET);
            assert.strictEqual(decoded.id, 1);
            assert.strictEqual(decoded.username, 'testuser');
            assert.strictEqual(decoded.role, 'admin');
        });

        it('handles development fallback when JWT_SECRET is missing but NODE_ENV is development', () => {
            const authPath = require.resolve('../middleware/auth');
            delete require.cache[authPath];
            const oldSecret = process.env.JWT_SECRET;
            const oldEnv = process.env.NODE_ENV;

            delete process.env.JWT_SECRET;
            process.env.NODE_ENV = 'development';

            const devAuth = require('../middleware/auth');
            assert.strictEqual(devAuth.JWT_SECRET, 'inctrl-development-secret-key-replace-in-production');

            // Restore
            process.env.JWT_SECRET = oldSecret;
            process.env.NODE_ENV = oldEnv;
            delete require.cache[authPath];
            require('../middleware/auth');
        });

        it('throws fatal error when JWT_SECRET is missing and NODE_ENV is production', () => {
            const authPath = require.resolve('../middleware/auth');
            delete require.cache[authPath];
            const oldSecret = process.env.JWT_SECRET;
            const oldEnv = process.env.NODE_ENV;

            delete process.env.JWT_SECRET;
            process.env.NODE_ENV = 'production';

            assert.throws(() => {
                require('../middleware/auth');
            }, /FATAL: JWT_SECRET environment variable is missing/);

            // Restore
            process.env.JWT_SECRET = oldSecret;
            process.env.NODE_ENV = oldEnv;
            delete require.cache[authPath];
            require('../middleware/auth');
        });
    });

    describe('authenticateToken middleware', () => {
        it('returns 401 when authorization header is missing or empty', () => {
            let status = null;
            let jsonBody = null;
            let nextCalled = false;

            const req = { headers: {} };
            const res = {
                status: (code) => {
                    status = code;
                    return {
                        json: (data) => { jsonBody = data; }
                    };
                }
            };
            const next = () => { nextCalled = true; };

            auth.authenticateToken(req, res, next);
            assert.strictEqual(status, 401);
            assert.strictEqual(jsonBody.success, false);
            assert.strictEqual(nextCalled, false);
        });

        it('returns 403 when token is invalid or expired', () => {
            let status = null;
            let jsonBody = null;
            let nextCalled = false;

            const req = { headers: { authorization: 'Bearer invalid.token.signature' } };
            const res = {
                status: (code) => {
                    status = code;
                    return {
                        json: (data) => { jsonBody = data; }
                    };
                }
            };
            const next = () => { nextCalled = true; };

            auth.authenticateToken(req, res, next);
            assert.strictEqual(status, 403);
            assert.strictEqual(jsonBody.success, false);
            assert.strictEqual(nextCalled, false);
        });

        it('populates req.user and calls next when token is valid', () => {
            const token = auth.generateToken({ id: 42, role: 'user' });
            let nextCalled = false;

            const req = { headers: { authorization: `Bearer ${token}` } };
            const res = {};
            const next = () => { nextCalled = true; };

            auth.authenticateToken(req, res, next);
            assert.strictEqual(nextCalled, true);
            assert.strictEqual(req.user.id, 42);
            assert.strictEqual(req.user.role, 'user');
        });
    });

    describe('optionalAuth middleware', () => {
        it('sets req.user to null and calls next when no auth header is present', () => {
            let nextCalled = false;
            const req = { headers: {} };
            const res = {};
            const next = () => { nextCalled = true; };

            auth.optionalAuth(req, res, next);
            assert.strictEqual(req.user, null);
            assert.strictEqual(nextCalled, true);
        });

        it('sets req.user to null and calls next when token is invalid', () => {
            let nextCalled = false;
            const req = { headers: { authorization: 'Bearer corrupted-token' } };
            const res = {};
            const next = () => { nextCalled = true; };

            auth.optionalAuth(req, res, next);
            assert.strictEqual(req.user, null);
            assert.strictEqual(nextCalled, true);
        });

        it('populates req.user and calls next when token is valid', () => {
            const token = auth.generateToken({ id: 99, role: 'admin' });
            let nextCalled = false;
            const req = { headers: { authorization: `Bearer ${token}` } };
            const res = {};
            const next = () => { nextCalled = true; };

            auth.optionalAuth(req, res, next);
            assert.strictEqual(req.user.id, 99);
            assert.strictEqual(req.user.role, 'admin');
            assert.strictEqual(nextCalled, true);
        });
    });

    describe('requireAdmin middleware', () => {
        it('returns 403 when req.user is missing', () => {
            let status = null;
            let jsonBody = null;
            let nextCalled = false;

            const req = {};
            const res = {
                status: (code) => {
                    status = code;
                    return {
                        json: (data) => { jsonBody = data; }
                    };
                }
            };
            const next = () => { nextCalled = true; };

            auth.requireAdmin(req, res, next);
            assert.strictEqual(status, 403);
            assert.strictEqual(jsonBody.success, false);
            assert.strictEqual(nextCalled, false);
        });

        it('returns 403 when user role is not admin', () => {
            let status = null;
            let jsonBody = null;
            let nextCalled = false;

            const req = { user: { id: 1, role: 'user' } };
            const res = {
                status: (code) => {
                    status = code;
                    return {
                        json: (data) => { jsonBody = data; }
                    };
                }
            };
            const next = () => { nextCalled = true; };

            auth.requireAdmin(req, res, next);
            assert.strictEqual(status, 403);
            assert.strictEqual(jsonBody.error, 'Forbidden: Admin access required');
            assert.strictEqual(nextCalled, false);
        });

        it('calls next when user has role admin', () => {
            let nextCalled = false;
            const req = { user: { id: 1, role: 'admin' } };
            const res = {};
            const next = () => { nextCalled = true; };

            auth.requireAdmin(req, res, next);
            assert.strictEqual(nextCalled, true);
        });
    });
});
