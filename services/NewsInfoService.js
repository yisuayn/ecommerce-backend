const { Op } = require('sequelize');
const News = require('../WebMenu/NewsInfo');

class NewsService {
    // ========== 查询方法 ==========

    // 获取资讯列表（支持分页、筛选、搜索）
    async getNewsList(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 10,
                type = null,      // hot, notice, promotion
                keyword = null,   // 搜索关键词（标题或标签）
                status = 1,       // 状态：1启用 0禁用
                sortBy = 'createTime',
                sortOrder = 'DESC'
            } = params;

            const offset = (page - 1) * pageSize;

            // 构建查询条件
            const where = {};
            if (type) where.type = type;
            if (status !== undefined && status !== null) where.status = status;

            // 关键词搜索（标题或标签）
            if (keyword) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${keyword}%` } },
                    { tag: { [Op.like]: `%${keyword}%` } }
                ];
            }

            const { count, rows } = await News.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(pageSize),
                offset: offset
            });

            return {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize)
            };
        } catch (error) {
            throw new Error(`查询新闻列表失败: ${error.message}`);
        }
    }

    // 获取热门新闻（前N条）
    async getHotNews(limit = 5) {
        try {
            const hotNews = await News.findAll({
                where: {
                    type: 'hot',
                    status: 1
                },
                order: [
                    ['sortOrder', 'ASC'],
                    ['createTime', 'DESC']
                ],
                limit: parseInt(limit)
            });
            return hotNews;
        } catch (error) {
            throw new Error(`获取热门新闻失败: ${error.message}`);
        }
    }

    // 获取公告新闻
    async getNoticeNews(limit = 10) {
        try {
            const noticeNews = await News.findAll({
                where: {
                    type: 'notice',
                    status: 1
                },
                order: [['createTime', 'DESC']],
                limit: parseInt(limit)
            });
            return noticeNews;
        } catch (error) {
            throw new Error(`获取公告新闻失败: ${error.message}`);
        }
    }

    // 获取优惠新闻
    async getPromotionNews(limit = 10) {
        try {
            const promotionNews = await News.findAll({
                where: {
                    type: 'promotion',
                    status: 1
                },
                order: [['createTime', 'DESC']],
                limit: parseInt(limit)
            });
            return promotionNews;
        } catch (error) {
            throw new Error(`获取优惠新闻失败: ${error.message}`);
        }
    }

    // 获取分组新闻（首页用）
    async getGroupedNews(hotLimit = 5, noticeLimit = 5, promotionLimit = 5) {
        try {
            const [hotNews, noticeNews, promotionNews] = await Promise.all([
                this.getHotNews(hotLimit),
                this.getNoticeNews(noticeLimit),
                this.getPromotionNews(promotionLimit)
            ]);

            return {
                hot: hotNews,
                notice: noticeNews,
                promotion: promotionNews
            };
        } catch (error) {
            throw new Error(`获取分组新闻失败: ${error.message}`);
        }
    }

    // 根据ID获取单条新闻详情
    async getNewsById(id) {
        try {
            const news = await News.findByPk(id);
            if (!news) {
                throw new Error('新闻不存在');
            }

            // 增加浏览次数（非关键操作，不等待）
            news.increment('viewCount').catch(err => console.error('更新浏览次数失败:', err));

            return news;
        } catch (error) {
            throw new Error(`获取新闻详情失败: ${error.message}`);
        }
    }

    // 根据类型获取新闻
    async getNewsByType(type, limit = null) {
        try {
            const query = {
                where: { type, status: 1 },
                order: [['createTime', 'DESC']]
            };
            if (limit) query.limit = parseInt(limit);

            return await News.findAll(query);
        } catch (error) {
            throw new Error(`获取${type}类型新闻失败: ${error.message}`);
        }
    }

    // ========== 创建方法 ==========

    // 创建单条新闻
    async createNews(data) {
        try {
            // 处理排序值
            if (data.sortOrder === undefined) {
                const maxSortOrder = await News.max('sortOrder');
                data.sortOrder = (maxSortOrder || 0) + 1;
            }

            const news = await News.create(data);
            return news;
        } catch (error) {
            throw new Error(`创建新闻失败: ${error.message}`);
        }
    }

    // 批量创建新闻
    async batchCreateNews(newsList) {
        try {
            const createdNews = [];
            for (const news of newsList) {
                const created = await this.createNews(news);
                createdNews.push(created);
            }
            return createdNews;
        } catch (error) {
            throw new Error(`批量创建新闻失败: ${error.message}`);
        }
    }

    // ========== 更新方法 ==========

    // 更新新闻
    async updateNews(id, updateData) {
        try {
            const news = await News.findByPk(id);
            if (!news) {
                throw new Error('新闻不存在');
            }

            // 如果更新排序，调整其他新闻的排序
            if (updateData.sortOrder !== undefined && updateData.sortOrder !== news.sortOrder) {
                await this.adjustSortOrder(news.sortOrder, updateData.sortOrder);
            }

            await news.update(updateData);
            return news;
        } catch (error) {
            throw new Error(`更新新闻失败: ${error.message}`);
        }
    }

    // 调整排序
    async adjustSortOrder(oldSort, newSort) {
        try {
            if (newSort > oldSort) {
                // 排序值增大，中间的值减1
                await News.update(
                    { sortOrder: require('sequelize').literal('sort_order - 1') },
                    {
                        where: {
                            sortOrder: {
                                [Op.between]: [oldSort + 1, newSort]
                            }
                        }
                    }
                );
            } else if (newSort < oldSort) {
                // 排序值减小，中间的值加1
                await News.update(
                    { sortOrder: require('sequelize').literal('sort_order + 1') },
                    {
                        where: {
                            sortOrder: {
                                [Op.between]: [newSort, oldSort - 1]
                            }
                        }
                    }
                );
            }
        } catch (error) {
            console.error('调整排序失败:', error);
        }
    }

    // 批量更新状态
    async batchUpdateStatus(ids, status) {
        try {
            const [updatedCount] = await News.update(
                { status, updateTime: new Date() },
                { where: { id: { [Op.in]: ids } } }
            );
            return updatedCount;
        } catch (error) {
            throw new Error(`批量更新状态失败: ${error.message}`);
        }
    }

    // 批量更新排序
    async batchUpdateSort(sortList) {
        try {
            // sortList: [{id: 1, sortOrder: 1}, {id: 2, sortOrder: 2}, ...]
            const updatePromises = sortList.map(item =>
                News.update(
                    { sortOrder: item.sortOrder },
                    { where: { id: item.id } }
                )
            );
            await Promise.all(updatePromises);
            return sortList.length;
        } catch (error) {
            throw new Error(`批量更新排序失败: ${error.message}`);
        }
    }

    // ========== 删除方法 ==========

    // 软删除（更新状态为0）
    async softDeleteNews(id) {
        try {
            const news = await News.findByPk(id);
            if (!news) {
                throw new Error('新闻不存在');
            }

            await news.update({ status: 0 });
            return true;
        } catch (error) {
            throw new Error(`删除新闻失败: ${error.message}`);
        }
    }

    // 硬删除（物理删除）
    async hardDeleteNews(id) {
        try {
            const news = await News.findByPk(id);
            if (!news) {
                throw new Error('新闻不存在');
            }

            await news.destroy();
            return true;
        } catch (error) {
            throw new Error(`彻底删除新闻失败: ${error.message}`);
        }
    }

    // 批量删除
    async batchDeleteNews(ids) {
        try {
            const deletedCount = await News.destroy({
                where: { id: { [Op.in]: ids } }
            });
            return deletedCount;
        } catch (error) {
            throw new Error(`批量删除失败: ${error.message}`);
        }
    }

    // ========== 统计方法 ==========

    // 获取统计数据
    async getStatistics() {
        try {
            const total = await News.count();
            const hotCount = await News.count({ where: { type: 'hot' } });
            const noticeCount = await News.count({ where: { type: 'notice' } });
            const promotionCount = await News.count({ where: { type: 'promotion' } });
            const activeCount = await News.count({ where: { status: 1 } });
            const totalViews = await News.sum('viewCount');

            // 按类型统计
            const typeStats = await News.findAll({
                attributes: [
                    'type',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
                ],
                group: ['type']
            });

            return {
                total,
                hotCount,
                noticeCount,
                promotionCount,
                activeCount,
                totalViews,
                typeStats
            };
        } catch (error) {
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
    }

    // 获取最新新闻
    async getLatestNews(limit = 10) {
        try {
            return await News.findAll({
                where: { status: 1 },
                order: [['createTime', 'DESC']],
                limit: parseInt(limit)
            });
        } catch (error) {
            throw new Error(`获取最新新闻失败: ${error.message}`);
        }
    }

    // ========== 辅助方法 ==========

    // 检查是否存在
    async exists(id) {
        try {
            const count = await News.count({ where: { id } });
            return count > 0;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new NewsService();