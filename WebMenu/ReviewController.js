const ReviewService = require('../services/ReviewService');

class ReviewController {

    // ========== 前端接口 ==========

    // 获取产品的评价列表
    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const { page, pageSize, rating, hasImages } = req.query;
            const result = await ReviewService.getProductReviews(productId, {
                page, pageSize, rating, hasImages
            });
            res.json({
                code: 200,
                data: result,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取评价详情
    async getReviewDetail(req, res) {
        try {
            const { id } = req.params;
            const review = await ReviewService.getReviewById(id);
            res.json({
                code: 200,
                data: review,
                message: 'success'
            });
        } catch (error) {
            if (error.message === '评价不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 创建评价
    async createReview(req, res) {
        try {
            // 假设从登录信息获取 userId 和 userName
            const userId = req.user?.id || 1;
            const userName = req.user?.name || '匿名用户';

            const review = await ReviewService.createReview({
                ...req.body,
                userId,
                userName
            });
            res.json({
                code: 200,
                data: review,
                message: '评价成功'
            });
        } catch (error) {
            if (error.message === '您已经评价过该产品') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 点赞评价
    async likeReview(req, res) {
        try {
            const { id } = req.params;
            const review = await ReviewService.likeReview(id);
            res.json({
                code: 200,
                data: review,
                message: '点赞成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // ========== 商家回复 ==========

    // 商家回复评价
    async replyReview(req, res) {
        try {
            const { id } = req.params;
            const { reply } = req.body;
            const adminName = req.user?.name || '商家客服';

            const review = await ReviewService.replyReview(id, reply, adminName);
            res.json({
                code: 200,
                data: review,
                message: '回复成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // ========== 后台管理接口 ==========

    // 获取所有评价（管理后台）
    async getAllReviews(req, res) {
        try {
            const { page, pageSize, productId, rating, hasReply, keyword, status } = req.query;
            const result = await ReviewService.getAllReviews({
                page, pageSize, productId, rating, hasReply, keyword, status
            });
            res.json({
                code: 200,
                data: result,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 批量审核评价
    async batchUpdateStatus(req, res) {
        try {
            const { ids, status } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要更新的ID列表'
                });
            }
            const updatedCount = await ReviewService.batchUpdateStatus(ids, status);
            res.json({
                code: 200,
                data: { updatedCount },
                message: `成功更新 ${updatedCount} 条评价状态`
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 批量删除评价
    async batchDeleteReviews(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要删除的ID列表'
                });
            }
            const deletedCount = await ReviewService.batchDeleteReviews(ids);
            res.json({
                code: 200,
                data: { deletedCount },
                message: `成功删除 ${deletedCount} 条评价`
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取统计数据
    async getStatistics(req, res) {
        try {
            const stats = await ReviewService.getStatistics();
            res.json({
                code: 200,
                data: stats,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}

module.exports = new ReviewController();