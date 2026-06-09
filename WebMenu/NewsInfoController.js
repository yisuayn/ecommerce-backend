// NewsInfoController.js
const NewsService = require('../services/NewsInfoService.js');

class NewsInfoController {
    // 获取资讯列表（支持分页、筛选）
    async getNewsList(req, res) {
        try {
            const {
                page = 1,
                pageSize = 10,
                type,
                keyword,
                status = 1
            } = req.query;
            
            const result = await NewsService.getNewsList({
                page,
                pageSize,
                type,
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
    
    // 获取分组新闻（首页用）
    async getGroupedNews(req, res) {
        try {
            const { hotLimit = 5, noticeLimit = 5, promotionLimit = 5 } = req.query;
            
            const groupedNews = await NewsService.getGroupedNews(
                hotLimit, noticeLimit, promotionLimit
            );
            
            res.json({
                code: 200,
                data: groupedNews,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // 获取单条新闻详情
    async getNewsById(req, res) {
        try {
            const { id } = req.params;
            const news = await NewsService.getNewsById(id);
            
            res.json({
                code: 200,
                data: news,
                message: 'success'
            });
        } catch (error) {
            if (error.message === '新闻不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 创建新闻
    async createNews(req, res) {
        try {
            const news = await NewsService.createNews(req.body);
            
            res.json({
                code: 200,
                data: news,
                message: '创建成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
    
    // 更新新闻
    async updateNews(req, res) {
        try {
            const { id } = req.params;
            const news = await NewsService.updateNews(id, req.body);
            
            res.json({
                code: 200,
                data: news,
                message: '更新成功'
            });
        } catch (error) {
            if (error.message === '新闻不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 删除新闻
    async deleteNews(req, res) {
        try {
            const { id } = req.params;
            await NewsService.softDeleteNews(id);
            
            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (error) {
            if (error.message === '新闻不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }
    
    // 批量删除
    async batchDeleteNews(req, res) {
        try {
            const { ids } = req.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要删除的ID列表'
                });
            }
            
            const deletedCount = await NewsService.batchDeleteNews(ids);
            
            res.json({
                code: 200,
                data: { deletedCount },
                message: `成功删除 ${deletedCount} 条新闻`
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
            
            const updatedCount = await NewsService.batchUpdateStatus(ids, status);
            
            res.json({
                code: 200,
                data: { updatedCount },
                message: `成功更新 ${updatedCount} 条新闻状态`
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
            const stats = await NewsService.getStatistics();
            
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

module.exports = new NewsInfoController();