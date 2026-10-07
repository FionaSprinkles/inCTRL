const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const shortcutController = require('../controllers/shortcutController');

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

describe('backend/controllers/shortcutController', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getShortcuts', () => {
        it('returns 200 with shortcut list', async () => {
            const shortcuts = [{ id: 1, title: 'Lock' }];
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, shortcuts);
            });

            const req = { query: { q: 'lock' } };
            const res = createMockResponse();

            await shortcutController.getShortcuts(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
            assert.deepStrictEqual(res.body.shortcuts, shortcuts);
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Query failed'));
            });

            const req = { query: {} };
            const res = createMockResponse();

            await shortcutController.getShortcuts(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Query failed');
        });
    });

    describe('getShortcut', () => {
        it('returns 200 with shortcut when found', async () => {
            const sc = { id: 1, title: 'Lock' };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sc]);
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await shortcutController.getShortcut(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body.shortcut, sc);
        });

        it('returns 404 when shortcut is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 99 } };
            const res = createMockResponse();

            await shortcutController.getShortcut(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, 'Shortcut with id 99 not found');
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Lookup error'));
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await shortcutController.getShortcut(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Lookup error');
        });
    });

    describe('createShortcut', () => {
        it('returns 400 when title, keyCombo, or description is missing', async () => {
            const reqMissing = { body: { title: 'Test' } }; // missing keyCombo and description
            const res = createMockResponse();

            await shortcutController.createShortcut(reqMissing, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'title, keyCombo, and description are required');
        });

        it('returns 201 on successful creation', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 7 });
            });

            const req = {
                body: {
                    title: 'New Shortcut',
                    keyCombo: 'Ctrl+N',
                    description: 'New window'
                }
            };
            const res = createMockResponse();

            await shortcutController.createShortcut(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.shortcut.id, 7);
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Insert failed'));
            });

            const req = {
                body: {
                    title: 'New Shortcut',
                    keyCombo: 'Ctrl+N',
                    description: 'New window'
                }
            };
            const res = createMockResponse();

            await shortcutController.createShortcut(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Insert failed');
        });
    });

    describe('deleteShortcut', () => {
        it('returns 200 on successful deletion', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = { params: { id: 5 } };
            const res = createMockResponse();

            await shortcutController.deleteShortcut(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, 'Shortcut 5 deleted successfully');
        });

        it('returns 500 on deletion error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete failed'));
            });

            const req = { params: { id: 5 } };
            const res = createMockResponse();

            await shortcutController.deleteShortcut(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Delete failed');
        });
    });
});
