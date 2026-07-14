const ReviewService = require('../services/ReviewService');

class ReviewAdminController {
    // 评价列表（后台）
    async list(req, res) {
        try {
            const { page = 1, pageSize = 15, productName, member, rating, status } = req.query;
            const result = await ReviewService.getAllReviews({ page, pageSize, keyword: member || productName, rating, status });
            // 转换为前端需要的格式
            const list = (result.list || []).map(item => ({
                id: item.id,
                productName: item.product?.productName || item.productName,
                productImage: item.product?.mainImage || '',
                member: item.userName,
                rating: item.rating,
                content: item.content,
                imagesCount: item.images ? (Array.isArray(item.images) ? item.images.length : 0) : 0,
                images: typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []),
                createTime: item.createTime,
                status: item.status,
                reply: item.reply
            }));
            res.json({ code: 200, message: '操作成功', data: { list, total: result.total } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 审核评价
    async audit(req, res) {
        try {
            const { id, action } = req.body;
            const status = action === 'approve' ? 'approved' : 'blocked';
            const updatedCount = await ReviewService.batchUpdateStatus([id], status);
            res.json({ code: 200, message: '审核成功', data: { updatedCount } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 回复评价
    async reply(req, res) {
        try {
            const { id, reply: replyContent } = req.body;
            const review = await ReviewService.replyReview(id, replyContent, '商家客服');
            res.json({ code: 200, message: '回复成功', data: review });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 删除评价
    async delete(req, res) {
        try {
            const id = req.params.id;
            await ReviewService.batchDeleteReviews([id]);
            res.json({ code: 200, message: '删除成功' });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new ReviewAdminController();
