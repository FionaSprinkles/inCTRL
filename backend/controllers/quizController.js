const jwt = require('jsonwebtoken');
const quizService = require('../services/quizService');
const { generateToken, JWT_SECRET } = require('../middleware/auth');

/**
 * Handles GET /api/quizzes.
 * Retrieves all curated quizzes.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getQuizzes();
        res.json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/quizzes/:id.
 * Retrieves a single quiz and its associated questions.
 * @param {import('express').Request} req - Express request object with id parameter.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await quizService.getQuizById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: `Quiz with id '${id}' not found`
            });
        }
        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles POST /api/quizzes.
 * Creates a new curated quiz (Admin only).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, categoryId, difficulty } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'title is required'
            });
        }
        const created = await quizService.createQuiz({ title, description, categoryId, difficulty });
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz: created
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles PUT /api/quizzes/:id.
 * Updates an existing quiz (Admin only).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await quizService.updateQuiz(id, req.body);
        res.json({
            success: true,
            message: `Quiz '${id}' updated successfully`
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles DELETE /api/quizzes/:id.
 * Deletes a quiz by ID (Admin only).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await quizService.deleteQuiz(id);
        res.json({
            success: true,
            message: `Quiz '${id}' deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/questions.
 * Retrieves all quiz questions matching optional query filters (type, difficulty, categoryId, quizId).
 * @param {import('express').Request} req - Express request object with query parameters.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getQuestions = async (req, res) => {
    try {
        const { type, difficulty, categoryId, quizId } = req.query;
        const questions = await quizService.getQuestions({ type, difficulty, categoryId, quizId });
        res.json({
            success: true,
            count: questions.length,
            questions
        });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/questions/:id.
 * Retrieves a single quiz question by its unique identifier.
 * @param {import('express').Request} req - Express request object with id parameter.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await quizService.getQuestionById(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                error: `Question with id '${id}' not found`
            });
        }
        res.json({
            success: true,
            question
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles POST /api/questions.
 * Creates a new quiz question in the database.
 * @param {import('express').Request} req - Express request object containing question payload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.createQuestion = async (req, res) => {
    try {
        const { id, type, prompt } = req.body;
        if (!id || !type || !prompt) {
            return res.status(400).json({
                success: false,
                error: 'Fields id, type, and prompt are required'
            });
        }

        const newQuestion = await quizService.createQuestion(req.body);
        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question: newQuestion
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles PUT /api/questions/:id.
 * Updates an existing question's attributes and payload.
 * @param {import('express').Request} req - Express request object with id param and updated data.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await quizService.updateQuestion(id, req.body);
        res.json({
            success: true,
            message: `Question '${id}' updated successfully`
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles DELETE /api/questions/:id.
 * Deletes a quiz question by ID.
 * @param {import('express').Request} req - Express request object with id param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await quizService.deleteQuestion(id);
        res.json({
            success: true,
            message: `Question '${id}' deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles POST /api/quiz/attempts.
 * Submits and securely evaluates quiz answers server-side, records attempt and awards XP.
 * @param {import('express').Request} req - Express request object with answer submission.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.submitAttempt = async (req, res) => {
    try {
        const { guestName, formatFilter, quizId, answers, timeSpentSeconds } = req.body;

        // Security (CWE-639 IDOR Fix):
        // Derive userId strictly from the authenticated token session (req.user).
        // Never accept or trust client-supplied userId from req.body.
        const authenticatedUserId = req.user ? req.user.id : null;

        // Validation: answers is required and must be an object or array
        if (!answers || (typeof answers !== 'object' && typeof answers !== 'string')) {
            return res.status(400).json({
                success: false,
                error: 'answers is required and must be an object or array'
            });
        }

        // Validation: timeSpentSeconds
        const safeTimeSpent = Number.isInteger(timeSpentSeconds) && timeSpentSeconds >= 0 ? timeSpentSeconds : 0;

        // Validation: quizId
        const safeQuizId = Number.isInteger(quizId) || (typeof quizId === 'string' && /^\d+$/.test(quizId))
            ? parseInt(quizId, 10)
            : null;

        // Sanitization: guestName
        const safeGuestName = !authenticatedUserId && typeof guestName === 'string'
            ? guestName.trim().slice(0, 50)
            : null;

        const safeFormatFilter = typeof formatFilter === 'string' ? formatFilter.slice(0, 50) : 'all';

        const attempt = await quizService.saveAttempt({
            userId: authenticatedUserId,
            guestName: safeGuestName,
            formatFilter: safeFormatFilter,
            quizId: safeQuizId,
            answers,
            timeSpentSeconds: safeTimeSpent
        });

        const attemptToken = !authenticatedUserId
            ? generateToken({ attemptId: attempt.id, role: 'guest_attempt' }, '7d')
            : null;

        res.status(201).json({
            success: true,
            message: 'Quiz attempt evaluated and saved successfully',
            attempt,
            ...(attemptToken ? { attemptToken } : {})
        });
    } catch (error) {
        console.error('Error submitting attempt:', error);
        const isClientError = Boolean(error.isClientError || error.statusCode === 400);

        res.status(isClientError ? 400 : 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/quiz/leaderboard.
 * Retrieves top ranking quiz attempts ordered by score and time spent.
 * @param {import('express').Request} req - Express request object with optional limit query param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const leaderboard = await quizService.getLeaderboard(limit);
        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/quiz/attempts/user/:userId.
 * Retrieves past quiz attempts submitted by a specific user.
 * @param {import('express').Request} req - Express request object with userId param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getUserAttempts = async (req, res) => {
    try {
        const { userId } = req.params;
        const attempts = await quizService.getUserAttempts(userId);
        res.json({
            success: true,
            attempts
        });
    } catch (error) {
        console.error('Error fetching user attempts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/quiz/attempts/:id/details.
 * Retrieves comprehensive attempt details including per-question breakdown.
 * Access control policy:
 * - Administrators can view any attempt details.
 * - Registered users can only view attempts they own (req.user.id === attempt.userId).
 * - Guest attempts require an unguessable access token matching the attempt ID.
 * - Unauthenticated or unauthorized callers are rejected (401/403).
 * @param {import('express').Request} req - Express request object with id param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getAttemptDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const attempt = await quizService.getAttemptDetails(id);
        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: `Attempt with id '${id}' not found`
            });
        }

        const caller = req.user;
        const isAdmin = caller && caller.role === 'admin';

        if (isAdmin) {
            return res.json({
                success: true,
                attempt
            });
        }

        // Ownership check for registered user attempt
        if (attempt.userId !== null && attempt.userId !== undefined) {
            if (!caller) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required to view this attempt'
                });
            }

            if (Number(caller.id) !== Number(attempt.userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You do not have permission to view this attempt'
                });
            }

            return res.json({
                success: true,
                attempt
            });
        }

        // Access policy for guest attempt (attempt.userId === null):
        // Blocks sequential ID enumeration. Requires unguessable attempt token.
        let guestAuthorized = false;
        if (caller && caller.role === 'guest_attempt' && Number(caller.attemptId) === Number(id)) {
            guestAuthorized = true;
        }

        const tokenCandidate = req.query.token || req.headers['x-attempt-token'];
        if (!guestAuthorized && tokenCandidate) {
            try {
                const decoded = jwt.verify(tokenCandidate, JWT_SECRET);
                if (decoded && (Number(decoded.attemptId) === Number(id) || Number(decoded.id) === Number(id))) {
                    guestAuthorized = true;
                }
            } catch {
                // Invalid or expired guest token
            }
        }

        if (!guestAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Access token required to view guest attempt details'
            });
        }

        res.json({
            success: true,
            attempt
        });
    } catch (error) {
        console.error('Error fetching attempt details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
