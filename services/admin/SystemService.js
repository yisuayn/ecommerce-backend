const db = require('../../module/ProductModule/index');
const { Op } = require('sequelize');
const { hashPassword } = require('../../utils/crypto');

class SystemService {
    async adminList({ page = 1, pageSize = 15, username, nickname, roleId, status }) {
        try {
            const Admin = db.sequelize?.models?.SystemAdmin;
            if (!Admin) return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
            const where = {};
            if (username) where.username = { [Op.like]: `%${username}%` };
            if (nickname) where.nickname = { [Op.like]: `%${nickname}%` };
            if (roleId) where.role_id = roleId;
            if (status !== undefined && status !== '') where.status = parseInt(status);
            const { count, rows } = await Admin.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['create_time', 'DESC']],
                attributes: { exclude: ['password'] }
            });
            return { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) };
        } catch (e) {
            return { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }

    async adminSave(data) {
        const Admin = db.sequelize?.models?.SystemAdmin;
        if (!Admin) throw new Error('管理员模块暂不可用');
        if (data.id) {
            const updateData = { ...data };
            if (updateData.password) {
                updateData.password = await hashPassword(updateData.password);
            } else {
                delete updateData.password;
            }
            await Admin.update(updateData, { where: { id: data.id } });
            return { id: data.id };
        }
        const createData = { ...data };
        if (createData.password) {
            createData.password = await hashPassword(createData.password);
        }
        const result = await Admin.create(createData);
        return { id: result.id };
    }

    async adminResetPassword({ id, password, confirmPassword }) {
        if (password !== confirmPassword) throw new Error('两次输入的密码不一致');
        const Admin = db.sequelize?.models?.SystemAdmin;
        if (!Admin) throw new Error('管理员模块暂不可用');
        const hashed = await hashPassword(password);
        await Admin.update({ password: hashed }, { where: { id } });
        return { id };
    }

    async roleList() {
        try {
            const Role = db.sequelize?.models?.SysRole;
            if (!Role) return [];
            return await Role.findAll({ order: [['sort', 'ASC']] });
        } catch (e) { return []; }
    }

    async roleSave(data) {
        const Role = db.sequelize?.models?.SysRole;
        if (!Role) throw new Error('角色模块暂不可用');
        if (data.id) {
            await Role.update(data, { where: { id: data.id } });
            return { id: data.id };
        }
        const result = await Role.create(data);
        return { id: result.id };
    }

    async permissionTree() {
        try {
            const Permission = db.sequelize?.models?.SysPermission;
            if (!Permission) return this._getDefaultPermissionTree();
            const all = await Permission.findAll({ where: { status: 1 }, order: [['sort', 'ASC']] });
            return this._buildTree(all, 0);
        } catch (e) {
            return this._getDefaultPermissionTree();
        }
    }

    _buildTree(items, parentId) {
        const children = items.filter(item => (item.parent_id || 0) === parentId);
        return children.map(item => {
            const node = {
                id: item.id,
                name: item.name,
                permission: item.permission,
                path: item.path
            };
            const subs = this._buildTree(items, item.id);
            if (subs.length) node.children = subs;
            return node;
        });
    }

    _getDefaultPermissionTree() {
        return [
            { id: 1, name: '数据看板', path: '/dashboard', children: [{ id: 101, name: '查看数据', permission: 'dashboard:view' }] },
            { id: 2, name: '商品管理', path: '/product', children: [
                { id: 201, name: '商品列表', permission: 'product:list' },
                { id: 202, name: '商品发布', permission: 'product:publish' },
                { id: 203, name: '库存管理', permission: 'product:stock' },
                { id: 204, name: '分类管理', permission: 'product:category' }
            ]},
            { id: 3, name: '订单管理', path: '/order', children: [
                { id: 301, name: '订单列表', permission: 'order:list' },
                { id: 302, name: '订单处理', permission: 'order:process' },
                { id: 303, name: '售后管理', permission: 'order:after-sale' },
                { id: 304, name: '物流管理', permission: 'order:logistics' }
            ]},
            { id: 4, name: '营销中心', path: '/marketing', children: [
                { id: 401, name: '优惠券管理', permission: 'marketing:coupon' },
                { id: 402, name: '秒杀活动', permission: 'marketing:seckill' }
            ]},
            { id: 5, name: '系统设置', path: '/system', children: [
                { id: 501, name: '管理员管理', permission: 'system:admin' },
                { id: 502, name: '角色权限', permission: 'system:role' },
                { id: 503, name: '操作日志', permission: 'system:log' }
            ]}
        ];
    }

    async rolePermissionSave({ roleId, permissions }) {
        const RolePermission = db.sequelize?.models?.SysRolePermission;
        if (!RolePermission) throw new Error('角色权限模块暂不可用');
        await RolePermission.destroy({ where: { role_id: roleId } });
        const records = permissions.map(p => ({ role_id: roleId, permission_id: p }));
        if (records.length) await RolePermission.bulkCreate(records);
        return { roleId, permissionCount: records.length };
    }

    async logList({ page = 1, pageSize = 15, operator, module, action, startTime, endTime }) {
        try {
            const Log = db.sequelize?.models?.SysOperationLog;
            if (!Log) return { stats: { today: 0, week: 0, month: 0, total: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
            const where = {};
            if (operator) where.operator = { [Op.like]: `%${operator}%` };
            if (module) where.module = module;
            if (action) where.action = action;
            if (startTime && endTime) where.operation_time = { [Op.between]: [new Date(startTime), new Date(endTime)] };

            const { count, rows } = await Log.findAndCountAll({
                where, limit: parseInt(pageSize), offset: (page - 1) * pageSize,
                order: [['operation_time', 'DESC']]
            });
            const total = await Log.count();
            return {
                stats: { today: 0, week: 0, month: 0, total },
                list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize)
            };
        } catch (e) {
            return { stats: { today: 0, week: 0, month: 0, total: 0 }, list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) };
        }
    }
}

module.exports = new SystemService();
