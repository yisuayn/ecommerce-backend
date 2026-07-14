const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class MarketingService {
    async couponList({ page = 1, pageSize = 15, name, type, sendType, status }) {
        try {
            const Coupon = db.sequelize?.models?.Coupon;
            if (!Coupon) return { stats: { total: 0, active: 0, todaySend: 0, todayUsed: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };

            const where = {};
            if (name) where.name = { [Op.like]: `%${name}%` };
            if (type) where.type = type;
            if (status) where.status = status;

            const { count, rows } = await Coupon.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']]
            });

            const total = await Coupon.count();
            const active = await Coupon.count({ where: { status: 'active' } });

            return {
                stats: { total, active, todaySend: 0, todayUsed: 0 },
                list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize)
            };
        } catch (e) {
            return { stats: { total: 0, active: 0, todaySend: 0, todayUsed: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async couponSave(data) {
        const Coupon = db.sequelize?.models?.Coupon;
        if (!Coupon) throw new Error('优惠券模块暂不可用');
        if (data.id) {
            await Coupon.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Coupon.create(data);
        if (data.categories || data.products) {
            const CouponScope = db.sequelize?.models?.CouponScope;
            if (CouponScope) {
                const scopes = [];
                if (data.categories) data.categories.forEach(c => scopes.push({ coupon_id: result.id, scope_type: 'category', scope_id: c }));
                if (data.products) data.products.forEach(p => scopes.push({ coupon_id: result.id, scope_type: 'product', scope_id: p }));
                if (scopes.length) await CouponScope.bulkCreate(scopes);
            }
        }
        return { id: result.id };
    }

    async couponSend({ couponId, sendType, userId, quantity, remark }) {
        const Coupon = db.sequelize?.models?.Coupon;
        const CouponUser = db.sequelize?.models?.CouponUser;
        if (!Coupon || !CouponUser) throw new Error('优惠券模块暂不可用');
        const coupon = await Coupon.findByPk(couponId);
        if (!coupon) throw new Error('优惠券不存在');
        const num = parseInt(quantity) || 1;
        const records = [];
        for (let i = 0; i < num; i++) {
            records.push({
                coupon_id: couponId, member_id: userId || 0,
                send_type: sendType || 'manual', status: 'unused', remark: remark || ''
            });
        }
        await CouponUser.bulkCreate(records);
        await coupon.increment('received_count', { by: num });
        return { couponId, sendCount: num };
    }

    async seckillList() {
        try {
            const SeckillActivity = db.sequelize?.models?.SeckillActivity;
            const TimeSlot = db.sequelize?.models?.SeckillTimeSlot;
            // 获取固定场次
            let timeSlots = [];
            if (TimeSlot) {
                timeSlots = await TimeSlot.findAll({ order: [['sort_order', 'ASC']] });
            } else {
                timeSlots = [
                    { label: '00:00-08:00', value: 'morning' },
                    { label: '08:00-12:00', value: 'morning2' },
                    { label: '12:00-14:00', value: 'noon' },
                    { label: '14:00-18:00', value: 'afternoon' },
                    { label: '18:00-20:00', value: 'evening' },
                    { label: '20:00-24:00', value: 'night' }
                ];
            }

            let list = [];
            if (SeckillActivity) {
                list = await SeckillActivity.findAll({
                    order: [['start_time', 'DESC']],
                    include: [{ model: db.sequelize?.models?.SeckillProduct, as: 'products' }]
                });
            }

            return {
                timeSlots: timeSlots.map(t => ({
                    label: t.label || t.getDataValue?.('label'),
                    value: t.value || t.getDataValue?.('value'),
                    status: 'pending'
                })),
                list,
                total: list.length
            };
        } catch (e) {
            return { timeSlots: [], list: [], total: 0 };
        }
    }

    async seckillSave(data) {
        const SeckillActivity = db.sequelize?.models?.SeckillActivity;
        const SeckillProduct = db.sequelize?.models?.SeckillProduct;
        if (!SeckillActivity) throw new Error('秒杀活动模块暂不可用');
        const activityData = {
            name: data.name, time_slot: data.timeSlot,
            start_time: data.dateRange?.[0] || new Date(),
            end_time: data.dateRange?.[1] || new Date(),
            user_limit: data.userLimit || 1, description: data.description || ''
        };
        if (data.id) {
            await SeckillActivity.update(activityData, { where: { id: data.id } });
            if (SeckillProduct && data.products) {
                await SeckillProduct.destroy({ where: { activity_id: data.id } });
                await SeckillProduct.bulkCreate(data.products.map(p => ({
                    activity_id: data.id, product_id: p.productId,
                    seckill_price: p.seckillPrice, stock: p.stock || 0
                })));
            }
            return { id: data.id };
        }
        const result = await SeckillActivity.create(activityData);
        if (SeckillProduct && data.products) {
            await SeckillProduct.bulkCreate(data.products.map(p => ({
                activity_id: result.id, product_id: p.productId,
                seckill_price: p.seckillPrice, stock: p.stock || 0
            })));
        }
        return { id: result.id };
    }
}

module.exports = new MarketingService();
