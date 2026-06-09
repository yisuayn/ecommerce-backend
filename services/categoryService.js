const Category = require('../WebMenu/category');
const { Op } = require('sequelize');

class CategoryService {

    // 生成新的业务编码
    async generateNewCode(parentCode) {
        const maxRecord = await Category.findOne({
            where: { parent_code: parentCode, state: 1 },
            attributes: ['code'],
            order: [['code', 'DESC']]
        });

        let newCode;
        if (!maxRecord) {
            newCode = parentCode === 0 ? 1 : parentCode * 10 + 1;
        } else {
            newCode = maxRecord.code + 1;
        }

        const exists = await Category.findOne({ where: { code: newCode } });
        if (exists) {
            return this.findNextAvailableCode(parentCode, newCode);
        }

        return newCode;
    }

    async findNextAvailableCode(parentCode, startCode) {
        let candidate = startCode;
        while (true) {
            const exists = await Category.findOne({ where: { code: candidate } });
            if (!exists) return candidate;
            candidate++;
        }
    }

    // 构建树形结构
    async getTree() {
        const categories = await Category.findAll({
            where: { is_active: 1 },
            attributes: { exclude: ['id'] },
            order: [['sort_order', 'ASC'], ['code', 'ASC']]
        });

        return this.buildTree(categories);
    }

    buildTree(flatData, parentCode = 0) {
        const tree = [];
        for (const item of flatData) {
            if (item.parent_code === parentCode) {
                const itemData = item.toJSON ? item.toJSON() : item;
                const children = this.buildTree(flatData, itemData.code);
                if (children.length) {
                    itemData.children = children;
                }
                tree.push(itemData);
            }
        }
        return tree;
    }

    // 创建分类
    async create(data) {
        const { parent_code, name, description, icon, sort_order } = data;

        const parentCodeValue = parent_code || 0;
        const newCode = await this.generateNewCode(parentCodeValue);

        let level = 1;
        let path = `/${newCode}`;

        if (parentCodeValue > 0) {
            const parent = await Category.findOne({
                where: { code: parentCodeValue, is_active: 1 }
            });
            if (!parent) {
                throw new Error('父级分类不存在');
            }
            level = parent.level + 1;
            path = `${parent.path}/${newCode}`;
        }

        const category = await Category.create({
            code: newCode,
            parent_code: parentCodeValue,
            name,
            description,
            icon,
            sort_order: sort_order || 0,
            level,
            path
        });

        const result = category.toJSON();
        delete result.id;
        return result;
    }

    // 更新分类
    async update(code, data) {
        const category = await Category.findOne({
            where: { code, is_active: 1 }
        });
        if (!category) {
            throw new Error('分类不存在');
        }

        const oldParentCode = category.parent_code;
        const newParentCode = data.parent_code;

        if (newParentCode !== undefined && newParentCode !== oldParentCode) {
            if (newParentCode === code) {
                throw new Error('不能将自己设为父级');
            }

            const newParent = await Category.findOne({
                where: { code: newParentCode, is_active: 1 }
            });
            if (!newParent) {
                throw new Error('父级分类不存在');
            }

            if (newParent.path && newParent.path.includes(`/${code}/`)) {
                throw new Error('不能将分类移动到自己的子分类下');
            }

            const newLevel = newParent.level + 1;
            const newPath = `${newParent.path}/${code}`;

            await category.update({
                ...data,
                level: newLevel,
                path: newPath
            });

            await this.updateChildrenPath(code, newLevel, newPath);
        } else {
            await category.update(data);
        }

        const result = await Category.findOne({
            where: { code },
            attributes: { exclude: ['id'] }
        });
        return result;
    }

    // 递归更新子分类
    async updateChildrenPath(parentCode, newLevel, newPath) {
        const children = await Category.findAll({
            where: { parent_code: parentCode, is_active: 1 }
        });

        for (const child of children) {
            const childNewPath = `${newPath}/${child.code}`;
            await child.update({
                level: newLevel + 1,
                path: childNewPath
            });

            await this.updateChildrenPath(child.code, newLevel + 1, childNewPath);
        }
    }

    // 软删除
    async delete(code) {
        const category = await Category.findOne({
            where: { code, is_active: 1 }
        });
        if (!category) {
            throw new Error('分类不存在');
        }

        const childrenCount = await Category.count({
            where: { parent_code: code, is_active: 1 }
        });

        if (childrenCount > 0) {
            throw new Error('请先删除子分类');
        }

        await category.update({ is_active: 0 });
        return { success: true, message: '删除成功' };
    }

    // 获取单个分类
    async getByCode(code) {
        const category = await Category.findOne({
            where: { code, is_active: 1 },
            attributes: { exclude: ['id'] }
        });
        if (!category) {
            throw new Error('分类不存在');
        }
        return category;
    }

    // 获取所有子孙
    async getDescendants(code) {
        const category = await Category.findOne({
            where: { code, is_active: 1 }
        });
        if (!category) {
            throw new Error('分类不存在');
        }

        const descendants = await Category.findAll({
            where: {
                is_active: 1,
                path: { [Op.like]: `${category.path}/${category.code}%` }
            },
            attributes: { exclude: ['id'] },
            order: [['level', 'ASC'], ['sort_order', 'ASC']]
        });

        return descendants;
    }
}

module.exports = new CategoryService();