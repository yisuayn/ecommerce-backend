const CmsService = require('../services/admin/CmsService');

class CmsController {
    async bannerList(req, res) {
        try {
            const list = await CmsService.bannerList();
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async bannerSave(req, res) {
        try {
            const result = await CmsService.bannerSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async bannerDelete(req, res) {
        try {
            await CmsService.bannerDelete(req.params.id);
            res.json({ code: 200, message: '删除成功' });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async articleList(req, res) {
        try {
            const { page = 1, pageSize = 15, keyword, category } = req.query;
            const result = await CmsService.articleList({ page, pageSize, keyword, category });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async articleSave(req, res) {
        try {
            const result = await CmsService.articleSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async articleDelete(req, res) {
        try {
            await CmsService.articleDelete(req.params.id);
            res.json({ code: 200, message: '删除成功' });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new CmsController();
