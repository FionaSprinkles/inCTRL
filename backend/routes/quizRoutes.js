const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { optionalAuth, authenticateToken, requireAdmin } = require('../middleware/auth');

// Public question read routes
router.get('/api/questions', quizController.getQuestions);
router.get('/api/questions/:id', quizController.getQuestion);

// Protected admin routes for question creation / modification
router.post('/api/questions', authenticateToken, requireAdmin, quizController.createQuestion);
router.put('/api/questions/:id', authenticateToken, requireAdmin, quizController.updateQuestion);
router.delete('/api/questions/:id', authenticateToken, requireAdmin, quizController.deleteQuestion);

// Quiz attempt route: optionalAuth verifies JWT if supplied, ensuring authenticated userId is safely extracted
router.post('/api/quiz/attempts', optionalAuth, quizController.submitAttempt);
router.get('/api/quiz/leaderboard', quizController.getLeaderboard);
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts);

module.exports = router;
