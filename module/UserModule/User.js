const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'Id'
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'Username',
        validate: {
            len: [2, 50],
            is: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'Email',
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'Phone',
        validate: {
            is: /^1[3-9]\d{9}$/
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Password'
    },
    avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'Avatar'
    },
    nickname: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'Nickname'
    },
    gender: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        field: 'Gender'
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'Birthday'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        field: 'Status'
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'IsDeleted'
    },
    lastLoginTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'LastLoginTime',
        defaultValue: sequelize.literal('GETDATE()')  // 添加默认值
    },
    lastLoginIP: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'LastLoginIP'
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'user',
        field: 'Role'
    },
}, {
    tableName: 'Users',
    timestamps: false,
    freezeTableName: true,
    defaultScope: {
        attributes: { exclude: ['password'] },
        where: { isDeleted: false }
    },
    scopes: {
        withPassword: {
            attributes: {}
        }
    }
});

// 通过账号查找（用户名/邮箱/手机号）
User.findByAccount = async function (account) {
    return await this.findOne({
        where: {
            [Op.or]: [
                { username: account },
                { email: account },
                { phone: account }
            ],
            isDeleted: false
        }
    });
};

// 检查用户是否存在
User.exists = async function ({ username, email, phone }) {
    const conditions = [];
    if (username) conditions.push({ username });
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length === 0) return false;

    const count = await this.count({
        where: {
            [Op.or]: conditions,
            isDeleted: false
        }
    });
    return count > 0;
};

// 更新最后登录信息
User.updateLastLogin = async function (id, ip) {
    return await this.update(
        { lastLoginTime: sequelize.literal('GETDATE()'), lastLoginIP: ip },
        { where: { id } }
    );
};

module.exports = User;