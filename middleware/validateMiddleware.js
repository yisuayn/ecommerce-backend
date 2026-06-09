const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '参数验证失败',
            errors: errors.array()
        });
    }
    next();
};

// 注册验证规则
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('用户名长度为2-50位')
        .matches(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/)
        .withMessage('用户名只能包含字母、数字或中文'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('邮箱格式不正确')
        .normalizeEmail(),
    body('phone')
        .trim()
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('手机号格式不正确'),
    body('password')
        .isLength({ min: 6, max: 20 })
        .withMessage('密码长度为6-20位')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
        .withMessage('密码必须包含字母和数字'),
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('两次输入密码不一致'),
    handleValidationErrors
];

// 登录验证规则
const loginValidation = [
    body('account').trim().notEmpty().withMessage('请输入账号'),
    body('password').notEmpty().withMessage('请输入密码'),
    handleValidationErrors
];

module.exports = { registerValidation, loginValidation };