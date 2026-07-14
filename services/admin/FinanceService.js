const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class FinanceService {
    async transactionList({ page = 1, pageSize = 15, orderNo, paymentMethod, transactionType, startTime, endTime }) {
        try {
            const Transaction = db.sequelize?.models?.FinanceTransaction;
            if (!Transaction) return { stats: { todayAmount: 0, todayCount: 0, monthAmount: 0, monthCount: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };

            const where = {};
            if (orderNo) where.order_no = { [Op.like]: `%${orderNo}%` };
            if (paymentMethod) where.payment_method = paymentMethod;
            if (transactionType) where.transaction_type = transactionType;
            if (startTime && endTime) where.transaction_time = { [Op.between]: [new Date(startTime), new Date(endTime)] };

            const { count, rows } = await Transaction.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['transaction_time', 'DESC']]
            });

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const todayAmount = await Transaction.sum('amount', { where: { transaction_time: { [Op.gte]: todayStart }, status: 'success' } }) || 0;
            const todayCount = await Transaction.count({ where: { transaction_time: { [Op.gte]: todayStart } } });
            const monthAmount = await Transaction.sum('amount', { where: { transaction_time: { [Op.gte]: monthStart }, status: 'success' } }) || 0;
            const monthCount = await Transaction.count({ where: { transaction_time: { [Op.gte]: monthStart } } });

            return {
                stats: { todayAmount: Math.abs(todayAmount), todayCount, monthAmount: Math.abs(monthAmount), monthCount },
                list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize)
            };
        } catch (e) {
            return { stats: { todayAmount: 0, todayCount: 0, monthAmount: 0, monthCount: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async refundList({ page = 1, pageSize = 15, refundNo, orderNo, member, status }) {
        try {
            const Refund = db.sequelize?.models?.FinanceRefund;
            if (!Refund) return { stats: { pending: 0, approved: 0, completed: 0, rejected: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };

            const where = {};
            if (refundNo) where.refund_no = { [Op.like]: `%${refundNo}%` };
            if (orderNo) where.order_no = { [Op.like]: `%${orderNo}%` };
            if (status) where.status = status;

            const { count, rows } = await Refund.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['apply_time', 'DESC']]
            });

            const p = await Refund.count({ where: { status: 'pending' } });
            const a = await Refund.count({ where: { status: 'approved' } });
            const c = await Refund.count({ where: { status: 'completed' } });
            const r = await Refund.count({ where: { status: 'rejected' } });

            return {
                stats: { pending: p, approved: a, completed: c, rejected: r },
                list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize)
            };
        } catch (e) {
            return { stats: { pending: 0, approved: 0, completed: 0, rejected: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async refundAudit({ refundNo, result, remark }) {
        const Refund = db.sequelize?.models?.FinanceRefund;
        if (!Refund) throw new Error('退款模块暂不可用');
        const refund = await Refund.findOne({ where: { refund_no: refundNo } });
        if (!refund) throw new Error('退款单不存在');
        const status = result === 'pass' ? 'approved' : 'rejected';
        await refund.update({ status, audit_remark: remark || '', audit_time: new Date() });
        return { refundNo, status, remark };
    }
}

module.exports = new FinanceService();
