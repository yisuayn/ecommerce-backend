const categoryService = require('../services/categoryService');

class CategoryController {
    // 获取树形数据
    async getTree(req, res) {
        try {
            const tree = await categoryService.getTree();
            res.json({
                code: 200,
                data: tree,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 创建分类
    async create(req, res) {
        try {
            await categoryService.create(req.body);
            const tree = await categoryService.getTree();
            res.json({
                code: 200,
                data: tree,
                message: '创建成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 更新分类
    async update(req, res) {
        try {
            const { code } = req.params;
            await categoryService.update(parseInt(code), req.body);
            const tree = await categoryService.getTree();
            res.json({
                code: 200,
                data: tree,
                message: '更新成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 删除分类
    async delete(req, res) {
        try {
            const { code } = req.params;
            await categoryService.delete(parseInt(code));
            const tree = await categoryService.getTree();
            res.json({
                code: 200,
                data: tree,
                message: '删除成功'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取单个分类
    async getByCode(req, res) {
        try {
            const { code } = req.params;
            const category = await categoryService.getByCode(parseInt(code));
            res.json({
                code: 200,
                data: category,
                message: 'success'
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取子孙分类
    async getDescendants(req, res) {
        try {
            const { code } = req.params;
            const descendants = await categoryService.getDescendants(parseInt(code));
            res.json({
                code: 200,
                data: descendants,
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

module.exports = new CategoryController();