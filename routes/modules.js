const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/DashboardController');
const productController = require('../WebMenu/ProductController');
const brandController = require('../WebMenu/BrandController');
const memberController = require('../controllers/MemberController');
const orderController = require('../controllers/OrderController');
const logisticsController = require('../controllers/LogisticsController');
const cmsController = require('../controllers/CmsController');
const financeController = require('../controllers/FinanceController');
const reviewController = require('../controllers/ReviewAdminController');
const notificationController = require('../controllers/NotificationController');
const marketingController = require('../controllers/MarketingController');
const systemController = require('../controllers/SystemController');

// ==================== 数据看板 ====================
router.get('/getsaledata', dashboardController.getSaleData);

// ==================== 商品管理 ====================
router.get('/admin/list', productController.getAllProducts);
router.get('/admin/statistics', productController.getStatistics);
router.post('/product/publish', productController.createProduct);
router.put('/product/update/:id', productController.updateProduct);
router.delete('/product/delete/:id', productController.deleteProduct);
router.put('/admin/batch/status', productController.batchUpdateStatus);
router.post('/admin/batch/delete', productController.batchDeleteProducts);
router.put('/admin/:id/stock', productController.updateStock);

// ==================== 品牌管理 ====================
router.get('/brand/list', brandController.getAllBrands);
router.get('/brand/hot', brandController.getHotBrands);
router.get('/brand/detail/:id', brandController.getBrandDetail);

// ==================== 会员管理 ====================
router.get('/member/list', memberController.list);
router.get('/member/detail/:id', memberController.detail);
router.post('/member/save', memberController.save);
router.get('/member/level/list', memberController.levelList);
router.post('/member/level/save', memberController.levelSave);
router.get('/member/points/rule', memberController.pointsRule);
router.post('/member/points/rule/save', memberController.pointsRuleSave);
router.get('/member/points/log', memberController.pointsLog);

// ==================== 订单管理 ====================
router.get('/order/list', orderController.list);
router.post('/order/ship', orderController.ship);
router.get('/order/after-sale/list', orderController.afterSaleList);
router.post('/order/after-sale/audit', orderController.afterSaleAudit);
router.get('/order/exception/list', orderController.exceptionList);
router.post('/order/exception/handle', orderController.exceptionHandle);

// ==================== 物流系统 ====================
router.get('/logistics/template/list', logisticsController.templateList);
router.post('/logistics/template/save', logisticsController.templateSave);
router.delete('/logistics/template/delete/:id', logisticsController.templateDelete);
router.get('/logistics/company/list', logisticsController.companyList);
router.post('/logistics/company/save', logisticsController.companySave);
router.get('/logistics/tracking/:trackingNo', logisticsController.tracking);

// ==================== 内容管理 CMS ====================
router.get('/cms/banner/list', cmsController.bannerList);
router.post('/cms/banner/save', cmsController.bannerSave);
router.delete('/cms/banner/delete/:id', cmsController.bannerDelete);
router.get('/cms/article/list', cmsController.articleList);
router.post('/cms/article/save', cmsController.articleSave);
router.delete('/cms/article/delete/:id', cmsController.articleDelete);

// ==================== 财务管理 ====================
router.get('/finance/transaction/list', financeController.transactionList);
router.get('/finance/refund/list', financeController.refundList);
router.post('/finance/refund/audit', financeController.refundAudit);

// ==================== 评价管理 ====================
router.get('/review/list', reviewController.list);
router.post('/review/audit', reviewController.audit);
router.post('/review/reply', reviewController.reply);
router.delete('/review/delete/:id', reviewController.delete);

// ==================== 通知系统 ====================
router.get('/notification/template/list', notificationController.templateList);
router.post('/notification/template/save', notificationController.templateSave);
router.get('/notification/log/list', notificationController.logList);
router.post('/notification/send', notificationController.send);

// ==================== 营销中心 ====================
router.get('/marketing/coupon/list', marketingController.couponList);
router.post('/marketing/coupon/save', marketingController.couponSave);
router.post('/marketing/coupon/send', marketingController.couponSend);
router.get('/marketing/seckill/list', marketingController.seckillList);
router.post('/marketing/seckill/save', marketingController.seckillSave);

// ==================== 系统设置 ====================
router.get('/system/admin/list', systemController.adminList);
router.post('/system/admin/save', systemController.adminSave);
router.post('/system/admin/reset-password', systemController.adminResetPassword);
router.get('/system/role/list', systemController.roleList);
router.post('/system/role/save', systemController.roleSave);
router.get('/system/permission/tree', systemController.permissionTree);
router.post('/system/role/permission/save', systemController.rolePermissionSave);
router.get('/system/log/list', systemController.logList);

module.exports = router;
