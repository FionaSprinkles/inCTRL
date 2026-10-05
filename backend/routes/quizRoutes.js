const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Question routes
router.get('/api/questions', quizController.getQuestions);
router.get('/api/questions/:id', quizController.getQuestion);
router.post('/api/questions', quizController.createQuestion);
router.put('/api/questions/:id', quizController.updateQuestion);
router.delete('/api/questions/:id', quizController.deleteQuestion);

// Quiz attempt & Leaderboard routes
router.post('/api/quiz/attempts', quizController.submitAttempt);
router.get('/api/quiz/leaderboard', quizController.getLeaderboard);
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts);

module.exports = router;
