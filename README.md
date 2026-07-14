# 🛒 电商后台管理系统

基于 **Node.js + Express + Sequelize + SQL Server** 构建的电商后台 API 服务，提供商品管理、品牌管理、分类管理、评价管理、轮播图、资讯、用户认证等完整功能。

---

## 📋 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量说明](#环境变量说明)
- [项目结构](#项目结构)
- [模块说明](#模块说明)
- [API 总览](#api-总览)
- [数据模型](#数据模型)
- [开发说明](#开发说明)
- [已知问题](#已知问题)

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | ≥ 18.x |
| 框架 | Express | ^5.2.1 |
| ORM | Sequelize | ^6.37.8 |
| 数据库 | SQL Server（mssql + tedious） | — |
| 认证 | JWT（jsonwebtoken） | ^9.0.3 |
| 密码加密 | bcryptjs | ^3.0.3 |
| 参数验证 | express-validator | ^7.3.2 |

---

## 快速开始

### 前置要求

- Node.js ≥ 18.x
- SQL Server 数据库
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd ecommerce-backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 复制以下内容创建 .env 文件，按实际情况修改数据库连接信息
```

### 启动服务

```bash
# 生产启动
node app.js

# 开发热重载（需要 nodemon）
npx nodemon app.js
```

启动后默认监听 `http://localhost:3000`。

---

## 环境变量说明

在项目根目录创建 `.env` 文件：

```env
# 服务配置
PORT=3000
NODE_ENV=development

# 数据库配置（SQL Server）
DB_HOST=localhost
DB_PORT=1433
DB_NAME=chengyue
DB_USER=sa
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 密码加密
BCRYPT_SALT_ROUNDS=10
```

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `NODE_ENV` | 否 | development | 环境模式 |
| `DB_HOST` | 是 | localhost | 数据库主机 |
| `DB_PORT` | 否 | 1433 | 数据库端口 |
| `DB_NAME` | 是 | — | 数据库名 |
| `DB_USER` | 是 | — | 数据库用户 |
| `DB_PASSWORD` | 是 | — | 数据库密码 |
| `JWT_SECRET` | 是 | — | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 否 | 7d | Token 有效期 |
| `BCRYPT_SALT_ROUNDS` | 否 | 10 | 加密盐轮数 |

---

## 项目结构

```
ecommerce-backend/
├── app.js                          # 应用入口
├── package.json                    # 依赖与脚本
├── .env                            # 环境变量配置
├── API_DOCUMENT.md                 # API 接口文档
├── config/
│   └── database.js                 # Sequelize 数据库连接配置
├── middleware/
│   ├── authMiddleware.js           # JWT 认证中间件
│   └── validateMiddleware.js       # 请求参数验证中间件
├── routes/
│   ├── category.js                 # 主路由（分类/产品/品牌/评价/轮播图/资讯）
│   └── authRoutes.js               # 认证路由（注册/登录/登出/获取用户）
├── WebMenu/
│   ├── category.js                 # 分类 Sequelize 模型
│   ├── categoryController.js       # 分类控制器
│   ├── NewsInfo.js                 # 资讯 Sequelize 模型
│   ├── NewsInfoController.js       # 资讯控制器
│   ├── Carousel.js                 # 轮播图 Sequelize 模型
│   ├── CarouselController.js       # 轮播图控制器
│   ├── BrandController.js          # 品牌控制器
│   ├── ReviewController.js         # 评价控制器
│   ├── ProductController.js        # 产品控制器
│   └── authController.js           # 认证控制器
├── services/
│   ├── categoryService.js          # 分类业务逻辑
│   ├── ProductService.js           # 产品业务逻辑
│   ├── BrandService.js             # 品牌业务逻辑
│   ├── ReviewService.js            # 评价业务逻辑
│   ├── CarouselService.js          # 轮播图业务逻辑
│   └── NewsInfoService.js          # 资讯业务逻辑
├── module/
│   ├── ProductModule/
│   │   ├── index.js                # 产品模块模型导出与关联
│   │   ├── Product.js              # 产品模型（product 表）
│   │   ├── ProductBrand.js         # 品牌模型（product_brand 表）
│   │   └── ProductReview.js        # 评价模型（product_review 表）
│   └── UserModule/
│       └── User.js                 # 用户模型（Users 表）
└── utils/
    ├── crypto.js                   # 密码加密/验证（bcryptjs）
    └── jwt.js                      # JWT 生成/验证
```

---

## 模块说明

### 认证模块

用户注册、登录、登出及获取当前用户信息。使用 JWT Bearer Token 认证。

- 密码通过 bcryptjs 加密存储
- Token 有效期 7 天（可通过 `JWT_EXPIRES_IN` 配置）
- 支持用户名、邮箱、手机号三种登录方式

### 分类管理

支持无限级树形分类结构，通过业务编码（`code`）、父级编码（`parent_code`）、层级（`level`）和路径（`path`）实现。

- 创建时自动生成业务编码
- 支持修改父级分类，自动递归更新子分类的层级和路径
- 删除为软删除（设置 `is_active=0`），有子分类时禁止删除

### 产品管理

完整的商品管理功能，包括前端展示和后台管理两套接口。

**前端接口：**
- 首页推荐（热销、新品、推荐各 10 条）
- 秒杀产品（自动按时间范围筛选）
- 产品搜索（支持分类、品牌、关键词、价格范围、排序）
- 产品详情（含品牌关联，自动增加浏览次数）
- SKU 查询

**后台接口：**
- 产品 CRUD（SKU 唯一性校验）
- 批量操作（删除/更新状态）
- 库存管理（支持加减库存，防止负库存）
- 数据统计

### 品牌管理

品牌与产品为 1:N 关联关系。

**前端接口：**
- 所有品牌列表
- 热门品牌（按关联产品数排序）
- 品牌详情（含分页产品列表）

**后台接口：**
- 品牌 CRUD（品牌名称唯一性校验）
- 批量删除
- 数据统计
- 删除时校验是否有产品关联

### 评价管理

**前端接口：**
- 产品评价列表（支持评分筛选、有图筛选）
- 评价详情
- 创建评价（同一用户对同一产品不可重复评价，自动更新产品评分）
- 点赞评价
- 商家回复

**后台接口：**
- 评价管理列表（多维度筛选）
- 批量审核（通过/屏蔽/待审核）
- 批量删除（自动重新计算产品评分）
- 数据统计

### 轮播图

仅前端展示接口已注册路由，后台管理接口在 Controller/Service 层已完整实现但**暂未注册路由**。

### 资讯管理

支持三种类型：热门（`hot`）、公告（`notice`）、促销（`promotion`）。

仅前端分组新闻接口已注册路由，后台管理接口在 Controller/Service 层已完整实现但**暂未注册路由**。

---

## API 总览

完整接口文档详见 [`API_DOCUMENT.md`](./API_DOCUMENT.md)，此处仅做快速索引。

### 系统

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | API 根路由 |
| GET | `/health` | 健康检查 |

### 认证（`/api/auth`）

| 方法 | 路径 | 需认证 | 说明 |
|------|------|--------|------|
| POST | `/api/auth/register` | 否 | 用户注册 |
| POST | `/api/auth/login` | 否 | 用户登录 |
| POST | `/api/auth/logout` | 否 | 退出登录 |
| GET | `/api/auth/me` | 是 | 获取当前用户 |

### 分类（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/getBaseCategoryList` | 获取分类树 |
| POST | `/api/category` | 创建分类 |
| GET | `/api/category/:code` | 获取单个分类 |
| GET | `/api/category/:code/descendants` | 获取子孙分类 |
| PUT | `/api/category/:code` | 更新分类 |
| DELETE | `/api/category/:code` | 删除分类 |

### 产品 — 前端（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/productlist` | 首页推荐（hot/new/recommend） |
| GET | `/api/seckill` | 秒杀产品 |
| GET | `/api/getProductList` | 产品搜索/分页列表 |
| GET | `/api/ProductDetail/:id` | 产品详情 |
| GET | `/api/sku/:skuCode` | 根据 SKU 查询 |

### 产品 — 后台（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/list` | 管理列表 |
| GET | `/api/admin/statistics` | 统计数据 |
| POST | `/api/admin` | 创建产品 |
| PUT | `/api/admin/:id` | 更新产品 |
| DELETE | `/api/admin/:id` | 删除产品（软删除） |
| POST | `/api/admin/batch/delete` | 批量删除 |
| PUT | `/api/admin/batch/status` | 批量更新状态 |
| PUT | `/api/admin/:id/stock` | 更新库存 |

### 品牌 — 前端（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/list` | 所有品牌 |
| GET | `/api/hot` | 热门品牌 |
| GET | `/api/detail/:id` | 品牌详情（含产品） |

### 品牌 — 后台（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/list` | 管理列表 |
| GET | `/api/admin/statistics` | 统计数据 |
| POST | `/api/admin` | 创建品牌 |
| PUT | `/api/admin/:id` | 更新品牌 |
| DELETE | `/api/admin/:id` | 删除品牌（物理删除） |
| POST | `/api/admin/batch/delete` | 批量删除 |

### 评价 — 前端（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/product/:productId` | 产品评价列表 |
| GET | `/api/detail/:id` | 评价详情 |
| POST | `/api/` | 创建评价 |
| POST | `/api/:id/like` | 点赞评价 |
| POST | `/api/:id/reply` | 商家回复 |

### 评价 — 后台（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/list` | 评价管理列表 |
| GET | `/api/admin/statistics` | 统计数据 |
| PUT | `/api/admin/batch/status` | 批量审核 |
| POST | `/api/admin/batch/delete` | 批量删除 |

### 轮播图（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/getCarousel` | 获取启用的轮播图 |

### 资讯（`/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/getNewsInfo` | 获取分组新闻（首页用） |

---

## 数据模型

系统包含以下 7 张数据表：

| 表名 | 模型文件 | 说明 |
|------|---------|------|
| `Users` | `module/UserModule/User.js` | 用户表 |
| `product` | `module/ProductModule/Product.js` | 产品表 |
| `product_brand` | `module/ProductModule/ProductBrand.js` | 品牌表 |
| `product_review` | `module/ProductModule/ProductReview.js` | 评价表 |
| `category` | `WebMenu/category.js` | 分类表 |
| `carousel` | `WebMenu/Carousel.js` | 轮播图表 |
| `news` | `WebMenu/NewsInfo.js` | 资讯表 |

模型关联关系：

```
Product (product) ───belongsTo───▶ ProductBrand (product_brand)
       │                                    │
       │                                    │
       ▼                                    ▼
ProductReview (product_review)    ProductBrand ──hasMany──▶ Product
```

---

## 开发说明

### 脚本命令

```bash
npm test          # 运行测试（当前未配置）
```

### 项目风格

- **响应格式**：统一使用 `{ code, data, message }` 格式（认证模块使用 `{ success, message, data }`）
- **命名规范**：Sequelize 模型字段使用 camelCase，数据库列使用 snake_case（通过 `field` 映射）
- **数据验证**：使用 `express-validator` 在路由层进行入参校验
- **错误处理**：全局错误中间件捕获未处理异常

### 数据库

- 数据库为 SQL Server，通过 Sequelize ORM 连接
- 服务启动时自动调用 `sequelize.sync({ alter: false })` 同步模型
- 如需自动修改表结构（开发环境），可将 `alter` 改为 `true`

---

## 已知问题

### ⚠️ 路由路径冲突

`routes/category.js` 中，产品、品牌、评价三个模块的后台管理接口使用了一致的路径前缀：

```
/admin/list        → 产品/品牌/评价共用
/admin/statistics  → 产品/品牌/评价共用
/admin/batch/delete → 产品/品牌/评价共用
/admin             → 产品和品牌共用（POST）
/admin/:id         → 产品和品牌共用（PUT/DELETE）
```

由于 Express 路由**后注册覆盖先注册**，实际生效顺序为：产品 ❌ → 品牌 ❌ → 评价 ✅（最后注册的评论处理器生效）。

**建议修复方案**：将各模块后台接口路径按模块拆分：
```
/api/admin/product/list
/api/admin/product/statistics
/api/admin/brand/list
/api/admin/review/list
...
```

### 🔌 未注册的管理接口

以下接口在 Controller 和 Service 层已完整实现，但**未在路由中注册**，无法通过 HTTP 调用：

- **轮播图后台管理**：列表、详情、创建、更新、删除、批量操作、排序、统计
- **资讯后台管理**：列表、详情、创建、更新、删除、批量操作、统计

如需启用，在 `routes/category.js` 中添加对应路由即可。

---

## 许可证

ISC
