const db = require('../connectionMySQL');
const { validateAnswer, normalizeAnswers } = require('./quizValidator');

/**
 * Normalizes a database row into the format expected by frontend quiz components.
 * @param {object} row - Raw MySQL database row object from `quiz_questions`.
 * @returns {object} Formatted question object with parsed payload.
 */
function formatQuestionRow(row) {
    let payload = {};
    if (row.payload_json) {
        try {
            payload = typeof row.payload_json === 'string' 
                ? JSON.parse(row.payload_json) 
                : row.payload_json;
        } catch (e) {
            console.error(`Error parsing payload_json for question ${row.id}:`, e);
        }
    }

    return {
        id: row.id,
        quizId: row.quiz_id !== undefined ? row.quiz_id : null,
        type: row.type,
        category: row.category_name,
        categoryId: row.category_id,
        difficulty: row.difficulty,
        prompt: row.prompt,
        keyCombination: row.key_combination !== undefined ? row.key_combination : null,
        hint: row.hint,
        explanation: row.explanation,
        ...payload
    };
}

/**
 * Retrieves all quizzes with category details and question count.
 * @returns {Promise<Array<object>>} Resolves with list of quizzes.
 */
function getQuizzes() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                q.id,
                q.title,
                q.description,
                q.category_id AS categoryId,
                c.name AS categoryName,
                q.difficulty,
                q.created_at AS createdAt,
                COUNT(qq.id) AS questionCount
            FROM quizzes q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
            GROUP BY q.id
            ORDER BY q.id ASC
        `;
        db.query(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Retrieves a single quiz by ID, including its associated questions.
 * @param {number|string} id - Quiz ID.
 * @returns {Promise<object|null>} Resolves with quiz and questions list, or null if not found.
 */
function getQuizById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                q.id,
                q.title,
                q.description,
                q.category_id AS categoryId,
                c.name AS categoryName,
                q.difficulty,
                q.created_at AS createdAt
            FROM quizzes q
            LEFT JOIN categories c ON q.category_id = c.id
            WHERE q.id = ?
        `;
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);

            const quiz = rows[0];
            getQuestions({ quizId: id })
                .then(questions => {
                    resolve({
                        ...quiz,
                        questions
                    });
                })
                .catch(reject);
        });
    });
}

/**
 * Creates a new quiz.
 * @param {object} data - Quiz creation data.
 * @returns {Promise<object>} Resolves with created quiz.
 */
function createQuiz(data) {
    return new Promise((resolve, reject) => {
        const { title, description = null, categoryId = null, difficulty = 'Beginner' } = data;
        const sql = 'INSERT INTO quizzes (title, description, category_id, difficulty) VALUES (?, ?, ?, ?)';
        db.query(sql, [title, description, categoryId || null, difficulty], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, title, description, categoryId, difficulty });
        });
    });
}

/**
 * Updates an existing quiz by ID.
 * @param {number|string} id - Quiz ID.
 * @param {object} data - Updated quiz fields.
 * @returns {Promise<object>} Resolves with query result.
 */
function updateQuiz(id, data) {
    return new Promise((resolve, reject) => {
        const { title, description = null, categoryId = null, difficulty = 'Beginner' } = data;
        const sql = 'UPDATE quizzes SET title = ?, description = ?, category_id = ?, difficulty = ? WHERE id = ?';
        db.query(sql, [title, description, categoryId || null, difficulty, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Deletes a quiz by ID.
 * @param {number|string} id - Quiz ID.
 * @returns {Promise<object>} Resolves with query result.
 */
function deleteQuiz(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM quizzes WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Retrieves questions with optional filtering by type, difficulty, category, and quizId.
 * @param {object} [filters={}] - Optional filters object.
 * @param {string} [filters.type] - Format type filter (e.g. 'single_choice', 'matching', 'all').
 * @param {string} [filters.difficulty] - Question difficulty level.
 * @param {number|string} [filters.categoryId] - Unique category ID.
 * @param {number|string} [filters.quizId] - Unique quiz ID.
 * @returns {Promise<Array<object>>} Resolves to list of formatted question objects.
 */
function getQuestions(filters = {}) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM quiz_questions WHERE 1=1';
        const params = [];

        if (filters.type && filters.type !== 'all') {
            sql += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.difficulty) {
            sql += ' AND difficulty = ?';
            params.push(filters.difficulty);
        }

        if (filters.categoryId) {
            sql += ' AND category_id = ?';
            params.push(filters.categoryId);
        }

        if (filters.quizId) {
            sql += ' AND quiz_id = ?';
            params.push(filters.quizId);
        }

        sql += ' ORDER BY created_at ASC';

        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            const formatted = rows.map(formatQuestionRow);
            resolve(formatted);
        });
    });
}

/**
 * Retrieves a single question by its unique string identifier.
 * @param {string} id - Question ID.
 * @returns {Promise<object|null>} Resolves to formatted question or null if not found.
 */
function getQuestionById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM quiz_questions WHERE id = ?';
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(formatQuestionRow(rows[0]));
        });
    });
}

/**
 * Inserts a new quiz question and serializes its format-specific payload.
 * @param {object} data - Question fields and payload.
 * @returns {Promise<object>} Resolves with created question data.
 */
function createQuestion(data) {
    return new Promise((resolve, reject) => {
        const {
            id,
            type,
            categoryId,
            categoryName,
            difficulty = 'Beginner',
            prompt,
            hint = null,
            explanation = null,
            ...restPayload
        } = data;

        const payloadJson = JSON.stringify(restPayload.payload || restPayload);

        const sql = `
            INSERT INTO quiz_questions 
            (id, type, category_id, category_name, difficulty, prompt, hint, explanation, payload_json) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [id, type, categoryId || null, categoryName || 'General', difficulty, prompt, hint, explanation, payloadJson];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve({ id, ...data });
        });
    });
}

/**
 * Updates an existing question, preserving existing payload_json when payload fields are omitted.
 * @param {string} id - Question ID.
 * @param {object} data - Updated question fields.
 * @returns {Promise<object>} Resolves with database query result.
 */
function updateQuestion(id, data) {
    return new Promise((resolve, reject) => {
        const {
            type,
            categoryId,
            categoryName,
            difficulty,
            prompt,
            hint,
            explanation,
            ...restPayload
        } = data;

        const hasPayload =
            Object.prototype.hasOwnProperty.call(data, 'payload') ||
            Object.keys(restPayload).length > 0;
        const payloadJson = hasPayload
            ? JSON.stringify(restPayload.payload || restPayload)
            : null;

        const sql = `
            UPDATE quiz_questions 
            SET type = ?, category_id = ?, category_name = ?, difficulty = ?, prompt = ?, hint = ?, explanation = ?${hasPayload ? ', payload_json = ?' : ''}
            WHERE id = ?
        `;
        const params = [
            type,
            categoryId || null,
            categoryName,
            difficulty,
            prompt,
            hint,
            explanation,
            ...(hasPayload ? [payloadJson] : []),
            id
        ];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Deletes a quiz question by ID.
 * @param {string} id - Question ID.
 * @returns {Promise<object>} Resolves with database query result.
 */
function deleteQuestion(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM quiz_questions WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Custom error class for client validation errors returning HTTP 400.
 */
class ValidationError extends Error {
    /**
     * @param {string} message - Validation failure message.
     */
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.isClientError = true;
        this.statusCode = 400;
    }
}

/**
 * Validates submitted answers server-side, stores attempt, and awards XP within a single transaction.
 * @param {object} params - Attempt parameters.
 * @param {number|null} [params.userId=null] - Authenticated user ID or null for guest.
 * @param {string|null} [params.guestName=null] - Optional guest screen name.
 * @param {string} [params.formatFilter='all'] - Format filter applied during the quiz.
 * @param {object|Array} params.answers - Submitted question answers.
 * @param {number} [params.timeSpentSeconds=0] - Total seconds spent taking quiz.
 * @returns {Promise<object>} Resolves with attempt evaluation details and generated attempt ID.
 */
function saveAttempt({ userId = null, guestName = null, formatFilter = 'all', quizId = null, answers, timeSpentSeconds = 0 }) {
    return new Promise((resolve, reject) => {
        const normalizedAnswers = normalizeAnswers(answers);
        const questionIds = Object.keys(normalizedAnswers);

        if (questionIds.length === 0) {
            return reject(new ValidationError('At least one question answer must be provided in answers'));
        }

        // Query stored questions from database matching the supplied question IDs
        const sql = 'SELECT * FROM quiz_questions WHERE id IN (?)';
        db.query(sql, [questionIds], (err, rows) => {
            if (err) return reject(err);

            // Validate that every submitted question ID exists in the database
            const foundMap = new Map();
            rows.forEach(r => foundMap.set(r.id, formatQuestionRow(r)));

            const invalidIds = questionIds.filter(id => !foundMap.has(id));
            if (invalidIds.length > 0) {
                return reject(new ValidationError(`Invalid question ID(s): ${invalidIds.join(', ')}`));
            }

            // If formatFilter is specified and not 'all', validate that questions match format
            if (formatFilter && formatFilter !== 'all') {
                const mismatched = questionIds.filter(id => foundMap.get(id).type !== formatFilter);
                if (mismatched.length > 0) {
                    return reject(new ValidationError(`Questions do not match formatFilter '${formatFilter}': ${mismatched.join(', ')}`));
                }
            }

            // Server-side answer validation and score computation
            let rawScore = 0;
            let rawMaxScore = 0;
            const evaluations = [];

            for (const qId of questionIds) {
                const question = foundMap.get(qId);
                const userAnswer = normalizedAnswers[qId];
                const evalResult = validateAnswer(question, userAnswer);

                rawScore += (evalResult.score || 0);
                rawMaxScore += (evalResult.maxScore || 1);

                evaluations.push({
                    questionId: qId,
                    isCorrect: evalResult.isCorrect,
                    score: evalResult.score,
                    maxScore: evalResult.maxScore,
                    feedback: evalResult.feedback
                });
            }

            const computedScore = Math.min(Math.round(rawMaxScore), Math.max(0, Math.round(rawScore)));
            const computedMaxScore = Math.round(rawMaxScore);
            const totalAnswered = questionIds.length;

            const insertSql = `
                INSERT INTO quiz_attempts 
                (user_id, guest_name, format_filter, score, max_score, total_answered, time_spent_seconds, quiz_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                userId || null,
                guestName || null,
                formatFilter || 'all',
                computedScore,
                computedMaxScore,
                totalAnswered,
                timeSpentSeconds || 0,
                quizId || null
            ];

            db.getConnection((connErr, connection) => {
                if (connErr) return reject(connErr);

                connection.beginTransaction((beginErr) => {
                    if (beginErr) {
                        connection.release();
                        return reject(beginErr);
                    }

                    connection.query(insertSql, params, (insertErr, result) => {
                        if (insertErr) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(insertErr);
                            });
                        }

                        const attemptId = result.insertId;
                        const responseData = {
                            id: attemptId,
                            quizId: quizId || null,
                            score: computedScore,
                            maxScore: computedMaxScore,
                            totalAnswered,
                            evaluations
                        };

                        const resultQuestionsSql = `
                            INSERT INTO result_questions 
                            (result_id, question_id, attempts, is_correct, score, user_answer) 
                            VALUES ?
                        `;
                        const resultQuestionsValues = evaluations.map(ev => {
                            const rawAnswer = normalizedAnswers[ev.questionId];
                            const answerStr = typeof rawAnswer === 'object' && rawAnswer !== null
                                ? JSON.stringify(rawAnswer)
                                : String(rawAnswer ?? '');
                            const attemptsCount = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.attempts)
                                ? Math.max(1, parseInt(rawAnswer.attempts, 10) || 1)
                                : 1;

                            return [
                                attemptId,
                                ev.questionId,
                                attemptsCount,
                                Boolean(ev.isCorrect),
                                ev.score || 0,
                                answerStr.slice(0, 500)
                            ];
                        });

                        connection.query(resultQuestionsSql, [resultQuestionsValues], (rqErr) => {
                            if (rqErr) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(rqErr);
                                });
                            }

                            // Award XP to registered user based strictly on server-computed score (10 XP per point)
                            if (userId && computedScore > 0) {
                                const xpGain = computedScore * 10;
                                connection.query('UPDATE users SET xp = xp + ? WHERE id = ?', [xpGain, userId], (xpErr) => {
                                    if (xpErr) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(xpErr);
                                        });
                                    }

                                    connection.commit((commitErr) => {
                                        if (commitErr) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(commitErr);
                                            });
                                        }
                                        connection.release();
                                        resolve(responseData);
                                    });
                                });
                            } else {
                                connection.commit((commitErr) => {
                                    if (commitErr) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(commitErr);
                                        });
                                    }
                                    connection.release();
                                    resolve(responseData);
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

/**
 * Retrieves global quiz leaderboard sorted by highest score and fastest time.
 * @param {number|string} [limit=10] - Maximum number of leaderboard entries to retrieve.
 * @returns {Promise<Array<object>>} Resolves with array of leaderboard records.
 */
function getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                a.id, 
                a.score, 
                a.max_score AS maxScore, 
                a.total_answered AS totalAnswered, 
                a.time_spent_seconds AS timeSpentSeconds, 
                a.completed_at AS completedAt,
                COALESCE(u.username, a.guest_name, 'Guest') AS username,
                u.display_name AS displayName,
                u.avatar,
                u.xp
            FROM quiz_attempts a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.score DESC, a.time_spent_seconds ASC
            LIMIT ?
        `;
        const n = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        db.query(sql, [n], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Retrieves all quiz attempts for a specific user ID.
 * @param {number|string} userId - Target user ID.
 * @returns {Promise<Array<object>>} Resolves with list of attempts.
 */
function getUserAttempts(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, format_filter AS formatFilter, score, max_score AS maxScore, total_answered AS totalAnswered, time_spent_seconds AS timeSpentSeconds, completed_at AS completedAt
            FROM quiz_attempts 
            WHERE user_id = ?
            ORDER BY completed_at DESC
        `;
        db.query(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Retrieves full attempt details including per-question breakdown from result_questions.
 * @param {number|string} attemptId - Attempt identifier.
 * @returns {Promise<object|null>} Resolves with attempt object and questions array.
 */
function getAttemptDetails(attemptId) {
    return new Promise((resolve, reject) => {
        const attemptSql = `
            SELECT 
                a.id, 
                a.quiz_id AS quizId, 
                q.title AS quizTitle,
                a.user_id AS userId, 
                u.username, 
                u.display_name AS displayName, 
                a.guest_name AS guestName,
                a.format_filter AS formatFilter, 
                a.score, 
                a.max_score AS maxScore, 
                a.total_answered AS totalAnswered, 
                a.time_spent_seconds AS timeSpentSeconds, 
                a.completed_at AS completedAt
            FROM quiz_attempts a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN quizzes q ON a.quiz_id = q.id
            WHERE a.id = ?
        `;
        db.query(attemptSql, [attemptId], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);

            const attempt = rows[0];
            const detailsSql = `
                SELECT 
                    rq.id,
                    rq.result_id AS resultId,
                    rq.question_id AS questionId,
                    rq.attempts,
                    rq.is_correct AS isCorrect,
                    rq.score,
                    rq.user_answer AS userAnswer,
                    qq.prompt,
                    qq.key_combination AS keyCombination,
                    qq.type,
                    qq.difficulty
                FROM result_questions rq
                LEFT JOIN quiz_questions qq ON rq.question_id = qq.id
                WHERE rq.result_id = ?
                ORDER BY rq.id ASC
            `;
            db.query(detailsSql, [attemptId], (dErr, dRows) => {
                if (dErr) return reject(dErr);
                resolve({
                    ...attempt,
                    questions: dRows || []
                });
            });
        });
    });
}

module.exports = {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    saveAttempt,
    getAttemptDetails,
    getLeaderboard,
    getUserAttempts
};
