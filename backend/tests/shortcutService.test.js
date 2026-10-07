const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const shortcutService = require('../services/shortcutService');

describe('backend/services/shortcutService', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getAllShortcuts', () => {
        it('retrieves all shortcuts without filters', async () => {
            const rows = [
                { id: 1, title: 'Lock Screen', keyCombo: 'Win + L' },
                { id: 2, title: 'File Explorer', keyCombo: 'Win + E' }
            ];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(!sql.includes('AND (s.title LIKE'));
                assert.ok(!sql.includes('AND s.category_id = ?'));
                assert.ok(!sql.includes('AND s.difficulty = ?'));
                cb(null, rows);
            });

            const result = await shortcutService.getAllShortcuts();
            assert.deepStrictEqual(result, rows);
        });

        it('applies search, categoryId, and difficulty filters', async () => {
            let capturedParams = [];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('s.title LIKE ?'));
                assert.ok(sql.includes('s.category_id = ?'));
                assert.ok(sql.includes('s.difficulty = ?'));
                capturedParams = params;
                cb(null, [{ id: 1, title: 'Lock Screen', keyCombo: 'Win + L' }]);
            });

            const result = await shortcutService.getAllShortcuts({
                q: 'lock',
                categoryId: 3,
                difficulty: 'Beginner'
            });

            assert.strictEqual(result.length, 1);
            assert.deepStrictEqual(capturedParams, ['%lock%', '%lock%', '%lock%', 3, 'Beginner']);
        });

        it('rejects when query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Failed to query shortcuts'));
            });

            await assert.rejects(
                async () => await shortcutService.getAllShortcuts(),
                /Failed to query shortcuts/
            );
        });
    });

    describe('getShortcutById', () => {
        it('resolves with shortcut when found', async () => {
            const row = { id: 1, title: 'Lock Screen', keyCombo: 'Win + L' };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, [1]);
                cb(null, [row]);
            });

            const result = await shortcutService.getShortcutById(1);
            assert.deepStrictEqual(result, row);
        });

        it('resolves with null when not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await shortcutService.getShortcutById(999);
            assert.strictEqual(result, null);
        });

        it('rejects when query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Query failed'));
            });

            await assert.rejects(
                async () => await shortcutService.getShortcutById(1),
                /Query failed/
            );
        });
    });

    describe('createShortcut', () => {
        it('creates a new shortcut with all attributes and default difficulty', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('INSERT INTO windows_shortcuts'));
                assert.deepStrictEqual(params, ['Lock Screen', 'Win + L', 'Locks Windows PC', null, 'Beginner']);
                cb(null, { insertId: 10 });
            });

            const result = await shortcutService.createShortcut({
                title: 'Lock Screen',
                keyCombo: 'Win + L',
                description: 'Locks Windows PC'
            });

            assert.deepStrictEqual(result, {
                id: 10,
                title: 'Lock Screen',
                keyCombo: 'Win + L',
                description: 'Locks Windows PC',
                categoryId: undefined,
                difficulty: 'Beginner'
            });
        });

        it('creates a shortcut with explicit categoryId and difficulty', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, ['Task Manager', 'Ctrl + Shift + Esc', 'Opens Task Manager', 2, 'Intermediate']);
                cb(null, { insertId: 11 });
            });

            const result = await shortcutService.createShortcut({
                title: 'Task Manager',
                keyCombo: 'Ctrl + Shift + Esc',
                description: 'Opens Task Manager',
                categoryId: 2,
                difficulty: 'Intermediate'
            });

            assert.strictEqual(result.id, 11);
            assert.strictEqual(result.categoryId, 2);
            assert.strictEqual(result.difficulty, 'Intermediate');
        });

        it('rejects when insert query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Insert error'));
            });

            await assert.rejects(
                async () => await shortcutService.createShortcut({
                    title: 'Fail',
                    keyCombo: 'Ctrl+F',
                    description: 'Fail'
                }),
                /Insert error/
            );
        });
    });

    describe('deleteShortcut', () => {
        it('deletes shortcut by id', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('DELETE FROM windows_shortcuts WHERE id = ?'));
                assert.deepStrictEqual(params, [5]);
                cb(null, { affectedRows: 1 });
            });

            const result = await shortcutService.deleteShortcut(5);
            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects when delete query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete error'));
            });

            await assert.rejects(
                async () => await shortcutService.deleteShortcut(5),
                /Delete error/
            );
        });
    });
});
