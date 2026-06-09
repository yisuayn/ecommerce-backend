const express = require('express');
const router = express.Router();
const authController = require('../WebMenu/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validateMiddleware');

// 公开路由
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authController.logout);

// 需要登录的路由
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;