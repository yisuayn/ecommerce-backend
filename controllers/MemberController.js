const MemberService = require('../services/admin/MemberService');

class MemberController {
    // 会员列表
    async list(req, res) {
        try {
            const { page = 1, pageSize = 15, keyword, level, status } = req.query;
            const result = await MemberService.list({ page, pageSize, keyword, level, status });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 会员详情
    async detail(req, res) {
        try {
            const result = await MemberService.detail(req.params.id);
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(404).json({ code: 404, message: error.message });
        }
    }

    // 新增/编辑会员
    async save(req, res) {
        try {
            const result = await MemberService.save(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 会员等级列表
    async levelList(req, res) {
        try {
            const list = await MemberService.levelList();
            res.json({ code: 200, message: '操作成功', data: { list, total: list.length } });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 保存会员等级
    async levelSave(req, res) {
        try {
            const result = await MemberService.levelSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 积分规则
    async pointsRule(req, res) {
        try {
            const rule = await MemberService.pointsRule();
            res.json({ code: 200, message: '操作成功', data: rule });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 保存积分规则
    async pointsRuleSave(req, res) {
        try {
            const result = await MemberService.pointsRuleSave(req.body);
            res.json({ code: 200, message: '保存成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }

    // 积分流水
    async pointsLog(req, res) {
        try {
            const { page = 1, pageSize = 15, keyword, type } = req.query;
            const result = await MemberService.pointsLog({ page, pageSize, keyword, type });
            res.json({ code: 200, message: '操作成功', data: result });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new MemberController();
