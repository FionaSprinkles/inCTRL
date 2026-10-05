const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/api/users', userController.getUsers);
router.get('/api/users/:id', userController.getUser);
router.post('/api/users/register', userController.register);
router.post('/api/users/login', userController.login);
router.put('/api/users/:id', userController.updateProfile);
router.delete('/api/users/:id', userController.deleteUser);

module.exports = router;
