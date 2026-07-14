const DashboardService = require('../services/admin/DashboardService');

class DashboardController {
    // 获取看板数据
    async getSaleData(req, res) {
        try {
            const data = await DashboardService.getSaleData();
            res.json({
                code: 200,
                message: '操作成功',
                data: { stats: data }
            });
        } catch (error) {
            res.status(500).json({ code: 500, message: error.message });
        }
    }
}

module.exports = new DashboardController();
