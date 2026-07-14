const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const categoryRoutes = require('./routes/category');
const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/modules');  // 新增：模块路由（会员/订单/营销等）
const authController = require('./WebMenu/authController');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api', categoryRoutes);

// 认证路由（登录、注册）
app.use('/api/auth', authRoutes);

// 业务模块路由（会员/订单/营销/系统设置等）
app.use('/api', moduleRoutes);

// 适配前端：GET /userinfo（前端期望的路径，带 /api 前缀）
app.get('/api/userinfo', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'admin',
    permissions: ['dashboard:*', 'product:*', 'order:*', 'marketing:*', 'system:*']
  });
});

// 适配前端：POST /logout（带 /api 前缀）
app.post('/api/logout', authController.logout);

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '分类管理系统 API',
    endpoints: {
      '获取树形数据': 'GET /api/getBaseCategoryList',
      '创建分类': 'POST /api/category',
      '获取单个分类': 'GET /api/category/:code',
      '获取子孙分类': 'GET /api/category/:code/descendants',
      '更新分类': 'PUT /api/category/:code',
      '删除分类': 'DELETE /api/category/:code'
    }
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========== 404 处理 ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `接口 ${req.method} ${req.path} 不存在`
  });
});

// ========== 全局错误处理 ==========
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});


//  ========== 启动服务器 ==========
const startServer = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('数据库连接失败，请检查配置后重试');
    process.exit(1);
  }

  // 同步模型（开发环境可设置 alter: true）
  await sequelize.sync({ alter: false });
  console.log('模型同步完成');

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 服务器启动成功！`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🌲 树形数据: http://localhost:${PORT}/api/getBaseCategoryList\n`);
    console.log(`🔐 登录接口: http://localhost:${PORT}/api/auth/login`);
    console.log(`📝 注册接口: http://localhost:${PORT}/api/auth/register\n`);
  });
}

startServer();

module.exports = app;