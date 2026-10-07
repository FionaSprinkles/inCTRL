const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const categoryController = require('../controllers/categoryController');
const categoryService = require('../services/categoryService');

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

describe('backend/controllers/categoryController', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getCategories', () => {
        it('returns 200 with list of categories', async () => {
            const categories = [{ id: 1, name: 'General' }];
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, categories);
            });

            const req = {};
            const res = createMockResponse();

            await categoryController.getCategories(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
            assert.deepStrictEqual(res.body.categories, categories);
        });

        it('returns 500 on service failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('DB failure'));
            });

            const req = {};
            const res = createMockResponse();

            await categoryController.getCategories(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.error, 'DB failure');
        });
    });

    describe('getCategory', () => {
        it('returns 200 with category details when found', async () => {
            const category = { id: 1, name: 'General' };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [category]);
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await categoryController.getCategory(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.deepStrictEqual(res.body.category, category);
        });

        it('returns 404 when category is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 99 } };
            const res = createMockResponse();

            await categoryController.getCategory(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.error, 'Category with id 99 not found');
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Read error'));
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await categoryController.getCategory(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Read error');
        });
    });

    describe('createCategory', () => {
        it('returns 400 when name is missing', async () => {
            const req = { body: {} };
            const res = createMockResponse();

            await categoryController.createCategory(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.error, 'Category name is required');
        });

        it('returns 201 on successful category creation', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 3 });
            });

            const req = { body: { name: 'New Cat', slug: 'new-cat' } };
            const res = createMockResponse();

            await categoryController.createCategory(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.category.id, 3);
        });

        it('returns 500 on database failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Insert error'));
            });

            const req = { body: { name: 'Fail' } };
            const res = createMockResponse();

            await categoryController.createCategory(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Insert error');
        });
    });
});
