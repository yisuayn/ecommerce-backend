const MarketingService = require('../services/admin/MarketingService');

class MarketingController {
    async couponList(req, res) {
        try {
            const { page = 1, pageSize = 15, name, type, sendType, status } = req.query;
            const result = await MarketingService.couponList({ page, pageSize, name, type, sendType, status });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async couponSave(req, res) {
        try {
            const result = await MarketingService.couponSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async couponSend(req, res) {
        try {
            const result = await MarketingService.couponSend(req.body);
            res.json({ code: 200, message: '发放成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async seckillList(req, res) {
        try {
            const result = await MarketingService.seckillList();
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async seckillSave(req, res) {
        try {
            const result = await MarketingService.seckillSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new MarketingController();
