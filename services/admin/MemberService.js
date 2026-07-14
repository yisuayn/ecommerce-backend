const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

// 获取或创建 Member 模型（如果数据库中没有该表则使用硬编码数据兜底）
let MemberModel;
let MemberLevelModel;
let PointsRuleModel;
let PointsLogModel;

try {
    const { sequelize, DataTypes } = require('sequelize');
    const seq = require('../../config/database').sequelize;
    
    // 只尝试引用，不强制
    if (seq) {
        MemberModel = seq.models?.Member || null;
        MemberLevelModel = seq.models?.MemberLevel || null;
        PointsRuleModel = seq.models?.PointsRule || null;
        PointsLogModel = seq.models?.PointsLog || null;
    }
} catch (e) {
    // Model not available - use fallback data
}

class MemberService {
    async list({ page = 1, pageSize = 15, keyword, level, status }) {
        try {
            if (!MemberModel) {
                return { list: [], total: 0, page: 1, pageSize: 15 };
            }
            const where = {};
            if (keyword) {
                where[Op.or] = [
                    { nickname: { [Op.like]: `%${keyword}%` } },
                    { phone: { [Op.like]: `%${keyword}%` } }
                ];
            }
            if (level) where.level_id = level;
            if (status !== undefined && status !== '') where.status = parseInt(status);

            const { count, rows } = await MemberModel.findAndCountAll({
                where,
                limit: parseInt(pageSize),
                offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']]
            });

            const list = rows.map(m => ({
                id: m.uid,
                avatar: m.avatar || '',
                nickname: m.nickname,
                phone: m.phone,
                email: m.email || '',
                level_id: m.level_id,
                level: m.level_name || '',
                points: m.points || 0,
                balance: m.balance || 0,
                totalOrders: m.total_orders || 0,
                totalAmount: m.total_amount || 0,
                lastLogin: m.last_login_time || '',
                createTime: m.create_time,
                status: m.status || 1,
                remark: m.remark || ''
            }));

            return { list, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (error) {
            return { list: [], total: 0, page: 1, pageSize: 15 };
        }
    }

    async detail(id) {
        if (!MemberModel) throw new Error('会员模块暂不可用');
        const member = await MemberModel.findByPk(id);
        if (!member) throw new Error('会员不存在');
        return member;
    }

    async save(data) {
        if (!MemberModel) throw new Error('会员模块暂不可用');
        if (data.id) {
            await MemberModel.update(data, { where: { id: data.id } });
            return { id: data.id };
        } else {
            const result = await MemberModel.create(data);
            return { id: result.id };
        }
    }

    async levelList() {
        try {
            if (!MemberLevelModel) return [];
            return await MemberLevelModel.findAll({ order: [['min_points', 'ASC']] });
        } catch (e) {
            return [];
        }
    }

    async levelSave(data) {
        if (!MemberLevelModel) throw new Error('会员等级模块暂不可用');
        if (data.id) {
            await MemberLevelModel.update(data, { where: { id: data.id } });
            return { id: data.id };
        } else {
            const result = await MemberLevelModel.create(data);
            return { id: result.id };
        }
    }

    async pointsRule() {
        try {
            if (!PointsRuleModel) {
                return { registerPoints: 100, loginPoints: 5, orderRate: 1, reviewPoints: 20, maxDailyLogin: 1, pointsExpireDays: 365 };
            }
            const rule = await PointsRuleModel.findOne({ order: [['id', 'ASC']] });
            if (rule) return rule;
            // 插入默认规则
            return await PointsRuleModel.create({
                register_points: 100, login_points: 5, order_rate: 1,
                review_points: 20, max_daily_login: 1, points_expire_days: 365
            });
        } catch (e) {
            return { registerPoints: 100, loginPoints: 5, orderRate: 1, reviewPoints: 20, maxDailyLogin: 1, pointsExpireDays: 365 };
        }
    }

    async pointsRuleSave(data) {
        if (!PointsRuleModel) throw new Error('积分规则模块暂不可用');
        const rule = await PointsRuleModel.findOne({ order: [['id', 'ASC']] });
        if (rule) {
            await rule.update(data);
            return rule;
        }
        const result = await PointsRuleModel.create(data);
        return result;
    }

    async pointsLog({ page = 1, pageSize = 15, keyword, type }) {
        try {
            if (!PointsLogModel) return { list: [], total: 0, page, pageSize };
            const where = {};
            if (type) where.type = type;
            if (keyword) {
                const members = await MemberModel.findAll({
                    where: { [Op.or]: [{ nickname: { [Op.like]: `%${keyword}%` } }, { phone: { [Op.like]: `%${keyword}%` } }] }
                });
                where.member_id = { [Op.in]: members.map(m => m.id) };
            }
            const { count, rows } = await PointsLogModel.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']],
                include: [{ model: MemberModel, as: 'member', attributes: ['nickname', 'phone'] }]
            });
            const list = rows.map(r => ({
                id: r.id,
                member: r.member?.nickname || '',
                phone: r.member?.phone || '',
                type: r.type,
                points: r.points,
                balance: r.balance,
                remark: r.remark || '',
                createTime: r.create_time
            }));
            return { list, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: 1, pageSize: 15 };
        }
    }
}

module.exports = new MemberService();
