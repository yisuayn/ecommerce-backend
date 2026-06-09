const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ProductReview = sequelize.define('ProductReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        field: 'product_id',
        allowNull: false,
        validate: {
            min: 1
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        field: 'user_id'
    },
    userName: {
        type: DataTypes.STRING(50),
        field: 'user_name',
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    },
    userAvatar: {
        type: DataTypes.STRING(500),
        field: 'user_avatar',
        validate: {
            isUrl: true
        }
    },
    rating: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 1000]
        }
    },
    images: {
        type: DataTypes.TEXT,
        get() {
            const value = this.getDataValue('images');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    reply: {
        type: DataTypes.STRING(500)
    },
    replyTime: {
        type: DataTypes.DATE,
        field: 'reply_time'
    },
    likeCount: {
        type: DataTypes.INTEGER,
        field: 'like_count',
        defaultValue: 0
    },
    isAnonymous: {
        type: DataTypes.TINYINT,
        field: 'is_anonymous',
        defaultValue: 0
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]]
        }
    },
    createTime: {
        type: DataTypes.DATE,
        field: 'create_time',
        defaultValue: DataTypes.NOW,
        get() {
            const date = this.getDataValue('createTime');
            return date ? date.toLocaleString('zh-CN', { hour12: false }) : null;
        }
    }
}, {
    tableName: 'product_review',
    timestamps: false
});

module.exports = ProductReview;