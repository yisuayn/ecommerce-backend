const { Op } = require('sequelize');
const Carousel = require('../WebMenu/Carousel');

class CarouselService {

    // ========== 前端查询方法 ==========

    // 获取启用的轮播图列表（前端展示用）
    async getActiveCarousels() {
        try {
            const carousels = await Carousel.findAll({
                where: { status: 1 },
                order: [['sortOrder', 'ASC'], ['id', 'ASC']],
                attributes: ['id', 'title', 'description', 'buttonText', 'imageUrl', 'linkUrl', 'target', 'backgroundColor']
            });
            return carousels;
        } catch (error) {
            throw new Error(`获取轮播图失败: ${error.message}`);
        }
    }

    // ========== 后台管理方法 ==========

    // 获取所有轮播图（支持分页）
    async getAllCarousels(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 10,
                keyword = null,
                status = null
            } = params;

            const offset = (page - 1) * pageSize;
            const where = {};

            if (keyword) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } }
                ];
            }

            if (status !== null && status !== '') {
                where.status = parseInt(status);
            }

            const { count, rows } = await Carousel.findAndCountAll({
                where,
                order: [['sortOrder', 'ASC'], ['id', 'DESC']],
                limit: parseInt(pageSize),
                offset
            });

            return {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize)
            };
        } catch (error) {
            throw new Error(`查询轮播图列表失败: ${error.message}`);
        }
    }

    // 根据ID获取单条轮播图
    async getCarouselById(id) {
        try {
            const carousel = await Carousel.findByPk(id);
            if (!carousel) {
                throw new Error('轮播图不存在');
            }
            return carousel;
        } catch (error) {
            throw new Error(`获取轮播图详情失败: ${error.message}`);
        }
    }

    // 创建轮播图
    async createCarousel(data) {
        try {
            // 自动设置排序值（如果未提供）
            if (data.sortOrder === undefined) {
                const maxSort = await Carousel.max('sortOrder');
                data.sortOrder = (maxSort || 0) + 1;
            }

            const carousel = await Carousel.create(data);
            return carousel;
        } catch (error) {
            throw new Error(`创建轮播图失败: ${error.message}`);
        }
    }

    // 更新轮播图
    async updateCarousel(id, updateData) {
        try {
            const carousel = await Carousel.findByPk(id);
            if (!carousel) {
                throw new Error('轮播图不存在');
            }

            await carousel.update(updateData);
            return carousel;
        } catch (error) {
            throw new Error(`更新轮播图失败: ${error.message}`);
        }
    }

    // 删除轮播图（硬删除）
    async deleteCarousel(id) {
        try {
            const carousel = await Carousel.findByPk(id);
            if (!carousel) {
                throw new Error('轮播图不存在');
            }

            await carousel.destroy();
            return true;
        } catch (error) {
            throw new Error(`删除轮播图失败: ${error.message}`);
        }
    }

    // 批量删除
    async batchDeleteCarousels(ids) {
        try {
            const deletedCount = await Carousel.destroy({
                where: { id: { [Op.in]: ids } }
            });
            return deletedCount;
        } catch (error) {
            throw new Error(`批量删除失败: ${error.message}`);
        }
    }

    // 批量更新状态
    async batchUpdateStatus(ids, status) {
        try {
            const [updatedCount] = await Carousel.update(
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
            const updatePromises = sortList.map(item =>
                Carousel.update(
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

    // 获取统计数据
    async getStatistics() {
        try {
            const total = await Carousel.count();
            const activeCount = await Carousel.count({ where: { status: 1 } });
            const inactiveCount = await Carousel.count({ where: { status: 0 } });

            return {
                total,
                activeCount,
                inactiveCount
            };
        } catch (error) {
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
    }

    // 调整排序（交换两个轮播图的排序值）
    async swapSortOrder(id1, id2) {
        try {
            const [carousel1, carousel2] = await Promise.all([
                Carousel.findByPk(id1),
                Carousel.findByPk(id2)
            ]);

            if (!carousel1 || !carousel2) {
                throw new Error('轮播图不存在');
            }

            const tempSort = carousel1.sortOrder;
            await carousel1.update({ sortOrder: carousel2.sortOrder });
            await carousel2.update({ sortOrder: tempSort });

            return true;
        } catch (error) {
            throw new Error(`调整排序失败: ${error.message}`);
        }
    }
}

module.exports = new CarouselService();