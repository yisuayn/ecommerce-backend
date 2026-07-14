const NotificationService = require('../services/admin/NotificationService');

class NotificationController {
    async templateList(req, res) {
        try {
            const list = await NotificationService.templateList();
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async templateSave(req, res) {
        try {
            const result = await NotificationService.templateSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async logList(req, res) {
        try {
            const { page = 1, pageSize = 15, templateName, recipient, type, status, startTime, endTime } = req.query;
            const result = await NotificationService.logList({ page, pageSize, templateName, recipient, type, status, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async send(req, res) {
        try {
            const result = await NotificationService.send(req.body);
            res.json({ code: 200, message: '发送成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new NotificationController();
