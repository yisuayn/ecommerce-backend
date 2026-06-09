const { Op } = require('sequelize');
const db = require('../module/ProductModule/index');

class BrandService {

    // ========== 前端查询方法 ==========

    // 获取所有启用的品牌
    async getAllBrands() {
        try {
            const brands = await db.ProductBrand.findAll({
                where: { status: 1 },
                order: [['sortOrder', 'ASC'], ['id', 'ASC']]
            });
            return brands;
        } catch (error) {
            throw new Error(`获取品牌列表失败: ${error.message}`);
        }
    }

    // 获取热门品牌（有最多产品的品牌）
    async getHotBrands(limit = 10) {
        try {
            const brands = await db.ProductBrand.findAll({
                where: { status: 1 },
                include: [{
                    model: db.Product,
                    as: 'products',
                    where: { status: 1 },
                    required: false,
                    attributes: []
                }],
                attributes: {
                    include: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('products.id')), 'productCount']
                    ]
                },
                group: ['ProductBrand.id'],
                order: [[db.sequelize.literal('productCount'), 'DESC']],
                limit: parseInt(limit)
            });
            return brands;
        } catch (error) {
            throw new Error(`获取热门品牌失败: ${error.message}`);
        }
    }

    // 获取品牌详情（包含该品牌下的产品）
    async getBrandDetail(id, productParams = {}) {
        try {
            const {
                page = 1,
                pageSize = 20,
                minPrice = null,
                maxPrice = null,
                sortBy = 'soldCount',
                sortOrder = 'DESC'
            } = productParams;

            const offset = (page - 1) * pageSize;
            const productWhere = { status: 1 };

            if (minPrice !== null || maxPrice !== null) {
                productWhere.price = {};
                if (minPrice !== null) productWhere.price[Op.gte] = minPrice;
                if (maxPrice !== null) productWhere.price[Op.lte] = maxPrice;
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
                default:
                    order.push(['soldCount', 'DESC']);
            }

            const brand = await db.ProductBrand.findByPk(id, {
                where: { status: 1 },
                include: [{
                    model: db.Product,
                    as: 'products',
                    where: productWhere,
                    required: false,
                    separate: true,
                    limit: parseInt(pageSize),
                    offset,
                    order
                }]
            });

            if (!brand) {
                throw new Error('品牌不存在');
            }

            // 获取产品总数
            const productCount = await db.Product.count({
                where: { brandId: id, status: 1, ...productWhere }
            });

            return {
                brand,
                products: brand.products || [],
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: productCount,
                    totalPages: Math.ceil(productCount / pageSize)
                }
            };
        } catch (error) {
            throw new Error(`获取品牌详情失败: ${error.message}`);
        }
    }

    // ========== 后台管理方法 ==========

    // 获取所有品牌（管理后台）
    async getAllBrandsAdmin(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 20,
                keyword = null,
                status = null
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {};

            if (keyword) {
                where[Op.or] = [
                    { brandName: { [Op.like]: `%${keyword}%` } },
                    { brandNameEn: { [Op.like]: `%${keyword}%` } }
                ];
            }

            if (status !== null && status !== '') {
                where.status = parseInt(status);
            }

            const { count, rows } = await db.ProductBrand.findAndCountAll({
                where,
                include: [{
                    model: db.Product,
                    as: 'products',
                    attributes: ['id'],
                    required: false
                }],
                attributes: {
                    include: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('products.id')), 'productCount']
                    ]
                },
                group: ['ProductBrand.id'],
                order: [['sortOrder', 'ASC'], ['id', 'DESC']],
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
            throw new Error(`查询品牌列表失败: ${error.message}`);
        }
    }

    // 创建品牌
    async createBrand(data) {
        try {
            // 检查品牌名是否已存在
            const existing = await db.ProductBrand.findOne({
                where: { brandName: data.brandName }
            });
            if (existing) {
                throw new Error('品牌名称已存在');
            }

            const brand = await db.ProductBrand.create(data);
            return brand;
        } catch (error) {
            throw new Error(`创建品牌失败: ${error.message}`);
        }
    }

    // 更新品牌
    async updateBrand(id, updateData) {
        try {
            const brand = await db.ProductBrand.findByPk(id);
            if (!brand) {
                throw new Error('品牌不存在');
            }

            // 如果更新品牌名，检查是否重复
            if (updateData.brandName && updateData.brandName !== brand.brandName) {
                const existing = await db.ProductBrand.findOne({
                    where: { brandName: updateData.brandName }
                });
                if (existing) {
                    throw new Error('品牌名称已存在');
                }
            }

            await brand.update(updateData);
            return brand;
        } catch (error) {
            throw new Error(`更新品牌失败: ${error.message}`);
        }
    }

    // 删除品牌
    async deleteBrand(id) {
        try {
            const brand = await db.ProductBrand.findByPk(id);
            if (!brand) {
                throw new Error('品牌不存在');
            }

            // 检查是否有产品使用该品牌
            const productCount = await db.Product.count({
                where: { brandId: id, status: 1 }
            });

            if (productCount > 0) {
                throw new Error('该品牌下还有产品，无法删除');
            }

            await brand.destroy();
            return true;
        } catch (error) {
            throw new Error(`删除品牌失败: ${error.message}`);
        }
    }

    // 批量删除品牌
    async batchDeleteBrands(ids) {
        try {
            // 检查是否有产品使用这些品牌
            const productCount = await db.Product.count({
                where: { brandId: { [Op.in]: ids }, status: 1 }
            });

            if (productCount > 0) {
                throw new Error('部分品牌下还有产品，无法删除');
            }

            const deletedCount = await db.ProductBrand.destroy({
                where: { id: { [Op.in]: ids } }
            });
            return deletedCount;
        } catch (error) {
            throw new Error(`批量删除失败: ${error.message}`);
        }
    }

    // 获取统计数据
    async getStatistics() {
        try {
            const total = await db.ProductBrand.count();
            const activeCount = await db.ProductBrand.count({ where: { status: 1 } });

            // 获取品牌下的产品数量分布
            const brandsWithProductCount = await db.ProductBrand.findAll({
                where: { status: 1 },
                include: [{
                    model: db.Product,
                    as: 'products',
                    where: { status: 1 },
                    required: false,
                    attributes: []
                }],
                attributes: [
                    'id',
                    'brandName',
                    [db.sequelize.fn('COUNT', db.sequelize.col('products.id')), 'productCount']
                ],
                group: ['ProductBrand.id'],
                order: [[db.sequelize.literal('productCount'), 'DESC']]
            });

            return {
                total,
                activeCount,
                inactiveCount: total - activeCount,
                brandDistribution: brandsWithProductCount
            };
        } catch (error) {
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
    }
}

module.exports = new BrandService();