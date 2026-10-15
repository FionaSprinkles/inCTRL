const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const { seedDatabase, loadAllQuizQuestions } = require('../scripts/seedDatabase');

describe('backend/scripts/seedDatabase', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    it('successfully seeds categories and shortcuts sequentially', async () => {
        const categories = [
            { id: 1, name: 'Cat 1', slug: 'cat-1', description: 'Desc 1', icon: 'icon-1', display_order: 1 },
            { id: 2, name: 'Cat 2', slug: 'cat-2', description: 'Desc 2', icon: 'icon-2', display_order: 2 }
        ];
        const shortcuts = [
            { id: 1, title: 'Shortcut 1', key_combo: 'Ctrl+A', description: 'Desc S1', category_id: 1, difficulty: 'beginner' },
            { id: 2, title: 'Shortcut 2', key_combo: 'Ctrl+B', description: 'Desc S2', category_id: 2, difficulty: 'intermediate' }
        ];

        const executedQueries = [];
        mockDb.setQueryHandler((sql, params, cb) => {
            executedQueries.push({ sql, params });
            cb(null, { affectedRows: 1 });
        });

        await seedDatabase(categories, shortcuts);

        assert.strictEqual(executedQueries.length, 4);
        assert.ok(executedQueries[0].sql.includes('INSERT INTO categories'));
        assert.deepStrictEqual(executedQueries[0].params, [1, 'Cat 1', 'cat-1', 'Desc 1', 'icon-1', 1]);
        assert.ok(executedQueries[1].sql.includes('INSERT INTO categories'));
        assert.deepStrictEqual(executedQueries[1].params, [2, 'Cat 2', 'cat-2', 'Desc 2', 'icon-2', 2]);
        assert.ok(executedQueries[2].sql.includes('INSERT INTO windows_shortcuts'));
        assert.deepStrictEqual(executedQueries[2].params, [1, 'Shortcut 1', 'Ctrl+A', 'Desc S1', 1, 'beginner']);
        assert.ok(executedQueries[3].sql.includes('INSERT INTO windows_shortcuts'));
        assert.deepStrictEqual(executedQueries[3].params, [2, 'Shortcut 2', 'Ctrl+B', 'Desc S2', 2, 'intermediate']);
    });

    it('handles empty category and shortcut arrays without hanging', async () => {
        const executedQueries = [];
        mockDb.setQueryHandler((sql, params, cb) => {
            executedQueries.push({ sql, params });
            cb(null, []);
        });

        await seedDatabase([], []);
        assert.strictEqual(executedQueries.length, 0);
    });

    it('handles null or undefined arrays gracefully', async () => {
        const executedQueries = [];
        mockDb.setQueryHandler((sql, params, cb) => {
            executedQueries.push({ sql, params });
            cb(null, []);
        });

        await seedDatabase(null, null);
        assert.strictEqual(executedQueries.length, 0);
    });

    it('stops execution and rejects immediately if a category query fails', async () => {
        const categories = [
            { id: 1, name: 'Cat 1', slug: 'cat-1', description: 'Desc 1', icon: 'icon-1', display_order: 1 },
            { id: 2, name: 'Cat 2', slug: 'cat-2', description: 'Desc 2', icon: 'icon-2', display_order: 2 }
        ];
        const shortcuts = [
            { id: 1, title: 'Shortcut 1', key_combo: 'Ctrl+A', description: 'Desc S1', category_id: 1, difficulty: 'beginner' }
        ];

        let callCount = 0;
        mockDb.setQueryHandler((sql, params, cb) => {
            callCount++;
            if (params[0] === 1) {
                return cb(new Error('Category insert failed'));
            }
            cb(null, { affectedRows: 1 });
        });

        await assert.rejects(
            async () => await seedDatabase(categories, shortcuts),
            /Category insert failed/
        );

        // Only the first category query was initiated, no further category or shortcut queries ran
        assert.strictEqual(callCount, 1);
    });

    it('stops execution and rejects immediately if a shortcut query fails', async () => {
        const categories = [
            { id: 1, name: 'Cat 1', slug: 'cat-1', description: 'Desc 1', icon: 'icon-1', display_order: 1 }
        ];
        const shortcuts = [
            { id: 1, title: 'Shortcut 1', key_combo: 'Ctrl+A', description: 'Desc S1', category_id: 1, difficulty: 'beginner' },
            { id: 2, title: 'Shortcut 2', key_combo: 'Ctrl+B', description: 'Desc S2', category_id: 2, difficulty: 'intermediate' }
        ];

        let callCount = 0;
        mockDb.setQueryHandler((sql, params, cb) => {
            callCount++;
            if (sql.includes('windows_shortcuts') && params[0] === 1) {
                return cb(new Error('Shortcut insert failed'));
            }
            cb(null, { affectedRows: 1 });
        });

        await assert.rejects(
            async () => await seedDatabase(categories, shortcuts),
            /Shortcut insert failed/
        );

        // 1 category query + 1 shortcut query, 2nd shortcut query was not executed
        assert.strictEqual(callCount, 2);
    });

    it('successfully seeds quizzes and questions sequentially', async () => {
        const quizzes = [
            { id: 1, title: 'Quiz 1', description: 'Desc Q1', category_id: 1, difficulty: 'Beginner' }
        ];
        const questions = [
            {
                id: 'sc-1',
                quiz_id: 1,
                type: 'single_choice',
                category_id: 1,
                category_name: 'Cat 1',
                difficulty: 'Beginner',
                prompt: 'Prompt 1',
                key_combination: 'Win + D',
                hint: 'Hint 1',
                explanation: 'Explanation 1',
                payload_json: '{"options":[]}'
            }
        ];

        const executedQueries = [];
        mockDb.setQueryHandler((sql, params, cb) => {
            executedQueries.push({ sql, params });
            cb(null, { affectedRows: 1 });
        });

        await seedDatabase([], [], quizzes, questions);

        assert.strictEqual(executedQueries.length, 2);
        assert.ok(executedQueries[0].sql.includes('INSERT INTO quizzes'));
        assert.deepStrictEqual(executedQueries[0].params, [1, 'Quiz 1', 'Desc Q1', 1, 'Beginner']);
        assert.ok(executedQueries[1].sql.includes('INSERT INTO quiz_questions'));
        assert.strictEqual(executedQueries[1].params[0], 'sc-1');
        assert.strictEqual(executedQueries[1].params[1], 1);
        assert.strictEqual(executedQueries[1].params[2], 'single_choice');
    });

    it('stops execution and rejects immediately if a quiz query fails', async () => {
        const quizzes = [
            { id: 1, title: 'Quiz 1', description: 'Desc Q1', category_id: 1, difficulty: 'Beginner' }
        ];

        mockDb.setQueryHandler((sql, params, cb) => {
            if (sql.includes('INSERT INTO quizzes')) {
                return cb(new Error('Quiz insert failed'));
            }
            cb(null, { affectedRows: 1 });
        });

        await assert.rejects(
            async () => await seedDatabase([], [], quizzes, []),
            /Quiz insert failed/
        );
    });

    it('stops execution and rejects immediately if a question query fails', async () => {
        const questions = [
            { id: 'q-1', quiz_id: 1, type: 'single_choice', category_name: 'Cat 1', prompt: 'P1' }
        ];

        mockDb.setQueryHandler((sql, params, cb) => {
            if (sql.includes('INSERT INTO quiz_questions')) {
                return cb(new Error('Question insert failed'));
            }
            cb(null, { affectedRows: 1 });
        });

        await assert.rejects(
            async () => await seedDatabase([], [], [], questions),
            /Question insert failed/
        );
    });

    it('loadAllQuizQuestions loads array of questions or returns empty array if folder empty', () => {
        const questions = loadAllQuizQuestions();
        assert.ok(Array.isArray(questions));
    });

    it('runs default seed with all data when no arguments are passed', async () => {
        const executedQueries = [];
        mockDb.setQueryHandler((sql, params, cb) => {
            executedQueries.push({ sql, params });
            cb(null, { affectedRows: 1 });
        });

        await seedDatabase();
        assert.ok(executedQueries.length > 300);
    });
});
