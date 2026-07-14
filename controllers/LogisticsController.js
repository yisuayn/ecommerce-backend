const LogisticsService = require('../services/admin/LogisticsService');

class LogisticsController {
    // 运费模板列表
    async templateList(req, res) {
        try {
            const { name, type, status } = req.query;
            const list = await LogisticsService.templateList({ name, type, status });
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 保存运费模板
    async templateSave(req, res) {
        try {
            const result = await LogisticsService.templateSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 删除运费模板
    async templateDelete(req, res) {
        try {
            await LogisticsService.templateDelete(req.params.id);
            res.json({ code: 200, message: '删除成功' });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 物流公司列表
    async companyList(req, res) {
        try {
            const { name, status } = req.query;
            const list = await LogisticsService.companyList({ name, status });
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 保存物流公司
    async companySave(req, res) {
        try {
            const result = await LogisticsService.companySave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 物流追踪
    async tracking(req, res) {
        try {
            const result = await LogisticsService.tracking(req.params.trackingNo);
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new LogisticsController();
