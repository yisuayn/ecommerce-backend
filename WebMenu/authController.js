const User = require('../module/UserModule/User');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../utils/jwt');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');  // 添加这个

// 注册
async function register(req, res) {
    let transaction;  // 在外部声明
    try {
        const { username, email, phone, password } = req.body;

        // 开启事务
        transaction = await sequelize.transaction();

        // 检查用户是否已存在（在事务中查询）
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email },
                    { phone: phone }
                ]
            },
            transaction: transaction
        });

        if (existingUser) {
            await transaction.rollback();  // ⚠️ 关键：先回滚再返回
            return res.status(400).json({
                success: false,
                message: '用户名、邮箱或手机号已被注册'
            });
        }

        // 加密密码并创建用户
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            email,
            phone,
            password: hashedPassword,
            nickname: username
        }, { transaction }); // 禁用自动设置 createdAt/updatedAt });

        await transaction.commit();

        // 返回用户信息（不包含密码）
        const userData = user.toJSON();
        delete userData.password;

        res.status(201).json({
            success: true,
            message: '注册成功',
            data: userData
        });

    } catch (error) {
        // 只有在事务存在且未结束时才回滚
        if (transaction && transaction.finished !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('事务回滚失败:', rollbackError);
            }
        }

        // 详细错误日志
        console.error('注册错误详情:', error);

        // 打印 AggregateError 内部错误
        if (error.parent && error.parent.errors) {
            console.error('聚合错误详情:');
            error.parent.errors.forEach((e, i) => {
                console.error(`  ${i + 1}:`, e.message);
            });
        }

        // 打印原始数据库错误
        if (error.original) {
            console.error('原始数据库错误:', error.original);
        }

        // 根据错误类型返回友好提示
        let errorMessage = '注册失败，请稍后重试';
        if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessage = '用户名、邮箱或手机号已被注册';
        } else if (error.message && error.message.includes('Role')) {
            errorMessage = '系统错误：数据库缺少 Role 字段';
        }

        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
}

// 登录
async function login(req, res) {
    try {
        const { account, password } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 查找用户（包含密码）
        const user = await User.scope('withPassword').findByAccount(account);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '账号或密码错误'
            });
        }

        // 检查账号状态
        if (user.status !== 1) {
            return res.status(403).json({
                success: false,
                message: '账号已被禁用，请联系客服'
            });
        }

        // 验证密码
        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '账号或密码错误'
            });
        }

        // 更新最后登录信息
        await User.updateLastLogin(user.id, ip);

        // 生成 token
        const token = generateToken(user.id, user.username);

        // 返回用户信息
        const userInfo = user.toJSON();
        delete userInfo.password;

        res.json({
            success: true,
            message: '登录成功',
            data: { token, userInfo }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
}

// 获取当前用户信息
async function getCurrentUser(req, res) {
    res.json({ success: true, data: req.user });
}

// 登出
async function logout(req, res) {
    res.json({ success: true, message: '已退出登录' });
}

module.exports = { register, login, getCurrentUser, logout };