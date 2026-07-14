const OrderService = require('../services/admin/OrderService');

class OrderController {
    // 订单列表
    async list(req, res) {
        try {
            const { page = 1, pageSize = 15, orderNo, productName, buyerName, status, payMethod, startTime, endTime } = req.query;
            const result = await OrderService.list({ page, pageSize, orderNo, productName, buyerName, status, payMethod, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 订单发货
    async ship(req, res) {
        try {
            const result = await OrderService.ship(req.body);
            res.json({ code: 200, message: '发货成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 售后列表
    async afterSaleList(req, res) {
        try {
            const { page = 1, pageSize = 15, afterSaleNo, orderNo, buyerName, type, status, startTime, endTime } = req.query;
            const result = await OrderService.afterSaleList({ page, pageSize, afterSaleNo, orderNo, buyerName, type, status, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 审核售后
    async afterSaleAudit(req, res) {
        try {
            const result = await OrderService.afterSaleAudit(req.body);
            res.json({ code: 200, message: '审核成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 异常列表
    async exceptionList(req, res) {
        try {
            const { page = 1, pageSize = 15, type, level, status, startTime, endTime } = req.query;
            const result = await OrderService.exceptionList({ page, pageSize, type, level, status, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 处理异常
    async exceptionHandle(req, res) {
        try {
            const result = await OrderService.exceptionHandle(req.body);
            res.json({ code: 200, message: '处理成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new OrderController();
