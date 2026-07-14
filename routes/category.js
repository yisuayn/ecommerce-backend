const express = require('express');
const router = express.Router();
const categoryController = require('../WebMenu/categoryController');
const newsInfoController = require('../WebMenu/NewsInfoController');
const CarouselController = require('../WebMenu/CarouselController');
const BrandController = require('../WebMenu/BrandController');
const ReviewController = require('../WebMenu/ReviewController');
const ProductController = require('../WebMenu/ProductController');
//主页导航菜单获取
// 获取树形数据
router.get('/getBaseCategoryList', categoryController.getTree);
// 创建分类
router.post('/category', categoryController.create);
// 获取单个分类
router.get('/category/:code', categoryController.getByCode);
// 获取子孙分类
router.get('/category/:code/descendants', categoryController.getDescendants);
// 更新分类
router.put('/category/:code', categoryController.update);
// 删除分类
router.delete('/category/:code', categoryController.delete);

//获取相关资讯信息
router.get('/getNewsInfo', newsInfoController.getGroupedNews);

// 获取首页轮播图
router.get('/getCarousel', CarouselController.getActiveCarousels);

// ========== 产品搜索接口（网站展示） ==========
router.get('/getProductList',ProductController.getProductList)

// ========== 产品前端接口（网站展示） ==========
router.get('/productlist', ProductController.getHomeProducts);           // 首页推荐
router.get('/seckill', ProductController.getSeckillProducts);     // 秒杀产品
// router.get('/list', ProductController.getProductList);            // 产品列表（分页）
router.get('/ProductDetail/:id', ProductController.getProductDetail);    // 产品详情
router.get('/sku/:skuCode', ProductController.getProductBySku);   // 根据SKU查询

// ========== 产品后台管理接口 ==========
router.get('/admin/list', ProductController.getAllProducts);      // 管理列表
router.get('/admin/statistics', ProductController.getStatistics); // 统计数据
router.post('/admin', ProductController.createProduct);           // 创建
router.put('/admin/:id', ProductController.updateProduct);        // 更新
router.delete('/admin/:id', ProductController.deleteProduct);     // 删除
router.post('/admin/batch/delete', ProductController.batchDeleteProducts);    // 批量删除
router.put('/admin/batch/status', ProductController.batchUpdateStatus);      // 批量更新状态
router.put('/admin/:id/stock', ProductController.updateStock);    // 更新库存

// 产品品牌功能前端接口
router.get('/list', BrandController.getAllBrands);
router.get('/hot', BrandController.getHotBrands);
router.get('/detail/:id', BrandController.getBrandDetail);
// 产品品牌功能后台管理接口
router.get('/admin/list', BrandController.getAllBrandsAdmin);
router.get('/admin/statistics', BrandController.getStatistics);
router.post('/admin', BrandController.createBrand);
router.put('/admin/:id', BrandController.updateBrand);
router.delete('/admin/:id', BrandController.deleteBrand);
router.post('/admin/batch/delete', BrandController.batchDeleteBrands);


// 产品评论前端接口
router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/detail/:id', ReviewController.getReviewDetail);
router.post('/', ReviewController.createReview);
router.post('/:id/like', ReviewController.likeReview);

// 产品评论商家回复
router.post('/:id/reply', ReviewController.replyReview);

// 产品评论后台管理接口
router.get('/admin/list', ReviewController.getAllReviews);
router.get('/admin/statistics', ReviewController.getStatistics);
router.put('/admin/batch/status', ReviewController.batchUpdateStatus);
router.post('/admin/batch/delete', ReviewController.batchDeleteReviews);



module.exports = router;