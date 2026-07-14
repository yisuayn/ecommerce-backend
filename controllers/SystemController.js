const SystemService = require('../services/admin/SystemService');

class SystemController {
    async adminList(req, res) {
        try {
            const { page = 1, pageSize = 15, username, nickname, roleId, status } = req.query;
            const result = await SystemService.adminList({ page, pageSize, username, nickname, roleId, status });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async adminSave(req, res) {
        try {
            const result = await SystemService.adminSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async adminResetPassword(req, res) {
        try {
            const result = await SystemService.adminResetPassword(req.body);
            res.json({ code: 200, message: '密码重置成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async roleList(req, res) {
        try {
            const list = await SystemService.roleList();
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async roleSave(req, res) {
        try {
            const result = await SystemService.roleSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async permissionTree(req, res) {
        try {
            const tree = await SystemService.permissionTree();
            res.json({ code: 200, message: '操作成功', data: { tree } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async rolePermissionSave(req, res) {
        try {
            const result = await SystemService.rolePermissionSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    async logList(req, res) {
        try {
            const { page = 1, pageSize = 15, operator, module, action, startTime, endTime } = req.query;
            const result = await SystemService.logList({ page, pageSize, operator, module, action, startTime, endTime });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new SystemController();
