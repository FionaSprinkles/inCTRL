const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { optionalAuth, authenticateToken, requireAdmin } = require('../middleware/auth');

// Public quiz read routes
router.get('/api/quizzes', quizController.getQuizzes);
router.get('/api/quizzes/:id', quizController.getQuiz);

// Protected admin routes for quiz management
router.post('/api/quizzes', authenticateToken, requireAdmin, quizController.createQuiz);
router.put('/api/quizzes/:id', authenticateToken, requireAdmin, quizController.updateQuiz);
router.delete('/api/quizzes/:id', authenticateToken, requireAdmin, quizController.deleteQuiz);

// Public question read routes
router.get('/api/questions', quizController.getQuestions);
router.get('/api/questions/:id', quizController.getQuestion);

// Protected admin routes for question creation / modification
router.post('/api/questions', authenticateToken, requireAdmin, quizController.createQuestion);
router.put('/api/questions/:id', authenticateToken, requireAdmin, quizController.updateQuestion);
router.delete('/api/questions/:id', authenticateToken, requireAdmin, quizController.deleteQuestion);

// Quiz attempt routes: optionalAuth verifies JWT if supplied, ensuring authenticated userId is safely extracted
router.post('/api/quiz/attempts', optionalAuth, quizController.submitAttempt);
router.get('/api/quiz/leaderboard', quizController.getLeaderboard);
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts);
router.get('/api/quiz/attempts/:id/details', optionalAuth, quizController.getAttemptDetails);

module.exports = router;
