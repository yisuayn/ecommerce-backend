const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class DashboardService {
    async getSaleData() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // 并行查询各项统计数据
        const [
            todayOrderCount,
            monthOrderCount,
            todayOrderAmount,
            monthOrderAmount,
            productTotal,
            memberTotal
        ] = await Promise.all([
            // 今日订单数
            db.sequelize.models.Order ? db.sequelize.models.Order.count({
                where: { createTime: { [Op.gte]: todayStart } }
            }) : Promise.resolve(0),
            // 本月订单数
            db.sequelize.models.Order ? db.sequelize.models.Order.count({
                where: { createTime: { [Op.gte]: monthStart } }
            }) : Promise.resolve(0),
            // 今日收入
            db.sequelize.models.Order ? db.sequelize.models.Order.sum('totalAmount', {
                where: {
                    status: 'completed',
                    createTime: { [Op.gte]: todayStart }
                }
            }) : Promise.resolve(0),
            // 本月收入
            db.sequelize.models.Order ? db.sequelize.models.Order.sum('totalAmount', {
                where: {
                    status: 'completed',
                    createTime: { [Op.gte]: monthStart }
                }
            }) : Promise.resolve(0),
            // 商品总数
            db.Product.count({ where: { status: 1 } }),
            // 会员总数
            db.sequelize.models.Member ? db.sequelize.models.Member.count() : Promise.resolve(0)
        ]);

        return [
            { title: '今日订单', value: (todayOrderCount || 0).toLocaleString(), trend: 0 },
            { title: '商品总数', value: (productTotal || 0).toLocaleString(), trend: 0 },
            { title: '用户总数', value: (memberTotal || 0).toLocaleString(), trend: 0 },
            { title: '今日收入', value: Math.round(todayOrderAmount || 0).toLocaleString(), trend: 0 }
        ];
    }
}

module.exports = new DashboardService();
