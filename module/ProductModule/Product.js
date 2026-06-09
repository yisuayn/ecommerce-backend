const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    skuCode: {
        type: DataTypes.STRING(50),
        field: 'sku_code',
        allowNull: false,
        unique: true
    },
    productName: {
        type: DataTypes.STRING(500),
        field: 'product_name',
        allowNull: false
    },
    productNameEn: {
        type: DataTypes.STRING(500),
        field: 'product_name_en'
    },
    categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_id',
        allowNull: false
    },
    categoryName: {
        type: DataTypes.STRING(100),
        field: 'category_name'
    },
    brandId: {
        type: DataTypes.INTEGER,
        field: 'brand_id'
    },
    brandName: {
        type: DataTypes.STRING(100),
        field: 'brand_name'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'original_price'
    },
    costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'cost_price'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    soldCount: {
        type: DataTypes.INTEGER,
        field: 'sold_count',
        defaultValue: 0
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 5.0
    },
    ratingCount: {
        type: DataTypes.INTEGER,
        field: 'rating_count',
        defaultValue: 0
    },
    mainImage: {
        type: DataTypes.STRING(500),
        field: 'main_image'
    },
    images: {
        type: DataTypes.TEXT,
        field: 'images',
        get() {
            const value = this.getDataValue('images');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    video: {
        type: DataTypes.STRING(500)
    },
    summary: {
        type: DataTypes.STRING(1000)
    },
    description: {
        type: DataTypes.TEXT
    },
    specifications: {
        type: DataTypes.TEXT,
        get() {
            const value = this.getDataValue('specifications');
            return value ? JSON.parse(value) : {};
        },
        set(value) {
            this.setDataValue('specifications', JSON.stringify(value));
        }
    },
    services: {
        type: DataTypes.STRING(500)
    },
    isHot: {
        type: DataTypes.TINYINT,
        field: 'is_hot',
        defaultValue: 0
    },
    isNew: {
        type: DataTypes.TINYINT,
        field: 'is_new',
        defaultValue: 0
    },
    isRecommend: {
        type: DataTypes.TINYINT,
        field: 'is_recommend',
        defaultValue: 0
    },
    isSeckill: {
        type: DataTypes.TINYINT,
        field: 'is_seckill',
        defaultValue: 0
    },
    seckillPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'seckill_price'
    },
    seckillStartTime: {
        type: DataTypes.DATE,
        field: 'seckill_start_time'
    },
    seckillEndTime: {
        type: DataTypes.DATE,
        field: 'seckill_end_time'
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
    },
    createBy: {
        type: DataTypes.STRING(50),
        field: 'create_by'
    },
    updateBy: {
        type: DataTypes.STRING(50),
        field: 'update_by'
    }
}, {
    tableName: 'product',
    timestamps: false,
    hooks: {
        beforeUpdate: (product) => {
            product.updateTime = new Date();
        }
    }
});

module.exports = Product;