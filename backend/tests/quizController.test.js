const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { getMockDb } = require('./helpers/mockDb');

const mockDb = getMockDb();
const quizController = require('../controllers/quizController');

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

describe('backend/controllers/quizController', () => {
    beforeEach(() => {
        mockDb.reset();
    });

    describe('getQuestions', () => {
        it('returns 200 with list of questions', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 'q1', type: 'single_choice' }]);
            });

            const req = { query: { type: 'single_choice', difficulty: 'Beginner' } };
            const res = createMockResponse();

            await quizController.getQuestions(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('DB failure'));
            });

            const req = { query: {} };
            const res = createMockResponse();

            await quizController.getQuestions(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'DB failure');
        });
    });

    describe('getQuestion', () => {
        it('returns 200 with question details when found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 'q1', prompt: 'Prompt' }]);
            });

            const req = { params: { id: 'q1' } };
            const res = createMockResponse();

            await quizController.getQuestion(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.question.id, 'q1');
        });

        it('returns 404 when question is not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 'unknown_q' } };
            const res = createMockResponse();

            await quizController.getQuestion(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, "Question with id 'unknown_q' not found");
        });

        it('returns 500 on service failure', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Question lookup failed'));
            });

            const req = { params: { id: 'q1' } };
            const res = createMockResponse();

            await quizController.getQuestion(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Question lookup failed');
        });
    });

    describe('createQuestion', () => {
        it('returns 400 when required fields are missing', async () => {
            const req = { body: { id: 'q1' } }; // missing type and prompt
            const res = createMockResponse();

            await quizController.createQuestion(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'Fields id, type, and prompt are required');
        });

        it('returns 201 on successful question creation', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 1 });
            });

            const req = {
                body: {
                    id: 'new_q',
                    type: 'single_choice',
                    prompt: 'What does Ctrl+C do?'
                }
            };
            const res = createMockResponse();

            await quizController.createQuestion(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.message, 'Question created successfully');
            assert.strictEqual(res.body.question.id, 'new_q');
        });

        it('returns 500 on creation error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Create question failed'));
            });

            const req = {
                body: { id: 'q1', type: 'single_choice', prompt: 'P' }
            };
            const res = createMockResponse();

            await quizController.createQuestion(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Create question failed');
        });
    });

    describe('updateQuestion', () => {
        it('returns 200 on successful update', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = { params: { id: 'q1' }, body: { prompt: 'Updated prompt' } };
            const res = createMockResponse();

            await quizController.updateQuestion(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, "Question 'q1' updated successfully");
        });

        it('returns 500 on update error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update failed'));
            });

            const req = { params: { id: 'q1' }, body: {} };
            const res = createMockResponse();

            await quizController.updateQuestion(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Update failed');
        });
    });

    describe('deleteQuestion', () => {
        it('returns 200 on successful deletion', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = { params: { id: 'q1' } };
            const res = createMockResponse();

            await quizController.deleteQuestion(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, "Question 'q1' deleted successfully");
        });

        it('returns 500 on delete error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete error'));
            });

            const req = { params: { id: 'q1' } };
            const res = createMockResponse();

            await quizController.deleteQuestion(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Delete error');
        });
    });

    describe('submitAttempt', () => {
        it('returns 400 when answers is missing or invalid type', async () => {
            const req = { body: { answers: null } };
            const res = createMockResponse();

            await quizController.submitAttempt(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'answers is required and must be an object or array');
        });

        it('returns 201 on valid submission by guest user', async () => {
            const sampleQ = {
                id: 'q1',
                type: 'single_choice',
                payload_json: JSON.stringify({ options: [{ id: 'opt1', isCorrect: true }] })
            };
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [sampleQ]);
            });

            const req = {
                body: {
                    guestName: 'GuestMaster',
                    answers: { q1: 'opt1' },
                    timeSpentSeconds: 15
                }
            };
            const res = createMockResponse();

            await quizController.submitAttempt(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.attempt.score, 1);
        });

        it('returns 400 when validation error occurs in quizService', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []); // No questions found -> ValidationError
            });

            const req = {
                body: {
                    answers: { invalid_q: 'answer' }
                }
            };
            const res = createMockResponse();

            await quizController.submitAttempt(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.error.includes('Invalid question ID'));
        });

        it('returns 500 on unexpected server error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Fatal database crash'));
            });

            const req = {
                body: {
                    answers: { q1: 'opt1' }
                }
            };
            const res = createMockResponse();

            await quizController.submitAttempt(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Fatal database crash');
        });
    });

    describe('getLeaderboard', () => {
        it('returns 200 with leaderboard data', async () => {
            const entries = [{ id: 1, username: 'PlayerOne', score: 10 }];
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, entries);
            });

            const req = { query: { limit: 5 } };
            const res = createMockResponse();

            await quizController.getLeaderboard(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body.leaderboard, entries);
        });

        it('returns 500 on leaderboard error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Leaderboard failure'));
            });

            const req = { query: {} };
            const res = createMockResponse();

            await quizController.getLeaderboard(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Leaderboard failure');
        });
    });

    describe('getUserAttempts', () => {
        it('returns 200 with user attempts', async () => {
            const attempts = [{ id: 1, score: 5 }];
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, attempts);
            });

            const req = { params: { userId: 3 } };
            const res = createMockResponse();

            await quizController.getUserAttempts(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body.attempts, attempts);
        });

        it('returns 500 on error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Attempts query failure'));
            });

            const req = { params: { userId: 3 } };
            const res = createMockResponse();

            await quizController.getUserAttempts(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Attempts query failure');
        });
    });

    describe('getQuizzes', () => {
        it('returns 200 with list of quizzes', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, [{ id: 1, title: 'Quiz 1' }]);
            });

            const req = {};
            const res = createMockResponse();

            await quizController.getQuizzes(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Quizzes error'));
            });

            const req = {};
            const res = createMockResponse();

            await quizController.getQuizzes(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Quizzes error');
        });
    });

    describe('getQuiz', () => {
        it('returns 200 with quiz details when found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quizzes')) return cb(null, [{ id: 1, title: 'Quiz 1' }]);
                cb(null, []);
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await quizController.getQuiz(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.quiz.id, 1);
        });

        it('returns 404 when quiz not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 999 } };
            const res = createMockResponse();

            await quizController.getQuiz(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, "Quiz with id '999' not found");
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Quiz fetch failure'));
            });

            const req = { params: { id: 1 } };
            const res = createMockResponse();

            await quizController.getQuiz(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Quiz fetch failure');
        });
    });

    describe('createQuiz, updateQuiz, deleteQuiz', () => {
        it('createQuiz returns 400 when title is missing', async () => {
            const req = { body: {} };
            const res = createMockResponse();

            await quizController.createQuiz(req, res);
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.error, 'title is required');
        });

        it('createQuiz returns 201 on success', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { insertId: 10 });
            });

            const req = { body: { title: 'New Quiz' } };
            const res = createMockResponse();

            await quizController.createQuiz(req, res);
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.quiz.id, 10);
        });

        it('createQuiz returns 500 on error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Create error'));
            });

            const req = { body: { title: 'New Quiz' } };
            const res = createMockResponse();

            await quizController.createQuiz(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Create error');
        });

        it('updateQuiz returns 200 on success', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = { params: { id: 2 }, body: { title: 'Updated' } };
            const res = createMockResponse();

            await quizController.updateQuiz(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.success, true);
        });

        it('updateQuiz returns 500 on error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Update error'));
            });

            const req = { params: { id: 2 }, body: { title: 'Updated' } };
            const res = createMockResponse();

            await quizController.updateQuiz(req, res);
            assert.strictEqual(res.statusCode, 500);
        });

        it('deleteQuiz returns 200 on success', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, { affectedRows: 1 });
            });

            const req = { params: { id: 2 } };
            const res = createMockResponse();

            await quizController.deleteQuiz(req, res);
            assert.strictEqual(res.statusCode, 200);
        });

        it('deleteQuiz returns 500 on error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Delete error'));
            });

            const req = { params: { id: 2 } };
            const res = createMockResponse();

            await quizController.deleteQuiz(req, res);
            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('getAttemptDetails', () => {
        it('returns 200 with attempt details when found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                if (sql.includes('FROM quiz_attempts a')) return cb(null, [{ id: 5, score: 3 }]);
                if (sql.includes('FROM result_questions rq')) return cb(null, [{ id: 1, questionId: 'q1' }]);
                cb(null, []);
            });

            const req = { params: { id: 5 } };
            const res = createMockResponse();

            await quizController.getAttemptDetails(req, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.attempt.id, 5);
        });

        it('returns 404 when attempt not found', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(null, []);
            });

            const req = { params: { id: 999 } };
            const res = createMockResponse();

            await quizController.getAttemptDetails(req, res);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error, "Attempt with id '999' not found");
        });

        it('returns 500 on service error', async () => {
            mockDb.setQueryHandler((sql, params, cb) => {
                cb(new Error('Detail error'));
            });

            const req = { params: { id: 5 } };
            const res = createMockResponse();

            await quizController.getAttemptDetails(req, res);
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'Detail error');
        });
    });
});
