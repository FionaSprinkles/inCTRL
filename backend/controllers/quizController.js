const quizService = require('../services/quizService');

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

exports.submitAttempt = async (req, res) => {
    try {
        const { guestName, formatFilter, score, maxScore, totalAnswered, timeSpentSeconds } = req.body;

        // Security (CWE-639 IDOR Fix):
        // Derive userId strictly from the authenticated token session (req.user).
        // Never accept or trust client-supplied userId from req.body.
        const authenticatedUserId = req.user ? req.user.id : null;

        // Validation: Verify score and maxScore are integers
        if (typeof score !== 'number' || !Number.isInteger(score)) {
            return res.status(400).json({
                success: false,
                error: 'score is required and must be an integer'
            });
        }

        if (typeof maxScore !== 'number' || !Number.isInteger(maxScore)) {
            return res.status(400).json({
                success: false,
                error: 'maxScore is required and must be an integer'
            });
        }

        // Validation: Enforce 0 <= score <= maxScore bounds
        if (maxScore < 0 || score < 0 || score > maxScore) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score: score must satisfy 0 <= score <= maxScore'
            });
        }

        // Validation: totalAnswered bounds
        const safeTotalAnswered = Number.isInteger(totalAnswered) && totalAnswered >= 0 ? totalAnswered : 0;
        if (safeTotalAnswered > maxScore) {
            return res.status(400).json({
                success: false,
                error: 'totalAnswered cannot exceed maxScore'
            });
        }

        // Validation: timeSpentSeconds
        const safeTimeSpent = Number.isInteger(timeSpentSeconds) && timeSpentSeconds >= 0 ? timeSpentSeconds : 0;

        // Sanitization: guestName
        const safeGuestName = !authenticatedUserId && typeof guestName === 'string'
            ? guestName.trim().slice(0, 50)
            : null;

        const attempt = await quizService.saveAttempt({
            userId: authenticatedUserId,
            guestName: safeGuestName,
            formatFilter: typeof formatFilter === 'string' ? formatFilter.slice(0, 50) : 'all',
            score,
            maxScore,
            totalAnswered: safeTotalAnswered,
            timeSpentSeconds: safeTimeSpent
        });

        res.status(201).json({
            success: true,
            message: 'Quiz attempt saved successfully',
            attempt
        });
    } catch (error) {
        console.error('Error submitting attempt:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

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
