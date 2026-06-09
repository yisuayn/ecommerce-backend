const { verifyToken } = require('../utils/jwt');
const User = require('../module/UserModule/User');

async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供认证令牌'
            });
        }
        
        const { valid, decoded, error } = verifyToken(token);
        
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: error === 'jwt expired' ? '登录已过期，请重新登录' : '无效的认证令牌'
            });
        }
        
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        if (user.status !== 1) {
            return res.status(403).json({
                success: false,
                message: '账号已被禁用'
            });
        }
        
        req.user = user.toJSON();
        next();
    } catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
}

module.exports = { authMiddleware };