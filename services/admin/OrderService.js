const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class OrderService {
    async list({ page = 1, pageSize = 15, orderNo, productName, buyerName, status, payMethod, startTime, endTime }) {
        // 返回模拟或真实数据 - 需要 order 表就绪
        try {
            const Order = db.sequelize?.models?.Order;
            if (!Order) {
                return { list: [], total: 0, page, pageSize };
            }
            const where = {};
            if (orderNo) where.order_no = { [Op.like]: `%${orderNo}%` };
            if (buyerName) where.buyer_name = { [Op.like]: `%${buyerName}%` };
            if (status) where.status = status;
            if (payMethod) where.pay_method = payMethod;
            if (startTime && endTime) {
                where.create_time = { [Op.between]: [new Date(startTime), new Date(endTime)] };
            }
            const { count, rows } = await Order.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']]
            });
            return { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async ship({ orderNo, logisticsCompany, trackingNo, remark }) {
        const Order = db.sequelize?.models?.Order;
        if (!Order) throw new Error('订单模块暂不可用');
        const order = await Order.findOne({ where: { order_no: orderNo } });
        if (!order) throw new Error('订单不存在');
        await order.update({
            logistics_company: logisticsCompany,
            tracking_no: trackingNo,
            status: 'delivering',
            ship_time: new Date()
        });
        return { orderNo, logisticsCompany, trackingNo, remark };
    }

    async afterSaleList({ page = 1, pageSize = 15, afterSaleNo, orderNo, buyerName, type, status, startTime, endTime }) {
        try {
            const AfterSale = db.sequelize?.models?.AfterSale;
            if (!AfterSale) return { list: [], total: 0, page, pageSize };
            const where = {};
            if (afterSaleNo) where.after_sale_no = { [Op.like]: `%${afterSaleNo}%` };
            if (orderNo) where.order_no = { [Op.like]: `%${orderNo}%` };
            if (type) where.type = type;
            if (status) where.status = status;
            const { count, rows } = await AfterSale.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']]
            });
            return { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async afterSaleAudit({ afterSaleNo, action, remark }) {
        const AfterSale = db.sequelize?.models?.AfterSale;
        if (!AfterSale) throw new Error('售后模块暂不可用');
        const record = await AfterSale.findOne({ where: { after_sale_no: afterSaleNo } });
        if (!record) throw new Error('售后单不存在');
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await record.update({ status: newStatus, audit_remark: remark || '', audit_time: new Date() });
        return { afterSaleNo, status: newStatus, remark };
    }

    async exceptionList({ page = 1, pageSize = 15, type, level, status, startTime, endTime }) {
        return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
    }

    async exceptionHandle({ id, method, remark }) {
        return { id, method, remark, status: 'resolved' };
    }
}

module.exports = new OrderService();
