const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'code'
    },
    parent_code: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'parent_code'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'name'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'description'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'icon'
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'level'
    },
    path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'path'
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        field: 'is_active'
    },
    created_at: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'category',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

module.exports = Category;