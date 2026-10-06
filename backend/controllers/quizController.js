const quizService = require('../services/quizService');

/**
 * Handles GET /api/questions.
 * Retrieves all quiz questions matching optional query filters (type, difficulty, categoryId).
 * @param {import('express').Request} req - Express request object with query parameters.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getQuestions = async (req, res) => {
    try {
        const { type, difficulty, categoryId } = req.query;
        const questions = await quizService.getQuestions({ type, difficulty, categoryId });
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
        const { guestName, formatFilter, answers, timeSpentSeconds } = req.body;

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

        // Sanitization: guestName
        const safeGuestName = !authenticatedUserId && typeof guestName === 'string'
            ? guestName.trim().slice(0, 50)
            : null;

        const safeFormatFilter = typeof formatFilter === 'string' ? formatFilter.slice(0, 50) : 'all';

        const attempt = await quizService.saveAttempt({
            userId: authenticatedUserId,
            guestName: safeGuestName,
            formatFilter: safeFormatFilter,
            answers,
            timeSpentSeconds: safeTimeSpent
        });

        res.status(201).json({
            success: true,
            message: 'Quiz attempt evaluated and saved successfully',
            attempt
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
