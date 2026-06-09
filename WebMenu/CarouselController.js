const CarouselService = require('../services/CarouselService');

class CarouselController {
    
    // ========== 前端接口 ==========
    
    // 获取启用的轮播图（前端展示）
    async getActiveCarousels(req, res) {
        try {
            const carousels = await CarouselService.getActiveCarousels();
            res.json({
                code: 200,
                data: carousels,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // ========== 后台管理接口 ==========
    
    // 获取列表（分页）
    async getList(req, res) {
        try {
            const { page, pageSize, keyword, status } = req.query;
            const result = await CarouselService.getAllCarousels({
                page,
                pageSize,
                keyword,
                status
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
    
    // 获取详情
    async getDetail(req, res) {
        try {
            const { id } = req.params;
            const carousel = await CarouselService.getCarouselById(id);
            res.json({
                code: 200,
                data: carousel,
                message: 'success'
            });
        } catch (error) {
            if (error.message === '轮播图不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 创建
    async create(req, res) {
        try {
            const carousel = await CarouselService.createCarousel(req.body);
            res.json({
                code: 200,
                data: carousel,
                message: '创建成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // 更新
    async update(req, res) {
        try {
            const { id } = req.params;
            const carousel = await CarouselService.updateCarousel(id, req.body);
            res.json({
                code: 200,
                data: carousel,
                message: '更新成功'
            });
        } catch (error) {
            if (error.message === '轮播图不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 删除
    async delete(req, res) {
        try {
            const { id } = req.params;
            await CarouselService.deleteCarousel(id);
            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (error) {
            if (error.message === '轮播图不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 批量删除
    async batchDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要删除的ID列表'
                });
            }
            const deletedCount = await CarouselService.batchDeleteCarousels(ids);
            res.json({
                code: 200,
                data: { deletedCount },
                message: `成功删除 ${deletedCount} 条数据`
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // 批量更新状态
    async batchUpdateStatus(req, res) {
        try {
            const { ids, status } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要更新的ID列表'
                });
            }
            const updatedCount = await CarouselService.batchUpdateStatus(ids, status);
            res.json({
                code: 200,
                data: { updatedCount },
                message: `成功更新 ${updatedCount} 条数据状态`
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // 批量更新排序
    async batchUpdateSort(req, res) {
        try {
            const { sortList } = req.body;
            if (!sortList || !Array.isArray(sortList) || sortList.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供排序数据'
                });
            }
            const updatedCount = await CarouselService.batchUpdateSort(sortList);
            res.json({
                code: 200,
                data: { updatedCount },
                message: `成功更新 ${updatedCount} 条数据排序`
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
            const stats = await CarouselService.getStatistics();
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
    
    // 交换排序
    async swapSort(req, res) {
        try {
            const { id1, id2 } = req.body;
            await CarouselService.swapSortOrder(id1, id2);
            res.json({
                code: 200,
                message: '排序调整成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}

module.exports = new CarouselController();