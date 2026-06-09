const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const News = sequelize.define('News', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['hot', 'notice', 'promotion']]
        }
    },
    tag: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    tagType: {
        type: DataTypes.STRING(20),
        field: 'tag_type',
        allowNull: false,
        validate: {
            isIn: [['hot', 'notice', 'promotion']]
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            len: [1, 200]
        }
    },
    link: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    createTime: {
        type: DataTypes.DATE,
        field: 'create_time',
        defaultValue: DataTypes.NOW,
        get() {
            const date = this.getDataValue('createTime');
            if (date) {
                return date.toLocaleString('zh-CN', { hour12: false });
            }
            return null;
        }
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        field: 'sort_order',
        defaultValue: 0
    },
    viewCount: {
        type: DataTypes.INTEGER,
        field: 'view_count',
        defaultValue: 0
    },
    updateTime: {
        type: DataTypes.DATE,
        field: 'update_time',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'news',
    timestamps: false,
    hooks: {
        beforeUpdate: (news) => {
            news.updateTime = new Date();
        }
    }
});

module.exports = News;