const { sequelize } = require('../../config/database');
const Product = require('./Product');
const ProductBrand = require('./ProductBrand');
const ProductReview = require('./ProductReview');

// ========== 建立模型关联 ==========

// 产品 ↔ 品牌（多对一）
// 一个产品属于一个品牌
Product.belongsTo(ProductBrand, {
    foreignKey: 'brandId',      // Product 表中的外键字段
    targetKey: 'id',            // ProductBrand 表的主键
    as: 'brand'                 // 查询时的别名：product.brand
});

// 一个品牌有多个产品（反向关联，很重要！）
ProductBrand.hasMany(Product, {
    foreignKey: 'brandId',      // Product 表中的外键字段
    as: 'products'              // 查询时的别名：brand.products
});

// 产品 ↔ 评价（一对多）
// 一个产品有多个评价
Product.hasMany(ProductReview, {
    foreignKey: 'productId',    // ProductReview 表中的外键字段
    as: 'reviews',              // 查询时的别名：product.reviews
    onDelete: 'CASCADE'         // 产品删除时，相关评价也删除
});

// 一个评价属于一个产品（反向关联）
ProductReview.belongsTo(Product, {
    foreignKey: 'productId',    // ProductReview 表中的外键字段
    as: 'product'               // 查询时的别名：review.product
});

// ========== 导出所有模型 ==========
const db = {
    sequelize,          // 数据库连接实例
    Product,            // 产品模型
    ProductBrand,       // 品牌模型
    ProductReview       // 评价模型
};

module.exports = db;