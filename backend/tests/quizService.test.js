const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const quizService = require('../services/quizService');

describe('backend/services/quizService', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getQuestions', () => {
        it('retrieves questions with no filters and parses JSON payload', async () => {
            const rawRows = [
                {
                    id: 'q1',
                    type: 'single_choice',
                    category_name: 'Navigation',
                    category_id: 1,
                    difficulty: 'Beginner',
                    prompt: 'What closes active window?',
                    hint: 'Alt...',
                    explanation: 'Alt+F4 closes windows',
                    payload_json: JSON.stringify({ options: [{ id: '1', text: 'Alt+F4', isCorrect: true }] })
                },
                {
                    id: 'q2',
                    type: 'fill_blank',
                    category_name: 'General',
                    category_id: null,
                    difficulty: 'Intermediate',
                    prompt: 'Lock Windows',
                    hint: null,
                    explanation: null,
                    payload_json: { canonicalAnswer: 'Win + L' } // already object
                },
                {
                    id: 'q3',
                    type: 'true_false',
                    category_name: 'General',
                    payload_json: '{invalid-json' // Corrupted JSON branch
                }
            ];

            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(!sql.includes('AND type = ?'));
                cb(null, rawRows);
            });

            const result = await quizService.getQuestions();
            assert.strictEqual(result.length, 3);
            assert.strictEqual(result[0].id, 'q1');
            assert.strictEqual(result[0].options[0].text, 'Alt+F4');
            assert.strictEqual(result[1].canonicalAnswer, 'Win + L');
            assert.strictEqual(result[2].id, 'q3');
        });

        it('applies type, difficulty, categoryId, and quizId filters', async () => {
            let capturedParams = [];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('AND type = ?'));
                assert.ok(sql.includes('AND difficulty = ?'));
                assert.ok(sql.includes('AND category_id = ?'));
                assert.ok(sql.includes('AND quiz_id = ?'));
                capturedParams = params;
                cb(null, []);
            });

            await quizService.getQuestions({
                type: 'matching',
                difficulty: 'Hard',
                categoryId: 4,
                quizId: 2
            });

            assert.deepStrictEqual(capturedParams, ['matching', 'Hard', 4, 2]);
        });

        it('ignores type filter when set to "all"', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(!sql.includes('AND type = ?'));
                cb(null, []);
            });

            await quizService.getQuestions({ type: 'all' });
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Question fetch failed'));
            });

            await assert.rejects(
                async () => await quizService.getQuestions(),
                /Question fetch failed/
            );
        });
    });

    describe('getQuestionById', () => {
        it('resolves with formatted question when found', async () => {
            const rawRow = {
                id: 'sc_1',
                type: 'single_choice',
                category_name: 'General',
                payload_json: JSON.stringify({ options: [] })
            };
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, ['sc_1']);
                cb(null, [rawRow]);
            });

            const result = await quizService.getQuestionById('sc_1');
            assert.strictEqual(result.id, 'sc_1');
            assert.deepStrictEqual(result.options, []);
        });

        it('resolves with null when not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await quizService.getQuestionById('nonexistent');
            assert.strictEqual(result, null);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Fetch single question failed'));
            });

            await assert.rejects(
                async () => await quizService.getQuestionById('sc_1'),
                /Fetch single question failed/
            );
        });
    });

    describe('createQuestion', () => {
        it('inserts new question with nested payload and defaults', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('INSERT INTO quiz_questions'));
                assert.strictEqual(params[0], 'new_q');
                assert.strictEqual(params[1], 'single_choice');
                assert.strictEqual(params[2], null);
                assert.strictEqual(params[3], 'General');
                assert.strictEqual(params[4], 'Beginner');
                assert.strictEqual(params[5], 'Prompt text');
                cb(null, { insertId: 1 });
            });

            const result = await quizService.createQuestion({
                id: 'new_q',
                type: 'single_choice',
                prompt: 'Prompt text',
                options: [{ id: '1', text: 'Option 1' }]
            });

            assert.strictEqual(result.id, 'new_q');
        });

        it('rejects when insert fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Insert question error'));
            });

            await assert.rejects(
                async () => await quizService.createQuestion({ id: 'fail', type: 'single_choice', prompt: 'P' }),
                /Insert question error/
            );
        });
    });

    describe('updateQuestion', () => {
        it('updates question with payload fields', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('UPDATE quiz_questions'));
                assert.ok(sql.includes('payload_json = ?'));
                cb(null, { affectedRows: 1 });
            });

            const result = await quizService.updateQuestion('q1', {
                type: 'single_choice',
                categoryName: 'General',
                difficulty: 'Easy',
                prompt: 'Updated Prompt',
                options: [{ id: 'a', isCorrect: true }]
            });

            assert.strictEqual(result.affectedRows, 1);
        });

        it('updates question without updating payload_json when no payload provided', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(!sql.includes('payload_json = ?'));
                cb(null, { affectedRows: 1 });
            });

            const result = await quizService.updateQuestion('q1', {
                type: 'single_choice',
                categoryName: 'General',
                difficulty: 'Easy',
                prompt: 'Updated Prompt'
            });

            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects on update error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update failed'));
            });

            await assert.rejects(
                async () => await quizService.updateQuestion('q1', { prompt: 'P' }),
                /Update failed/
            );
        });
    });

    describe('deleteQuestion', () => {
        it('deletes question by id', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('DELETE FROM quiz_questions WHERE id = ?'));
                assert.deepStrictEqual(params, ['q1']);
                cb(null, { affectedRows: 1 });
            });

            const result = await quizService.deleteQuestion('q1');
            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects on delete failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete question failed'));
            });

            await assert.rejects(
                async () => await quizService.deleteQuestion('q1'),
                /Delete question failed/
            );
        });
    });

    describe('saveAttempt', () => {
        const sampleQuestionRow = {
            id: 'q1',
            type: 'single_choice',
            category_name: 'General',
            payload_json: JSON.stringify({
                options: [
                    { id: 'opt1', text: 'Win+L', isCorrect: true },
                    { id: 'opt2', text: 'Win+D', isCorrect: false }
                ]
            })
        };

        it('rejects with ValidationError when answers object is empty', async () => {
            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: {} }),
                /At least one question answer must be provided/
            );
        });

        it('rejects when question IDs are not found in database', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []); // No questions found
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: { non_existent_q: 'opt1' } }),
                /Invalid question ID\(s\): non_existent_q/
            );
        });

        it('rejects when questions do not match formatFilter', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({
                    formatFilter: 'multiple_choice',
                    answers: { q1: 'opt1' }
                }),
                /Questions do not match formatFilter 'multiple_choice'/
            );
        });

        it('rejects when initial questions query fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Questions query failed'));
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: { q1: 'opt1' } }),
                /Questions query failed/
            );
        });

        it('rejects when pool.getConnection fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(new Error('Connection acquire failed'));
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: { q1: 'opt1' } }),
                /Connection acquire failed/
            );
        });

        it('rejects when beginTransaction fails', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(new Error('Begin transaction failed')),
                    release: () => {}
                });
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: { q1: 'opt1' } }),
                /Begin transaction failed/
            );
        });

        it('rolls back and rejects when attempt insert query fails', async () => {
            let rolledBack = false;
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        qCb(new Error('Insert attempt failure'));
                    },
                    rollback: (rCb) => { rolledBack = true; rCb(); },
                    release: () => {}
                });
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({ answers: { q1: 'opt1' } }),
                /Insert attempt failure/
            );
            assert.strictEqual(rolledBack, true);
        });

        it('rolls back and rejects when XP update query fails for authenticated user', async () => {
            let rolledBack = false;
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        if (sql.includes('INSERT INTO quiz_attempts')) {
                            return qCb(null, { insertId: 77 });
                        }
                        if (sql.includes('UPDATE users SET xp')) {
                            return qCb(new Error('XP update failed'));
                        }
                        qCb(null, {});
                    },
                    rollback: (rCb) => { rolledBack = true; rCb(); },
                    release: () => {}
                });
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({
                    userId: 1,
                    answers: { q1: 'opt1' }
                }),
                /XP update failed/
            );
            assert.strictEqual(rolledBack, true);
        });

        it('rolls back and rejects when commit fails', async () => {
            let rolledBack = false;
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        qCb(null, { insertId: 77 });
                    },
                    commit: (cCb) => {
                        cCb(new Error('Commit failure'));
                    },
                    rollback: (rCb) => { rolledBack = true; rCb(); },
                    release: () => {}
                });
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({
                    guestName: 'Guest',
                    answers: { q1: 'opt2' } // Score 0, goes to else commit path
                }),
                /Commit failure/
            );
            assert.strictEqual(rolledBack, true);
        });

        it('rolls back when commit fails for authenticated user with XP gain', async () => {
            let rolledBack = false;
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        qCb(null, { insertId: 88 });
                    },
                    commit: (cCb) => {
                        cCb(new Error('Auth commit failure'));
                    },
                    rollback: (rCb) => { rolledBack = true; rCb(); },
                    release: () => {}
                });
            });

            await assert.rejects(
                async () => await quizService.saveAttempt({
                    userId: 5,
                    answers: { q1: 'opt1' }
                }),
                /Auth commit failure/
            );
            assert.strictEqual(rolledBack, true);
        });

        it('successfully saves attempt and awards XP to authenticated user', async () => {
            let xpUpdated = false;
            let committed = false;

            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        if (sql.includes('INSERT INTO quiz_attempts')) {
                            return qCb(null, { insertId: 99 });
                        }
                        if (sql.includes('UPDATE users SET xp = xp + ? WHERE id = ?')) {
                            assert.deepStrictEqual(params, [10, 5]); // 1 correct answer = 1 point * 10 XP
                            xpUpdated = true;
                            return qCb(null, { affectedRows: 1 });
                        }
                        qCb(null, {});
                    },
                    commit: (cCb) => { committed = true; cCb(null); },
                    release: () => {}
                });
            });

            const result = await quizService.saveAttempt({
                userId: 5,
                answers: { q1: 'opt1' },
                timeSpentSeconds: 45
            });

            assert.strictEqual(result.id, 99);
            assert.strictEqual(result.score, 1);
            assert.strictEqual(result.maxScore, 1);
            assert.strictEqual(result.totalAnswered, 1);
            assert.strictEqual(result.evaluations[0].isCorrect, true);
            assert.strictEqual(xpUpdated, true);
            assert.strictEqual(committed, true);
        });

        it('successfully saves guest attempt without updating user XP', async () => {
            let committed = false;

            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQuestionRow]);
            });
            mockDb.setConnectionHandler((cb) => {
                cb(null, {
                    beginTransaction: (bCb) => bCb(null),
                    query: (sql, params, qCb) => {
                        assert.ok(!sql.includes('UPDATE users SET xp'));
                        qCb(null, { insertId: 100 });
                    },
                    commit: (cCb) => { committed = true; cCb(null); },
                    release: () => {}
                });
            });

            const result = await quizService.saveAttempt({
                guestName: 'KeyboardHero',
                answers: { q1: 'opt1' }
            });

            assert.strictEqual(result.id, 100);
            assert.strictEqual(result.score, 1);
            assert.strictEqual(committed, true);
        });
    });

    describe('getLeaderboard', () => {
        it('resolves leaderboard records with bounded limit', async () => {
            const leaderboardRows = [
                { id: 1, username: 'Pro', score: 10, timeSpentSeconds: 60 }
            ];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('SELECT \n                a.id'));
                assert.deepStrictEqual(params, [10]);
                cb(null, leaderboardRows);
            });

            const result = await quizService.getLeaderboard(10);
            assert.deepStrictEqual(result, leaderboardRows);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Leaderboard query error'));
            });

            await assert.rejects(
                async () => await quizService.getLeaderboard(),
                /Leaderboard query error/
            );
        });
    });

    describe('getUserAttempts', () => {
        it('resolves with attempts for given userId', async () => {
            const attempts = [{ id: 1, score: 5, totalAnswered: 5 }];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.deepStrictEqual(params, [3]);
                cb(null, attempts);
            });

            const result = await quizService.getUserAttempts(3);
            assert.deepStrictEqual(result, attempts);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Fetch attempts failed'));
            });

            await assert.rejects(
                async () => await quizService.getUserAttempts(3),
                /Fetch attempts failed/
            );
        });
    });

    describe('getQuizzes', () => {
        it('resolves with list of quizzes', async () => {
            const mockQuizzes = [{ id: 1, title: 'Navigation Quiz', questionCount: 5 }];
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('FROM quizzes q'));
                cb(null, mockQuizzes);
            });

            const result = await quizService.getQuizzes();
            assert.deepStrictEqual(result, mockQuizzes);
        });

        it('rejects on query error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Quizzes query error'));
            });

            await assert.rejects(
                async () => await quizService.getQuizzes(),
                /Quizzes query error/
            );
        });
    });

    describe('getQuizById', () => {
        it('resolves with quiz and its questions when found', async () => {
            const mockQuiz = { id: 1, title: 'Navigation Quiz' };

            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quizzes q')) {
                    assert.deepStrictEqual(params, [1]);
                    return cb(null, [mockQuiz]);
                }
                if (sql.includes('FROM quiz_questions')) {
                    assert.ok(sql.includes('quiz_id = ?'));
                    return cb(null, [{ id: 'q1', type: 'single_choice', prompt: 'Prompt 1' }]);
                }
                cb(null, []);
            });

            const result = await quizService.getQuizById(1);
            assert.strictEqual(result.id, 1);
            assert.strictEqual(result.title, 'Navigation Quiz');
            assert.strictEqual(result.questions.length, 1);
        });

        it('resolves with null when quiz not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const result = await quizService.getQuizById(999);
            assert.strictEqual(result, null);
        });

        it('rejects on query failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Quiz query failed'));
            });

            await assert.rejects(
                async () => await quizService.getQuizById(1),
                /Quiz query failed/
            );
        });
    });

    describe('createQuiz, updateQuiz, deleteQuiz', () => {
        it('creates a quiz and returns created data with insertId', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('INSERT INTO quizzes'));
                assert.strictEqual(params[0], 'Test Quiz');
                cb(null, { insertId: 42 });
            });

            const result = await quizService.createQuiz({
                title: 'Test Quiz',
                description: 'A test quiz',
                categoryId: 1,
                difficulty: 'Intermediate'
            });

            assert.strictEqual(result.id, 42);
            assert.strictEqual(result.title, 'Test Quiz');
        });

        it('rejects createQuiz on query error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Create quiz error'));
            });

            await assert.rejects(
                async () => await quizService.createQuiz({ title: 'Fail' }),
                /Create quiz error/
            );
        });

        it('updates a quiz and returns result', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('UPDATE quizzes'));
                assert.strictEqual(params[4], 5);
                cb(null, { affectedRows: 1 });
            });

            const result = await quizService.updateQuiz(5, {
                title: 'Updated Quiz',
                description: 'Updated desc',
                categoryId: 2,
                difficulty: 'Advanced'
            });

            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects updateQuiz on query error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update quiz error'));
            });

            await assert.rejects(
                async () => await quizService.updateQuiz(5, { title: 'Fail' }),
                /Update quiz error/
            );
        });

        it('deletes a quiz and returns result', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                assert.ok(sql.includes('DELETE FROM quizzes'));
                assert.strictEqual(params[0], 5);
                cb(null, { affectedRows: 1 });
            });

            const result = await quizService.deleteQuiz(5);
            assert.strictEqual(result.affectedRows, 1);
        });

        it('rejects deleteQuiz on query error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete quiz error'));
            });

            await assert.rejects(
                async () => await quizService.deleteQuiz(5),
                /Delete quiz error/
            );
        });
    });
});
