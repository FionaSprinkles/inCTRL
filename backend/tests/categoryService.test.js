const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const categoryService = require('../services/categoryService');

describe('backend/services/categoryService', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getCategories', () => {
        it('resolves with list of categories on successful query', async () => {
            const expectedRows = [
                { id: 1, name: 'General', slug: 'general', displayOrder: 1 },
                { id: 2, name: 'Navigation', slug: 'navigation', displayOrder: 2 }
            ];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('SELECT id, name, slug'));
                cb(null, expectedRows);
            });

            const result = await categoryService.getCategories();
            assert.deepStrictEqual(result, expectedRows);
        });

        it('rejects with error when database query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('DB connection failed'));
            });

            await assert.rejects(
                async () => await categoryService.getCategories(),
                /DB connection failed/
            );
        });
    });

    describe('getCategoryById', () => {
        it('resolves with category object when found', async () => {
            const categoryRow = { id: 1, name: 'General', slug: 'general' };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, [1]);
                cb(null, [categoryRow]);
            });

            const result = await categoryService.getCategoryById(1);
            assert.deepStrictEqual(result, categoryRow);
        });

        it('resolves with null when category not found or empty rows', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await categoryService.getCategoryById(999);
            assert.strictEqual(result, null);
        });

        it('rejects when query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Query error'));
            });

            await assert.rejects(
                async () => await categoryService.getCategoryById(1),
                /Query error/
            );
        });
    });

    describe('createCategory', () => {
        it('creates a category with supplied slug, description, and icon', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('INSERT INTO categories'));
                assert.deepStrictEqual(params, ['Dev Tools', 'dev-tools', 'Developer shortcuts', 'code']);
                cb(null, { insertId: 5 });
            });

            const result = await categoryService.createCategory({
                name: 'Dev Tools',
                slug: 'dev-tools',
                description: 'Developer shortcuts',
                icon: 'code'
            });

            assert.deepStrictEqual(result, {
                id: 5,
                name: 'Dev Tools',
                slug: 'dev-tools',
                description: 'Developer shortcuts',
                icon: 'code'
            });
        });

        it('auto-generates slug and defaults description/icon when omitted', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, ['Window Management!', 'window-management-', '', 'keyboard']);
                cb(null, { insertId: 6 });
            });

            const result = await categoryService.createCategory({
                name: 'Window Management!'
            });

            assert.strictEqual(result.id, 6);
            assert.strictEqual(result.slug, 'window-management-');
            assert.strictEqual(result.icon, 'keyboard');
        });

        it('rejects when insert query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Insert failed'));
            });

            await assert.rejects(
                async () => await categoryService.createCategory({ name: 'Fail' }),
                /Insert failed/
            );
        });
    });
});
