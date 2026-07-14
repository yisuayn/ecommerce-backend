const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');

class CmsService {
    async bannerList() {
        try {
            const Banner = db.sequelize?.models?.CmsBanner;
            if (!Banner) return [];
            return await Banner.findAll({ where: { status: 1 }, order: [['sort_order', 'ASC']] });
        } catch (e) { return []; }
    }

    async bannerSave(data) {
        const Banner = db.sequelize?.models?.CmsBanner;
        if (!Banner) throw new Error('Banner模块暂不可用');
        if (data.id) {
            await Banner.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Banner.create(data);
        return { id: result.id };
    }

    async bannerDelete(id) {
        const Banner = db.sequelize?.models?.CmsBanner;
        if (!Banner) throw new Error('Banner模块暂不可用');
        await Banner.destroy({ where: { id } });
    }

    async articleList({ page = 1, pageSize = 15, keyword, category }) {
        try {
            const Article = db.sequelize?.models?.CmsArticle;
            if (!Article) return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
            const where = {};
            if (keyword) where.title = { [Op.like]: `%${keyword}%` };
            if (category) where.category = category;
            const { count, rows } = await Article.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['publish_time', 'DESC']]
            });
            return { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async articleSave(data) {
        const Article = db.sequelize?.models?.CmsArticle;
        if (!Article) throw new Error('文章模块暂不可用');
        if (data.id) {
            await Article.update(data, { where: { id: data.id }, updateTime: new Date() });
            return { id: data.id };
        }
        const payload = { ...data };
        if (data.status === 1) payload.publish_time = new Date();
        const result = await Article.create(payload);
        return { id: result.id };
    }

    async articleDelete(id) {
        const Article = db.sequelize?.models?.CmsArticle;
        if (!Article) throw new Error('文章模块暂不可用');
        await Article.destroy({ where: { id } });
    }
}

module.exports = new CmsService();
