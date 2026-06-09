const ProductService = require('../services/ProductService');

class ProductController {

    // ========== 前端接口 ==========

    // 获取首页产品
    async getHomeProducts(req, res) {
        try {
            const data = await ProductService.getHomeProducts();
            res.json({
                code: 200,
                data,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取秒杀产品
    async getSeckillProducts(req, res) {
        try {
            const data = await ProductService.getSeckillProducts();
            res.json({
                code: 200,
                data,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取产品列表
    async getProductList(req, res) {
        console.log('收到的请求参数:', req.query);
        console.log('keyword参数值:', req.query.keyword);
        try {
            const {
                page = 1,
                pageSize = 20,
                categoryId,
                brandId,
                keyword,
                minPrice,
                maxPrice,
                sortBy = 'soldCount',
                sortOrder = 'DESC'
            } = {...req.query};

            const result = await ProductService.getProductList({
                page,
                pageSize,
                categoryId,
                brandId,
                keyword,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder
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

    // 获取产品详情
    async getProductDetail(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductDetail(id);
            res.json({
                code: 200,
                data: product,
                message: 'success'
            });
        } catch (error) {
            if (error.message === '产品不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 根据SKU获取产品
    async getProductBySku(req, res) {
        try {
            const { skuCode } = req.params;
            const product = await ProductService.getProductBySku(skuCode);
            if (!product) {
                return res.status(404).json({ code: 404, message: '产品不存在' });
            }
            res.json({
                code: 200,
                data: product,
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

    // 获取所有产品（管理后台）
    async getAllProducts(req, res) {
        try {
            const {
                page = 1,
                pageSize = 20,
                categoryId,
                brandId,
                keyword,
                status,
                isHot,
                isNew,
                isRecommend
            } = req.query;

            const result = await ProductService.getAllProducts({
                page,
                pageSize,
                categoryId,
                brandId,
                keyword,
                status,
                isHot,
                isNew,
                isRecommend
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

    // 创建产品
    async createProduct(req, res) {
        try {
            const product = await ProductService.createProduct(req.body);
            res.json({
                code: 200,
                data: product,
                message: '创建成功'
            });
        } catch (error) {
            if (error.message === 'SKU编码已存在') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 更新产品
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.updateProduct(id, req.body);
            res.json({
                code: 200,
                data: product,
                message: '更新成功'
            });
        } catch (error) {
            if (error.message === '产品不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else if (error.message === 'SKU编码已存在') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 删除产品
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await ProductService.deleteProduct(id);
            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (error) {
            if (error.message === '产品不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 批量删除
    async batchDeleteProducts(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要删除的ID列表'
                });
            }
            const deletedCount = await ProductService.batchDeleteProducts(ids);
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
            const updatedCount = await ProductService.batchUpdateStatus(ids, status);
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

    // 更新库存
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            const product = await ProductService.updateStock(id, quantity);
            res.json({
                code: 200,
                data: product,
                message: '库存更新成功'
            });
        } catch (error) {
            if (error.message === '产品不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else if (error.message === '库存不足') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 获取统计数据
    async getStatistics(req, res) {
        try {
            const stats = await ProductService.getStatistics();
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

module.exports = new ProductController();