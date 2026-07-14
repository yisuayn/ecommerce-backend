const { Op } = require('sequelize');
const db = require('../module/ProductModule/index');

class ProductService {

    // ========== 前端查询方法 ==========

    // 获取首页推荐产品（热门、新品、推荐）
    async getHomeProducts() {
        try {
            const [hotProducts, newProducts, recommendProducts] = await Promise.all([
                db.Product.findAll({
                    where: { status: 1, isHot: 1 },
                    limit: 10,
                    order: [['soldCount', 'DESC']]
                }),
                db.Product.findAll({
                    where: { status: 1, isNew: 1 },
                    limit: 10,
                    order: [['createTime', 'DESC']]
                }),
                db.Product.findAll({
                    where: { status: 1, isRecommend: 1 },
                    limit: 10,
                    order: [['sortOrder', 'ASC']]
                })
            ]);

            return {
                hot: hotProducts,
                new: newProducts,
                recommend: recommendProducts
            };
        } catch (error) {
            throw new Error(`获取首页产品失败: ${error.message}`);
        }
    }

    // 获取秒杀产品
    async getSeckillProducts() {
        try {
            const now = new Date();
            const products = await db.Product.findAll({
                where: {
                    status: 1,
                    isSeckill: 1,
                    seckillStartTime: { [Op.lte]: now },
                    seckillEndTime: { [Op.gte]: now }
                },
                order: [['soldCount', 'DESC']],
                limit: 10
            });
            return products;
        } catch (error) {
            throw new Error(`获取秒杀产品失败: ${error.message}`);
        }
    }

    // 获取产品列表（分页、筛选、排序）
    async getProductList(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 20,
                categoryId = null,
                brandId = null,
                keyword = null,
                minPrice = null,
                maxPrice = null,
                sortBy = 'soldCount',  // price, soldCount, rating, createTime
                sortOrder = 'DESC',
                status = 1
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {};

            if (status !== undefined) where.status = status;
            if (categoryId) where.categoryId = categoryId;
            if (brandId) where.brandId = brandId;

            if (keyword) {
                where[Op.or] = [
                    { productName: { [Op.like]: `%${keyword}%` } },
                    { summary: { [Op.like]: `%${keyword}%` } },
                    { brandName: { [Op.like]: `%${keyword}%` }},
                    { categoryName: { [Op.like]: `%${keyword}%` } }
                ];
            }

            if (minPrice !== null || maxPrice !== null) {
                where.price = {};
                if (minPrice !== null) where.price[Op.gte] = minPrice;
                if (maxPrice !== null) where.price[Op.lte] = maxPrice;
            }

            const order = [];
            switch (sortBy) {
                case 'price':
                    order.push(['price', sortOrder]);
                    break;
                case 'soldCount':
                    order.push(['soldCount', sortOrder]);
                    break;
                case 'rating':
                    order.push(['rating', sortOrder]);
                    break;
                case 'createTime':
                    order.push(['createTime', sortOrder]);
                    break;
                default:
                    order.push(['soldCount', 'DESC']);
            }
            order.push(['id', 'DESC']);

            const { count, rows } = await db.Product.findAndCountAll({
                where,
                order,
                limit: parseInt(pageSize),
                offset
            });

            return {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize)
            };
        } catch (error) {
            throw new Error(`查询产品列表失败: ${error.message}`);
        }
    }

    // 获取产品详情
    async getProductDetail(id) {
        try {
            const product = await db.Product.findByPk(id, {
                include: [
                    { model: db.ProductBrand, as: 'brand' }
                ]
            });

            if (!product) {
                throw new Error('产品不存在');
            }

            // 增加浏览次数
            await product.increment('viewCount');

            return product;
        } catch (error) {
            throw new Error(`获取产品详情失败: ${error.message}`);
        }
    }

    // 根据SKU获取产品
    async getProductBySku(skuCode) {
        try {
            const product = await db.Product.findOne({
                where: { skuCode, status: 1 }
            });
            return product;
        } catch (error) {
            throw new Error(`根据SKU查询失败: ${error.message}`);
        }
    }

    // ========== 后台管理方法 ==========

    // 获取所有产品（管理后台）
    async getAllProducts(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 100,
                categoryId = null,
                brandId = null,
                keyword = null,
                status = null,
                isHot = null,
                isNew = null,
                isRecommend = null
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {};

            if (categoryId) where.categoryId = categoryId;
            if (brandId) where.brandId = brandId;
            if (status !== null && status !== '') where.status = parseInt(status);
            if (isHot !== null && isHot !== '') where.isHot = parseInt(isHot);
            if (isNew !== null && isNew !== '') where.isNew = parseInt(isNew);
            if (isRecommend !== null && isRecommend !== '') where.isRecommend = parseInt(isRecommend);

            if (keyword) {
                where[Op.or] = [
                    { productName: { [Op.like]: `%${keyword}%` } },
                    { skuCode: { [Op.like]: `%${keyword}%` } },
                    { brandName: { [Op.like]: `%${keyword}%` } }
                ];
            }

            const { count, rows } = await db.Product.findAndCountAll({
                where,
                order: [['createTime', 'DESC']],
                limit: parseInt(pageSize),
                offset
            });

            return {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize)
            };
        } catch (error) {
            throw new Error(`查询产品列表失败: ${error.message}`);
        }
    }

    // 创建产品
    async createProduct(data) {
        try {
            // 检查SKU是否已存在
            const existing = await db.Product.findOne({
                where: { skuCode: data.skuCode }
            });
            if (existing) {
                throw new Error('SKU编码已存在');
            }

            const product = await db.Product.create(data);
            return product;
        } catch (error) {
            throw new Error(`创建产品失败: ${error.message}`);
        }
    }

    // 更新产品
    async updateProduct(id, updateData) {
        try {
            const product = await db.Product.findByPk(id);
            if (!product) {
                throw new Error('产品不存在');
            }

            // 如果更新SKU，检查是否重复
            if (updateData.skuCode && updateData.skuCode !== product.skuCode) {
                const existing = await db.Product.findOne({
                    where: { skuCode: updateData.skuCode }
                });
                if (existing) {
                    throw new Error('SKU编码已存在');
                }
            }

            await product.update(updateData);
            return product;
        } catch (error) {
            throw new Error(`更新产品失败: ${error.message}`);
        }
    }

    // 删除产品（软删除）
    async deleteProduct(id) {
        try {
            const product = await db.Product.findByPk(id);
            if (!product) {
                throw new Error('产品不存在');
            }

            await product.update({ status: 0 });
            return true;
        } catch (error) {
            throw new Error(`删除产品失败: ${error.message}`);
        }
    }

    // 批量删除
    async batchDeleteProducts(ids) {
        try {
            const updatedCount = await db.Product.update(
                { status: 0 },
                { where: { id: { [Op.in]: ids } } }
            );
            return updatedCount[0];
        } catch (error) {
            throw new Error(`批量删除失败: ${error.message}`);
        }
    }

    // 批量更新状态
    async batchUpdateStatus(ids, status) {
        try {
            const [updatedCount] = await db.Product.update(
                { status, updateTime: new Date() },
                { where: { id: { [Op.in]: ids } } }
            );
            return updatedCount;
        } catch (error) {
            throw new Error(`批量更新状态失败: ${error.message}`);
        }
    }

    // 更新库存
    async updateStock(id, quantity) {
        try {
            const product = await db.Product.findByPk(id);
            if (!product) {
                throw new Error('产品不存在');
            }

            const newStock = product.stock + quantity;
            if (newStock < 0) {
                throw new Error('库存不足');
            }

            await product.update({ stock: newStock });
            return product;
        } catch (error) {
            throw new Error(`更新库存失败: ${error.message}`);
        }
    }

    // 获取统计数据
    async getStatistics() {
        try {
            const total = await db.Product.count();
            const activeCount = await db.Product.count({ where: { status: 1 } });
            const inactiveCount = await db.Product.count({ where: { status: 0 } });
            const hotCount = await db.Product.count({ where: { isHot: 1, status: 1 } });
            const newCount = await db.Product.count({ where: { isNew: 1, status: 1 } });

            const totalStock = await db.Product.sum('stock');
            const totalSold = await db.Product.sum('soldCount');

            // 按分类统计
            const categoryStats = await db.Product.findAll({
                attributes: [
                    'categoryName',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                where: { status: 1 },
                group: ['categoryName']
            });

            return {
                total,
                activeCount,
                inactiveCount,
                hotCount,
                newCount,
                totalStock,
                totalSold,
                categoryStats
            };
        } catch (error) {
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
    }
}

module.exports = new ProductService();