const FinanceService = require('../services/admin/FinanceService');

class FinanceController {
    async transactionList(req, res) {
        try {
            const { page = 1, pageSize = 15, orderNo, paymentMethod, transactionType, startTime, endTime } = req.query;
            const result = await FinanceService.transactionList({ page, pageSize, orderNo, paymentMethod, transactionType, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async refundList(req, res) {
        try {
            const { page = 1, pageSize = 15, refundNo, orderNo, member, status } = req.query;
            const result = await FinanceService.refundList({ page, pageSize, refundNo, orderNo, member, status });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async refundAudit(req, res) {
        try {
            const result = await FinanceService.refundAudit(req.body);
            res.json({ code: 200, message: '审核成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new FinanceController();
