const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class NotificationService {
    async templateList() {
        try {
            const Template = db.sequelize?.models?.NotificationTemplate;
            if (!Template) return [];
            return await Template.findAll({ order: [['id', 'ASC']] });
        } catch (e) { return []; }
    }

    async templateSave(data) {
        const Template = db.sequelize?.models?.NotificationTemplate;
        if (!Template) throw new Error('通知模板模块暂不可用');
        if (data.id) {
            await Template.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Template.create(data);
        return { id: result.id };
    }

    async logList({ page = 1, pageSize = 15, templateName, recipient, type, status, startTime, endTime }) {
        try {
            const Log = db.sequelize?.models?.NotificationLog;
            if (!Log) return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
            const where = {};
            if (templateName) where.template_name = { [Op.like]: `%${templateName}%` };
            if (recipient) where.recipient = { [Op.like]: `%${recipient}%` };
            if (type) where.type = type;
            if (status) where.status = status;
            if (startTime && endTime) where.send_time = { [Op.between]: [new Date(startTime), new Date(endTime)] };
            const { count, rows } = await Log.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['send_time', 'DESC']]
            });
            return { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async send({ templateCode, recipient, params }) {
        const Template = db.sequelize?.models?.NotificationTemplate;
        const Log = db.sequelize?.models?.NotificationLog;
        if (!Template || !Log) throw new Error('通知模块暂不可用');
        const template = await Template.findOne({ where: { template_code: templateCode } });
        if (!template) throw new Error('模板不存在');
        // 替换变量
        let content = template.content;
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
            }
        }
        await Log.create({
            template_id: template.id,
            template_name: template.name,
            template_code: template.template_code,
            recipient, type: template.type, content, params: JSON.stringify(params),
            status: 'success', send_time: new Date()
        });
        return { templateCode, recipient, status: 'success' };
    }
}

module.exports = new NotificationService();
