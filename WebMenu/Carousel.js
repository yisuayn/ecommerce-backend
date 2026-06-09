const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carousel = sequelize.define('Carousel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    buttonText: {
        type: DataTypes.STRING(50),
        field: 'button_text',
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        field: 'image_url',
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    linkUrl: {
        type: DataTypes.STRING(500),
        field: 'link_url',
        allowNull: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        field: 'sort_order',
        defaultValue: 0
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]]
        }
    },
    target: {
        type: DataTypes.STRING(20),
        defaultValue: '_blank',
        validate: {
            isIn: [['_blank', '_self']]
        }
    },
    backgroundColor: {
        type: DataTypes.STRING(20),
        field: 'background_color',
        allowNull: true
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
    updateTime: {
        type: DataTypes.DATE,
        field: 'update_time',
        defaultValue: DataTypes.NOW,
        get() {
            const date = this.getDataValue('updateTime');
            if (date) {
                return date.toLocaleString('zh-CN', { hour12: false });
            }
            return null;
        }
    },
    createBy: {
        type: DataTypes.STRING(50),
        field: 'create_by',
        allowNull: true
    },
    updateBy: {
        type: DataTypes.STRING(50),
        field: 'update_by',
        allowNull: true
    }
}, {
    tableName: 'carousel',
    timestamps: false,
    hooks: {
        beforeUpdate: (carousel) => {
            carousel.updateTime = new Date();
        }
    }
});

module.exports = Carousel;