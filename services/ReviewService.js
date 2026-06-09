const { Op } = require('sequelize');
const db = require('../module/ProductModule/index');

class ReviewService {

    // ========== 前端查询方法 ==========

    // 获取产品的评价列表
    async getProductReviews(productId, params = {}) {
        try {
            const {
                page = 1,
                pageSize = 10,
                rating = null,      // 筛选评分：1-5
                hasImages = null    // 是否有图
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {
                productId,
                status: 1
            };

            if (rating) {
                where.rating = rating;
            }

            if (hasImages) {
                where.images = { [Op.ne]: null };
                where.images = { [Op.notLike]: '[]' };
            }

            const { count, rows } = await db.ProductReview.findAndCountAll({
                where,
                order: [['createTime', 'DESC']],
                limit: parseInt(pageSize),
                offset
            });

            // 获取评分统计
            const ratingStats = await db.ProductReview.findAll({
                where: { productId, status: 1 },
                attributes: [
                    'rating',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['rating']
            });

            const totalCount = await db.ProductReview.count({
                where: { productId, status: 1 }
            });

            const avgRating = await db.ProductReview.findOne({
                where: { productId, status: 1 },
                attributes: [
                    [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating']
                ]
            });

            return {
                list: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: count,
                    totalPages: Math.ceil(count / pageSize)
                },
                statistics: {
                    total: totalCount,
                    averageRating: parseFloat(avgRating?.dataValues?.avgRating || 0).toFixed(1),
                    ratingDistribution: ratingStats
                }
            };
        } catch (error) {
            throw new Error(`获取评价列表失败: ${error.message}`);
        }
    }

    // 获取评价详情
    async getReviewById(id) {
        try {
            const review = await db.ProductReview.findByPk(id, {
                include: [{
                    model: db.Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'mainImage']
                }]
            });

            if (!review) {
                throw new Error('评价不存在');
            }

            return review;
        } catch (error) {
            throw new Error(`获取评价详情失败: ${error.message}`);
        }
    }

    // ========== 用户操作 ==========

    // 创建评价
    async createReview(data) {
        try {
            // 检查用户是否已经评价过该产品（可选）
            const existing = await db.ProductReview.findOne({
                where: {
                    productId: data.productId,
                    userId: data.userId,
                    status: 1
                }
            });

            if (existing) {
                throw new Error('您已经评价过该产品');
            }

            const review = await db.ProductReview.create(data);

            // 更新产品的评分和评价数
            await this.updateProductRating(data.productId);

            return review;
        } catch (error) {
            throw new Error(`创建评价失败: ${error.message}`);
        }
    }

    // 更新评价
    async updateReview(id, updateData, userId) {
        try {
            const review = await db.ProductReview.findByPk(id);
            if (!review) {
                throw new Error('评价不存在');
            }

            // 检查是否是自己的评价
            if (review.userId !== userId) {
                throw new Error('只能修改自己的评价');
            }

            await review.update(updateData);

            // 如果评分有变化，更新产品评分
            if (updateData.rating) {
                await this.updateProductRating(review.productId);
            }

            return review;
        } catch (error) {
            throw new Error(`更新评价失败: ${error.message}`);
        }
    }

    // 删除评价
    async deleteReview(id, userId) {
        try {
            const review = await db.ProductReview.findByPk(id);
            if (!review) {
                throw new Error('评价不存在');
            }

            // 检查是否是自己的评价或管理员
            if (review.userId !== userId) {
                throw new Error('只能删除自己的评价');
            }

            await review.destroy();

            // 更新产品的评分和评价数
            await this.updateProductRating(review.productId);

            return true;
        } catch (error) {
            throw new Error(`删除评价失败: ${error.message}`);
        }
    }

    // 点赞评价
    async likeReview(id) {
        try {
            const review = await db.ProductReview.findByPk(id);
            if (!review) {
                throw new Error('评价不存在');
            }

            await review.increment('likeCount');
            return review;
        } catch (error) {
            throw new Error(`点赞失败: ${error.message}`);
        }
    }

    // ========== 商家回复 ==========

    // 商家回复评价
    async replyReview(id, reply, adminName) {
        try {
            const review = await db.ProductReview.findByPk(id);
            if (!review) {
                throw new Error('评价不存在');
            }

            await review.update({
                reply,
                replyTime: new Date()
            });

            return review;
        } catch (error) {
            throw new Error(`回复失败: ${error.message}`);
        }
    }

    // ========== 后台管理 ==========

    // 获取所有评价（管理后台）
    async getAllReviews(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 20,
                productId = null,
                rating = null,
                hasReply = null,
                keyword = null,
                status = null
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {};

            if (productId) where.productId = productId;
            if (rating) where.rating = rating;
            if (status !== null && status !== '') where.status = parseInt(status);

            if (hasReply === 'true') {
                where.reply = { [Op.ne]: null };
            } else if (hasReply === 'false') {
                where.reply = null;
            }

            if (keyword) {
                where[Op.or] = [
                    { content: { [Op.like]: `%${keyword}%` } },
                    { userName: { [Op.like]: `%${keyword}%` } }
                ];
            }

            const { count, rows } = await db.ProductReview.findAndCountAll({
                where,
                include: [{
                    model: db.Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'skuCode']
                }],
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
            throw new Error(`查询评价列表失败: ${error.message}`);
        }
    }

    // 批量审核评价
    async batchUpdateStatus(ids, status) {
        try {
            const [updatedCount] = await db.ProductReview.update(
                { status },
                { where: { id: { [Op.in]: ids } } }
            );
            return updatedCount;
        } catch (error) {
            throw new Error(`批量更新状态失败: ${error.message}`);
        }
    }

    // 批量删除评价
    async batchDeleteReviews(ids) {
        try {
            const reviews = await db.ProductReview.findAll({
                where: { id: { [Op.in]: ids } }
            });

            const deletedCount = await db.ProductReview.destroy({
                where: { id: { [Op.in]: ids } }
            });

            // 更新受影响产品的评分
            const productIds = [...new Set(reviews.map(r => r.productId))];
            for (const productId of productIds) {
                await this.updateProductRating(productId);
            }

            return deletedCount;
        } catch (error) {
            throw new Error(`批量删除失败: ${error.message}`);
        }
    }

    // 获取统计数据
    async getStatistics() {
        try {
            const total = await db.ProductReview.count();
            const averageRating = await db.ProductReview.findOne({
                attributes: [
                    [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating']
                ]
            });

            const ratingDistribution = await db.ProductReview.findAll({
                attributes: [
                    'rating',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['rating']
            });

            const pendingReply = await db.ProductReview.count({
                where: { reply: null, status: 1 }
            });

            const todayCount = await db.ProductReview.count({
                where: {
                    createTime: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                }
            });

            return {
                total,
                averageRating: parseFloat(averageRating?.dataValues?.avgRating || 0).toFixed(1),
                ratingDistribution,
                pendingReply,
                todayCount
            };
        } catch (error) {
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
    }

    // ========== 辅助方法 ==========

    // 更新产品的评分和评价数
    async updateProductRating(productId) {
        try {
            const result = await db.ProductReview.findOne({
                where: { productId, status: 1 },
                attributes: [
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'reviewCount'],
                    [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating']
                ]
            });

            const reviewCount = parseInt(result?.dataValues?.reviewCount || 0);
            const avgRating = parseFloat(result?.dataValues?.avgRating || 5).toFixed(2);

            await db.Product.update(
                {
                    ratingCount: reviewCount,
                    rating: avgRating
                },
                { where: { id: productId } }
            );
        } catch (error) {
            console.error('更新产品评分失败:', error);
        }
    }
}

module.exports = new ReviewService();