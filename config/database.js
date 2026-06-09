const { Sequelize } = require('sequelize');
require('dotenv').config();

// SQL Server 配置
const sequelize = new Sequelize({
    dialect: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'category_db',
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
});

// 测试连接
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQL Server 数据库连接成功');
        return true;
    } catch (error) {
        console.error('❌ SQL Server 数据库连接失败:', error.message);
        return false;
    }
};

// 同步模型
const syncModels = async (options = { alter: false }) => {
    try {
        await sequelize.sync(options);
        console.log('✅ 数据库模型同步完成');
    } catch (error) {
        console.error('❌ 模型同步失败:', error.message);
        throw error;
    }
};

module.exports = { sequelize, testConnection };