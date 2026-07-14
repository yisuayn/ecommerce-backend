const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class LogisticsService {
    async templateList({ name, type, status }) {
        try {
            const Template = db.sequelize?.models?.LogisticsTemplate;
            if (!Template) return [];
            const where = {};
            if (name) where.name = { [Op.like]: `%${name}%` };
            if (type) where.type = type;
            if (status !== undefined && status !== '') where.status = parseInt(status);
            return await Template.findAll({ where, order: [['id', 'ASC']] });
        } catch (e) { return []; }
    }

    async templateSave(data) {
        const Template = db.sequelize?.models?.LogisticsTemplate;
        if (!Template) throw new Error('运费模板模块暂不可用');
        if (data.id) {
            await Template.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Template.create(data);
        return { id: result.id };
    }

    async templateDelete(id) {
        const Template = db.sequelize?.models?.LogisticsTemplate;
        if (!Template) throw new Error('运费模板模块暂不可用');
        await Template.destroy({ where: { id } });
    }

    async companyList({ name, status }) {
        try {
            const Company = db.sequelize?.models?.LogisticsCompany;
            if (!Company) return [];
            const where = {};
            if (name) where.name = { [Op.like]: `%${name}%` };
            if (status !== undefined && status !== '') where.status = parseInt(status);
            return await Company.findAll({ where, order: [['sort_order', 'ASC']] });
        } catch (e) { return []; }
    }

    async companySave(data) {
        const Company = db.sequelize?.models?.LogisticsCompany;
        if (!Company) throw new Error('物流公司模块暂不可用');
        if (data.id) {
            await Company.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Company.create(data);
        return { id: result.id };
    }

    async tracking(trackingNo) {
        return {
            company: '',
            trackingNo,
            status: 'transit',
            events: [
                { time: new Date().toISOString().replace('T', ' ').substring(0, 19), content: '物流信息查询中', location: '' }
            ]
        };
    }
}

module.exports = new LogisticsService();
