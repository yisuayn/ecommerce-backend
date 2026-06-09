const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ProductBrand = sequelize.define('ProductBrand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    brandName: {
        type: DataTypes.STRING(100),
        field: 'brand_name',
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    brandNameEn: {
        type: DataTypes.STRING(100),
        field: 'brand_name_en'
    },
    logo: {
        type: DataTypes.STRING(500),
        validate: {
            isUrl: true
        }
    },
    website: {
        type: DataTypes.STRING(200),
        validate: {
            isUrl: true
        }
    },
    description: {
        type: DataTypes.STRING(500)
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
    createTime: {
        type: DataTypes.DATE,
        field: 'create_time',
        defaultValue: DataTypes.NOW,
        get() {
            const date = this.getDataValue('createTime');
            return date ? date.toLocaleString('zh-CN', { hour12: false }) : null;
        }
    },
    updateTime: {
        type: DataTypes.DATE,
        field: 'update_time',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'product_brand',
    timestamps: false,
    hooks: {
        beforeUpdate: (brand) => {
            brand.updateTime = new Date();
        }
    }
});

module.exports = ProductBrand;