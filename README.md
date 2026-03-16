# XC-Process-Intelligent-Agent

**研发工作流程智能体系统** - 企业级智能体协作平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%5E18.0-blue.svg)](https://reactjs.org/)

---

## 📖 项目简介

XC-Process-Intelligent-Agent 是一套**行业领先的研发工作流程智能体系统**，专为企业研发团队设计，实现智能体协作、项目管理、测试自动化、文档生成等功能的一体化管理。

### 核心功能

- 🔐 **用户管理系统**
  - 注册页面（姓名、所在部门、职务、密码等完整信息）
  - 登录认证（JWT + bcrypt 加密）
  - 基于角色的权限控制（RBAC）

- 📇 **企业通讯录**
  - 模仿飞书通讯录界面设计
  - 上下级关系可视化
  - 上级可查看下属的智能体使用情况
  - 支持部门筛选、搜索

- 📊 **Token 统计平台**
  - 个人 Token 使用统计（普通员工仅查看自己）
  - 团队 Token 统计（主管查看下属）
  - 部门 Token 统计（部门经理查看本部门）
  - 全公司统计（总经理查看所有人，支持搜索查询）
  - 部门 Token 用量实时排序
  - 活跃度分析（DAU/WAU/MAU）

- 🤖 **9 大专业智能体**
  - 项目智能体（立项→结项全流程协调）
  - 产品智能体（产品提案→PRD 确认）
  - 硬件智能体（SCH/PCB 设计→生产资料）
  - 软件智能体（软件架构→版本发布）
  - 结构智能体（结构设计→模具验收）
  - 包装智能体（包装设计→包材采购）
  - 测试智能体（EVT/DVT/PVT 验证）
  - 工厂智能体（试产安排→量产爬坡）
  - 评审智能体（评审流程标准化）

- 📈 **数据可视化**
  - Token 使用趋势图
  - 部门用量排行榜
  - 用户活跃度分析
  - 智能体使用渗透率

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 登录/注册    │  │ 通讯录      │  │ Token 统计   │   ← 前端页面 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API 网关层                               │  │
│  │  • 身份认证  • 权限验证  • 请求限流  • 日志记录            │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ 用户服务    │  │ Token 服务       │  │ 智能体服务      │     │
│  └─────────────┘  └─────────────────┘  └─────────────────┘     │
│                           ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      数据存储层                            │  │
│  │  • MySQL（用户/部门/Token 记录）                            │  │
│  │  • Redis（缓存/会话）                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0 | 运行环境 |
| MySQL | >= 8.0 | 主数据库 |
| Redis | >= 6.0 | 缓存/会话 |
| npm | >= 9.0 | 包管理器 |

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent.git
cd XC-Process-Intelligent-Agent
```

#### 2. 安装依赖

```bash
# 安装后端依赖
cd src/backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 3. 配置环境变量

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑 .env 文件，配置以下参数
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xc_process_agent

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 智能体配置
OPENCLAW_API_KEY=your_api_key
OPENCLAW_BASE_URL=https://api.openclaw.ai
```

#### 4. 初始化数据库

```bash
# 执行数据库初始化脚本
npm run db:init

# 或手动执行
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

#### 5. 启动服务

```bash
# 开发模式（前后端同时启动）
npm run dev

# 或分别启动
# 后端
cd src/backend
npm run dev

# 前端
cd src/frontend
npm start
```

#### 6. 访问系统

打开浏览器访问：`http://localhost:3000`

---

## 👥 用户角色说明

| 角色 | 权限说明 | Token 查看权限 |
|------|----------|----------------|
| 🟢 普通员工 | 无下属员工 | 仅查看自己的 Token 使用情况 |
| 🔵 主管 | 有直接下属 | 查看自己及直接下属的 Token 使用情况 |
| 🟣 部门经理 | 管理部门 | 查看本部门所有人的 Token 使用情况 |
| 🔴 总经理 | 公司管理层 | 查看全公司所有人的 Token 使用情况（支持搜索查询） |

---

## 📁 项目结构

```
XC-Process-Intelligent-Agent/
├── README.md                    # 项目说明文档
├── LICENSE                      # 开源协议
├── .env.example                 # 环境变量模板
├── docs/                        # 文档目录
│   ├── architecture.md          # 系统架构设计
│   ├── api-reference.md         # API 接口文档
│   ├── deployment.md            # 部署指南
│   └── user-guide.md            # 用户手册
├── src/                         # 源代码目录
│   ├── backend/                 # 后端代码
│   │   ├── controllers/         # 控制器
│   │   │   ├── auth.controller.js      # 认证控制器
│   │   │   ├── user.controller.js      # 用户控制器
│   │   │   ├── token.controller.js     # Token 控制器
│   │   │   └── agent.controller.js     # 智能体控制器
│   │   ├── models/              # 数据模型
│   │   │   ├── user.model.js           # 用户模型
│   │   │   ├── department.model.js     # 部门模型
│   │   │   └── token-usage.model.js    # Token 使用模型
│   │   ├── services/            # 业务逻辑
│   │   │   ├── auth.service.js         # 认证服务
│   │   │   ├── user.service.js         # 用户服务
│   │   │   ├── token.service.js        # Token 服务
│   │   │   └── permission.service.js   # 权限服务
│   │   ├── middleware/          # 中间件
│   │   │   ├── auth.middleware.js      # 认证中间件
│   │   │   ├── permission.middleware.js# 权限验证中间件
│   │   │   └── rate-limit.middleware.js# 限流中间件
│   │   ├── routes/              # 路由
│   │   └── app.js               # 应用入口
│   │
│   ├── frontend/                # 前端代码
│   │   ├── pages/               # 页面组件
│   │   │   ├── login/           # 登录页面
│   │   │   ├── register/        # 注册页面
│   │   │   ├── contacts/        # 通讯录页面
│   │   │   ├── token-stats/     # Token 统计页面
│   │   │   └── dashboard/       # 仪表盘页面
│   │   ├── components/          # 公共组件
│   │   │   ├── Layout/          # 布局组件
│   │   │   ├── Table/           # 表格组件
│   │   │   ├── Chart/           # 图表组件
│   │   │   └── Search/          # 搜索组件
│   │   ├── services/            # API 服务
│   │   ├── utils/               # 工具函数
│   │   └── App.js               # 应用入口
│   │
│   └── shared/                  # 共享代码
│       ├── constants/           # 常量定义
│       └── types/               # 类型定义
│
├── config/                      # 配置文件
│   ├── database.yaml            # 数据库配置
│   ├── auth.yaml                # 认证配置
│   └── token-tracking.yaml      # Token 追踪配置
│
├── database/                    # 数据库脚本
│   ├── schema.sql               # 数据库表结构
│   └── seed.sql                 # 初始数据
│
└── tests/                       # 测试代码
    ├── unit/                    # 单元测试
    └── integration/             # 集成测试
```

---

## 🔌 API 接口

### 认证接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户注册 | POST | `/api/auth/register` | 注册新用户 |
| 用户登录 | POST | `/api/auth/login` | 用户登录 |
| 退出登录 | POST | `/api/auth/logout` | 退出登录 |
| 刷新 Token | POST | `/api/auth/refresh` | 刷新 JWT Token |

### 用户接口

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 获取用户信息 | GET | `/api/users/me` | 登录用户 | 获取当前用户信息 |
| 更新用户信息 | PUT | `/api/users/me` | 登录用户 | 更新个人信息 |
| 获取用户列表 | GET | `/api/users` | 管理员 | 获取用户列表（分页） |
| 获取下属列表 | GET | `/api/users/subordinates` | 主管/经理 | 获取下属列表 |

### Token 统计接口

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 个人统计 | GET | `/api/token/stats/personal` | 登录用户 | 获取个人 Token 统计 |
| 下属统计 | GET | `/api/token/stats/subordinates` | 主管/经理 | 获取下属 Token 统计 |
| 部门统计 | GET | `/api/token/stats/department/:deptId` | 部门经理 | 获取部门 Token 统计 |
| 全公司统计 | GET | `/api/token/stats/company` | 总经理 | 获取全公司统计 |
| 部门排行 | GET | `/api/token/ranking/departments` | 登录用户 | 获取部门排行 |
| 用户排行 | GET | `/api/token/ranking/users` | 登录用户 | 获取用户排行 |
| 搜索用户 | GET | `/api/token/search?keyword=xxx` | 总经理 | 搜索用户 Token 统计 |
| 导出报表 | POST | `/api/token/export` | 部门经理/总经理 | 导出 Excel 报表 |

### 通讯录接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取部门列表 | GET | `/api/departments` | 获取所有部门 |
| 获取部门详情 | GET | `/api/departments/:id` | 获取部门详情及成员 |
| 获取组织架构 | GET | `/api/departments/tree` | 获取树形组织架构 |

---

## 📊 数据库设计

### 核心数据表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户信息表 | user_id, name, email, department_id, manager_id, role |
| `departments` | 部门架构表 | department_id, name, manager_id, parent_department_id |
| `token_usage` | Token 使用记录表 | record_id, user_id, agent_name, total_tokens, request_time |
| `token_stats` | Token 统计表（聚合） | stat_id, stat_date, department_id, user_id, total_tokens |

详细表结构请参考：[database/schema.sql](database/schema.sql)

---

## 🔒 安全策略

### 密码安全

- 密码长度：8-20 位
- 密码复杂度：必须包含字母和数字
- 加密存储：使用 bcrypt 加密
- 登录失败限制：连续 5 次失败后锁定账号 30 分钟

### 数据权限

| 数据类型 | 可见范围 |
|----------|----------|
| 个人 Token 记录 | 本人 + 上级（根据权限） |
| 部门 Token 统计 | 本部门管理层 + 总经理 |
| 全公司 Token 统计 | 仅总经理 |

### 会话管理

- JWT Token 有效期：24 小时
- 会话超时：30 分钟无操作自动登出
- 支持单设备登录/多设备登录配置

---

## 📈 监控与日志

### Token 追踪

- 实时记录每次智能体调用的 Token 用量
- 按用户/部门/智能体维度聚合统计
- 支持按日/周/月时间范围查询

### 系统日志

- 访问日志：记录所有 API 请求
- 错误日志：记录系统异常
- 审计日志：记录敏感操作（登录、权限变更等）

---

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

---

## 📦 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 生产环境部署

详细部署指南请参考：[docs/deployment.md](docs/deployment.md)

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [系统架构设计](./docs/architecture.md) | 详细的系统架构设计文档 |
| [API 接口文档](./docs/api-reference.md) | 完整的 API 接口说明 |
| [部署指南](./docs/deployment.md) | 生产环境部署步骤 |
| [用户手册](./docs/user-guide.md) | 最终用户使用指南 |
| [飞书设计文档](https://sharetronic.feishu.cn/docx/XXlldlw2Qo1h4txoj6wcOHyBnNf) | 详细设计方案（飞书云文档） |

---

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Ant Design 5 |
| **后端** | Node.js 18 + Express + TypeScript |
| **数据库** | MySQL 8.0 + Redis 6.0 |
| **认证** | JWT + bcrypt |
| **智能体框架** | OpenClaw |
| **部署** | Docker + Docker Compose |
| **监控** | Prometheus + Grafana |

---

## 📋 开发规范

### 代码规范

- 遵循 ESLint + Prettier 代码风格
- 提交前运行 `npm run lint` 检查
- 使用 TypeScript 严格模式

### Git 工作流

```bash
# 功能开发
git checkout -b feature/your-feature
git commit -m "feat: add new feature"
git push origin feature/your-feature

# 修复 bug
git checkout -b fix/bug-fix
git commit -m "fix: resolve issue #123"
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- **项目地址**: https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent
- **问题反馈**: https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent/issues
- **设计文档**: https://sharetronic.feishu.cn/docx/XXlldlw2Qo1h4txoj6wcOHyBnNf

---

## 📝 更新日志

### v2.0.0 (2026-03-16)

**新增功能**
- ✨ 用户注册页面（姓名、部门、职务、密码等）
- ✨ 企业通讯录（模仿飞书，支持上下级关系）
- ✨ Token 统计平台（按权限查看，部门实时排行）
- ✨ 活跃度分析（DAU/WAU/MAU）
- ✨ 基于角色的权限控制（RBAC）

**改进**
- 🎨 优化 Token 统计页面 UI
- 🚀 提升部门排行查询性能（Redis 缓存）
- 🔒 增强密码安全策略

### v1.0.0 (2026-03-10)

- 🎉 初始版本发布
- 🤖 9 大专业智能体基础功能

---

**最后更新**: 2026 年 3 月 16 日
