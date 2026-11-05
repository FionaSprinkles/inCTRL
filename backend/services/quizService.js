const crypto = require('crypto');
const db = require('../connectionMySQL');
const { validateAnswer, normalizeAnswers, calculateQuestionPoints } = require('./quizValidator');

const QUIZ_RUN_TTL_MS = 2 * 60 * 60 * 1000;

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isClientError = statusCode >= 400 && statusCode < 500;
    return err;
}

function matchKey() {
    return process.env.JWT_SECRET || 'inctrl-quiz-match-key';
}

function publicMatchId(questionId, pairId) {
    return crypto
        .createHmac('sha256', matchKey())
        .update(`match:${questionId}:${pairId}`)
        .digest('hex')
        .slice(0, 16);
}

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = crypto.randomInt(0, i + 1);
        const swap = copy[i];
        copy[i] = copy[j];
        copy[j] = swap;
    }
    return copy;
}

function canonicalizeMatchingAnswer(question, userAnswer) {
    if (userAnswer == null || typeof userAnswer !== 'object' || Array.isArray(userAnswer)) {
        return userAnswer;
    }
    const tokenToPairId = new Map();
    for (const pair of question.pairs || []) {
        tokenToPairId.set(publicMatchId(question.id, pair.id), String(pair.id));
    }
    const translated = {};
    for (const [leftId, rightValue] of Object.entries(userAnswer)) {
        const pairId = tokenToPairId.get(String(rightValue));
        if (pairId !== undefined) translated[leftId] = pairId;
    }
    return translated;
}

function buildReveal(question) {
    const reveal = {};
    if (question.explanation) reveal.explanation = question.explanation;
    if (question.keyCombination) reveal.keyCombination = question.keyCombination;
    if (question.canonicalAnswer) reveal.canonicalAnswer = question.canonicalAnswer;
    if (Array.isArray(question.acceptedAnswers)) reveal.acceptedAnswers = question.acceptedAnswers;
    if (Array.isArray(question.targetCombo)) reveal.targetCombo = question.targetCombo;
    if (Array.isArray(question.targetKeys)) reveal.targetKeys = question.targetKeys;
    if (question.displayCombo) reveal.displayCombo = question.displayCombo;
    if (typeof question.correctAnswer === 'boolean') reveal.correctAnswer = question.correctAnswer;
    if (question.imposterId !== undefined && question.imposterId !== null) reveal.imposterId = question.imposterId;
    if (question.imposterReason) reveal.imposterReason = question.imposterReason;
    if (Array.isArray(question.correctOrder)) reveal.correctOrder = question.correctOrder;
    if (Array.isArray(question.options)) {
        const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);
        if (correctOptionIds.length > 0) reveal.correctOptionIds = correctOptionIds;
        const optionDetails = question.options
            .filter((option) => option.description)
            .map((option) => ({ id: option.id, description: option.description }));
        if (optionDetails.length > 0) reveal.optionDetails = optionDetails;
    }
    if (Array.isArray(question.pairs)) {
        reveal.pairs = question.pairs.map((pair) => ({
            id: String(pair.id),
            left: pair.left,
            right: pair.right,
            rightId: publicMatchId(question.id, pair.id)
        }));
    }
    return reveal;
}

function matchingKey(question) {
    const map = {};
    for (const pair of question.pairs || []) {
        map[String(pair.id)] = publicMatchId(question.id, pair.id);
    }
    return map;
}

// Play payloads are an allowlist. Answer keys stay on the server until the attempt is graded.
function toPublicQuestion(full) {
    const pub = {
        id: full.id,
        type: full.type,
        prompt: full.prompt,
        difficulty: full.difficulty,
        category: full.category,
        categoryId: full.categoryId,
        hint: full.hint
    };
    if (full.quizId !== undefined && full.quizId !== null) pub.quizId = full.quizId;

    switch (full.type) {
        case 'single_choice':
        case 'multiple_choice':
            if (full.instruction) pub.instruction = full.instruction;
            pub.options = (full.options || []).map((option) => ({
                id: option.id,
                text: option.text,
                label: option.label
            }));
            break;
        case 'fill_blank':
            if (full.placeholder) pub.placeholder = full.placeholder;
            break;
        case 'key_builder':
            pub.keyBank = Array.isArray(full.keyBank) ? full.keyBank : [];
            break;
        case 'live_press':
            if (full.description) pub.description = full.description;
            pub.virtualKeys = Array.isArray(full.virtualKeys) ? full.virtualKeys : [];
            break;
        case 'true_false':
            pub.statement = full.statement || '';
            break;
        case 'odd_one_out':
            if (full.theme) pub.theme = full.theme;
            pub.options = (full.options || []).map((option) => ({
                id: option.id,
                text: option.text
            }));
            break;
        case 'ordering':
            pub.items = (full.items || []).map((item) => ({
                id: item.id,
                text: item.text
            }));
            break;
        case 'matching': {
            const pairs = Array.isArray(full.pairs) ? full.pairs : [];
            pub.leftItems = pairs.map((pair) => ({
                id: String(pair.id),
                text: pair.left
            }));
            pub.rightItems = shuffle(pairs.map((pair) => ({
                id: publicMatchId(full.id, pair.id),
                text: pair.right
            })));
            break;
        }
        default:
            break;
    }

    return pub;
}

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
            WHERE q.is_active = TRUE
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
            WHERE q.id = ? AND q.is_active = TRUE
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
 * Deactivates a quiz by ID instead of permanently deleting it.
 * Inactive quizzes are retained in the database so that existing
 * quiz attempts can still reference the quiz in the history.
 * @param {number|string} id - Quiz ID.
 * @returns {Promise<object>} Resolves with query result.
 */
function deleteQuiz(id) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE quizzes SET is_active = FALSE WHERE id = ?';
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
            const formatted = rows.map((row) => toPublicQuestion(formatQuestionRow(row)));
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
            resolve(toPublicQuestion(formatQuestionRow(rows[0])));
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
 * @param {number} [params.timeSpentSeconds=0] - Server-measured seconds for the whole quiz. Split evenly across its questions. Client clocks are ignored.
 * @param {string|null} [params.runId=null] - Open quiz run to close in the same transaction.
 * @returns {Promise<object>} Resolves with attempt evaluation details and generated attempt ID.
 */
function saveAttempt({ userId = null, guestName = null, formatFilter = 'all', quizId = null, answers, timeSpentSeconds = 0, runId = null }) {
    return new Promise((resolve, reject) => {
        const normalizedAnswers = normalizeAnswers(answers);
        const questionIds = Object.keys(normalizedAnswers);

        if (questionIds.length === 0) {
            return reject(new ValidationError('At least one question answer must be provided in answers'));
        }

        // Query stored questions from database matching the supplied question IDs
        const sql = `
            SELECT qq.*, q.difficulty AS quiz_difficulty
            FROM quiz_questions qq
            LEFT JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qq.id IN (?)
        `;
        db.query(sql, [questionIds], (err, rows) => {
            if (err) return reject(err);

            // Validate that every submitted question ID exists in the database
            const foundMap = new Map();
            rows.forEach(r => {
                const question = formatQuestionRow(r);
                question.quizDifficulty = r.quiz_difficulty;
                foundMap.set(r.id, question);
            });

            const invalidIds = questionIds.filter(id => !foundMap.has(id));
            if (invalidIds.length > 0) {
                return reject(new ValidationError(`Invalid question ID(s): ${invalidIds.join(', ')}`));
            }

            if (quizId != null) {
                const outsideQuiz = questionIds.filter((id) => {
                    const questionQuizId = foundMap.get(id).quizId;
                    return questionQuizId != null && Number(questionQuizId) !== Number(quizId);
                });
                if (outsideQuiz.length > 0) {
                    return reject(new ValidationError(`Invalid question ID(s): ${outsideQuiz.join(', ')}`));
                }
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
            let totalPoints = 0;
            let maxPossiblePoints = 0;
            const evaluations = [];

            const measuredSeconds = Number(timeSpentSeconds);
            const hasMeasuredTime = Number.isFinite(measuredSeconds) && measuredSeconds >= 0;
            const perQuestionSeconds = hasMeasuredTime && questionIds.length > 0
                ? measuredSeconds / questionIds.length
                : null;
            const storedSeconds = Math.max(0, Math.round(hasMeasuredTime ? measuredSeconds : 0));

            for (const qId of questionIds) {
                const question = foundMap.get(qId);
                const rawUserAnswer = normalizedAnswers[qId];
                const userAnswer = question.type === 'matching'
                    ? canonicalizeMatchingAnswer(question, rawUserAnswer)
                    : rawUserAnswer;
                const evalResult = validateAnswer(question, userAnswer);
                const qTime = perQuestionSeconds;

                const pointResult = calculateQuestionPoints(
                    evalResult.score || 0,
                    question.difficulty || question.quizDifficulty || 'Beginner',
                    qTime
                );

                rawScore += (evalResult.score || 0);
                rawMaxScore += (evalResult.maxScore || 1);
                totalPoints += pointResult.points;
                maxPossiblePoints += pointResult.maxPoints;

                evaluations.push({
                    questionId: qId,
                    isCorrect: evalResult.isCorrect,
                    score: pointResult.points,






                    maxScore: pointResult.maxPoints,
                    accuracyScore: evalResult.score,
                    points: pointResult.points,
                    maxPoints: pointResult.maxPoints,
                    timeSpentSeconds: qTime !== null ? Math.round(qTime * 100) / 100 : null,
                    feedback: evalResult.feedback,
                    reveal: buildReveal(question),
                    ...(question.type === 'matching' ? { correctRightByLeft: matchingKey(question) } : {})
                });
            }

            const computedScore = Math.min(Math.round(rawMaxScore), Math.max(0, Math.round(rawScore)));
            const computedMaxScore = Math.round(rawMaxScore);
            const computedPoints = Math.min(maxPossiblePoints, Math.max(0, Math.round(totalPoints)));
            const computedMaxPoints = Math.round(maxPossiblePoints);
            const totalAnswered = questionIds.filter((id) => {
                const value = normalizedAnswers[id];
                if (value === undefined || value === null || value === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
                return true;
            }).length;

            const insertSql = `
                INSERT INTO quiz_attempts 
                (user_id, guest_name, format_filter, score, max_score, total_answered, time_spent_seconds, quiz_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                userId || null,
                guestName || null,
                formatFilter || 'all',
                computedPoints,
                computedMaxPoints,
                totalAnswered,
                storedSeconds,
                quizId || null
            ];

            db.getConnection((connErr, connection) => {
                if (connErr) return reject(connErr);

                connection.beginTransaction((beginErr) => {
                    if (beginErr) {
                        connection.release();
                        return reject(beginErr);
                    }

                    const runInsert = () => {
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
                            score: computedPoints,
                            maxScore: computedMaxPoints,






                            rawScore: computedScore,
                            rawMaxScore: computedMaxScore,
                            points: computedPoints,
                            maxPoints: computedMaxPoints,
                            totalAnswered,
                            timeSpentSeconds: storedSeconds,
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
                    });
                    };

                    if (!runId) return runInsert();

                    connection.query(
                        'UPDATE quiz_runs SET status = ?, submitted_at = ? WHERE id = ? AND status = ?',
                        ['submitted', new Date(), runId, 'open'],
                        (claimErr, claimResult) => {
                            if (claimErr) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(claimErr);
                                });
                            }
                            if (!claimResult || claimResult.affectedRows !== 1) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(httpError(409, 'Quiz run already submitted'));
                                });
                            }
                            runInsert();
                        }
                    );
                });
            });
        });
    });
}

/**
 * Retrieves global quiz leaderboard sorted by highest score and fastest time.
 * @param {string} [filter='total'] Time filter ('today', 'week', 'total').
 * @param {number|string} [limit=10] - Maximum number of leaderboard entries to retrieve.
 * @returns {Promise<Array<object>>} Resolves with array of leaderboard records.
 */
function getLeaderboard(filter = 'total', limit=50) {
    return new Promise((resolve, reject) => {
        let timeCondition = '';
        if (filter === 'today') {
            timeCondition = 'WHERE qa.completed_at >= CURDATE()';
        } else if (filter === 'week') {
            timeCondition = 'WHERE qa.completed_at >= (NOW() - INTERVAL 7 DAY)';
        }

        const sql = `
            SELECT
                u.id,
                u.username AS name,
                u.avatar,
                SUM(qa.score) AS total_points
            FROM users u
                     JOIN quiz_attempts qa ON u.id = qa.user_id
                ${timeCondition}
            GROUP BY u.id, u.display_name, u.username, u.avatar
            ORDER BY total_points DESC, u.id ASC
                LIMIT ?
        `;

        const n = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
        db.query(sql, [n], (err, rows) => {
            if (err) return reject(err);

            const formatted = rows.rows || rows.map((row, index) => ({
                rank: index + 1,
                name: row.name,
                initial: row.name ? row.name.charAt(0).toUpperCase() : 'U',
                points: `${Number(row.total_points || 0).toLocaleString('sv-SE')} p`,
                avatar: row.avatar,
                avatarBg: index === 0 ? '#E06D53' : index === 1 ? '#5B8DEF' : '#45B69C',
                podiumBg: index === 0 ? '#ECC046' : index === 1 ? '#D1D7E3' : '#DC976A'
            }));

            resolve(formatted);
        });
    });
}

/**
 * Retrieves all quiz attempts for a specific user ID.
 * Makes join with "quizzes" to fetch quiz name to frontend
 * 
 * @param {number|string} userId - Target user ID.
 * @returns {Promise<Array<object>>} Resolves with list of attempts.
 */
function getUserAttempts(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
            qa.id, qa.quiz_id AS quizId,
            qa.format_filter AS formatFilter,
            qa.score,
            qa.max_score AS maxScore,
            qa.total_answered AS totalAnswered,
            qa.time_spent_seconds AS timeSpentSeconds,
            qa.completed_at AS completedAt,
            q.title AS quizname,
            q.difficulty,
            q.category_id AS categoryId  -- Include category ID to allow filtering quiz history by category.
            

            FROM quiz_attempts AS qa 
            LEFT JOIN quizzes q ON qa.quiz_id = q.id  -- Join quizzes to retrieve the quiz title.
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

let quizRunsReady = null;

function ensureQuizRunsTable() {
    if (!quizRunsReady) {
        quizRunsReady = query(`
            CREATE TABLE IF NOT EXISTS quiz_runs (
                id CHAR(36) NOT NULL,
                quiz_id INT NOT NULL,
                user_id INT NULL,
                started_at DATETIME(3) NOT NULL,
                expires_at DATETIME(3) NOT NULL,
                submitted_at DATETIME(3) NULL,
                status ENUM('open', 'submitted') NOT NULL DEFAULT 'open',
                PRIMARY KEY (id),
                KEY idx_quiz_runs_quiz (quiz_id),
                CONSTRAINT fk_quiz_runs_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                CONSTRAINT fk_quiz_runs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `).catch((err) => {
            quizRunsReady = null;
            throw err;
        });
    }
    return quizRunsReady;
}

async function createQuizRun({ quizId, userId = null }) {
    await ensureQuizRunsTable();
    const idNum = Number(quizId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
        throw new ValidationError('quizId is required');
    }

    const quizzes = await query(
        'SELECT id FROM quizzes WHERE id = ? AND is_active = TRUE',
        [idNum]
    );
    if (!quizzes || quizzes.length === 0) {
        throw httpError(404, 'Quiz not found');
    }

    const id = crypto.randomUUID();
    const started = new Date();
    const expires = new Date(started.getTime() + QUIZ_RUN_TTL_MS);
    await query(
        'INSERT INTO quiz_runs (id, quiz_id, user_id, started_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, idNum, userId == null ? null : Number(userId), started, expires, 'open']
    );

    return {
        id,
        quizId: idNum,
        startedAt: started.toISOString(),
        expiresAt: expires.toISOString()
    };
}

async function submitQuizRun({ runId, userId = null, guestName = null, answers }) {
    await ensureQuizRunsTable();
    const runs = await query(
        `SELECT id, quiz_id AS quizId, user_id AS userId,
                started_at AS startedAt, expires_at AS expiresAt, status
         FROM quiz_runs
         WHERE id = ?`,
        [runId]
    );
    const run = runs && runs[0];
    if (!run) throw httpError(404, 'Quiz run not found');
    if (run.status !== 'open') throw httpError(409, 'Quiz run already submitted');

    const expiresAt = new Date(run.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
        throw httpError(400, 'Quiz run expired. Start the quiz again.');
    }

    if (run.userId != null) {
        if (userId == null) {
            throw httpError(401, 'Authentication required to submit this quiz run');
        }
        if (Number(userId) !== Number(run.userId)) {
            throw httpError(403, 'You cannot submit this quiz run');
        }
    }

    const startedAt = new Date(run.startedAt);
    if (Number.isNaN(startedAt.getTime())) {
        throw httpError(400, 'Quiz run expired. Start the quiz again.');
    }
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));

    const questionRows = await query(
        `SELECT qq.*, q.difficulty AS quiz_difficulty
         FROM quiz_questions qq
         LEFT JOIN quizzes q ON q.id = qq.quiz_id
         WHERE qq.quiz_id = ?
         ORDER BY qq.created_at ASC`,
        [run.quizId]
    );
    if (!questionRows || questionRows.length === 0) {
        throw new ValidationError('No questions found for this quiz');
    }

    const submitted = normalizeAnswers(answers);
    const allowedIds = new Set(questionRows.map((row) => String(row.id)));
    const outsideQuiz = Object.keys(submitted).filter((id) => !allowedIds.has(String(id)));
    if (outsideQuiz.length > 0) {
        throw new ValidationError(`Invalid question ID(s): ${outsideQuiz.join(', ')}`);
    }

    const gradedAnswers = {};
    for (const row of questionRows) {
        gradedAnswers[row.id] = Object.prototype.hasOwnProperty.call(submitted, row.id)
            ? submitted[row.id]
            : null;
    }

    const attemptUserId = run.userId != null
        ? Number(run.userId)
        : (userId == null ? null : Number(userId));

    return saveAttempt({
        userId: attemptUserId,
        guestName: attemptUserId == null ? guestName : null,
        formatFilter: 'all',
        quizId: run.quizId,
        answers: gradedAnswers,
        timeSpentSeconds: elapsedSeconds,
        runId: run.id
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
    ensureQuizRunsTable,
    createQuizRun,
    submitQuizRun,
    getAttemptDetails,
    getLeaderboard,
    getUserAttempts
};
