const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成 token
function generateToken(userId, username) {
    return jwt.sign(
        { userId, username, iat: Date.now() },
        SECRET,
        { expiresIn: EXPIRES_IN }
    );
}

// 验证 token
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

module.exports = { generateToken, verifyToken };