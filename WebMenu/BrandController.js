const BrandService = require('../services/BrandService');

class BrandController {

    // ========== 前端接口 ==========

    // 获取所有品牌
    async getAllBrands(req, res) {
        try {
            const brands = await BrandService.getAllBrands();
            res.json({
                code: 200,
                data: brands,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取热门品牌
    async getHotBrands(req, res) {
        try {
            const { limit = 10 } = req.query;
            const brands = await BrandService.getHotBrands(limit);
            res.json({
                code: 200,
                data: brands,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取品牌详情（包含产品）
    async getBrandDetail(req, res) {
        try {
            const { id } = req.params;
            const { page, pageSize, minPrice, maxPrice, sortBy, sortOrder } = req.query;
            const result = await BrandService.getBrandDetail(id, {
                page, pageSize, minPrice, maxPrice, sortBy, sortOrder
            });
            res.json({
                code: 200,
                data: result,
                message: 'success'
            });
        } catch (error) {
            if (error.message === '品牌不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // ========== 后台管理接口 ==========

    // 获取所有品牌（管理后台）
    async getAllBrandsAdmin(req, res) {
        try {
            const { page, pageSize, keyword, status } = req.query;
            const result = await BrandService.getAllBrandsAdmin({
                page, pageSize, keyword, status
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

    // 创建品牌
    async createBrand(req, res) {
        try {
            const brand = await BrandService.createBrand(req.body);
            res.json({
                code: 200,
                data: brand,
                message: '创建成功'
            });
        } catch (error) {
            if (error.message === '品牌名称已存在') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 更新品牌
    async updateBrand(req, res) {
        try {
            const { id } = req.params;
            const brand = await BrandService.updateBrand(id, req.body);
            res.json({
                code: 200,
                data: brand,
                message: '更新成功'
            });
        } catch (error) {
            if (error.message === '品牌不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else if (error.message === '品牌名称已存在') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 删除品牌
    async deleteBrand(req, res) {
        try {
            const { id } = req.params;
            await BrandService.deleteBrand(id);
            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (error) {
            if (error.message === '品牌不存在') {
                res.status(404).json({ code: 404, message: error.message });
            } else if (error.message === '该品牌下还有产品，无法删除') {
                res.status(400).json({ code: 400, message: error.message });
            } else {
                res.status(500).json({ code: 500, message: error.message });
            }
        }
    }

    // 批量删除
    async batchDeleteBrands(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供要删除的ID列表'
                });
            }
            const deletedCount = await BrandService.batchDeleteBrands(ids);
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

    // 获取统计数据
    async getStatistics(req, res) {
        try {
            const stats = await BrandService.getStatistics();
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

module.exports = new BrandController();