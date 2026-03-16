# GitHub 仓库更新指南

## 📋 更新内容概览

本次更新为 **v2.0.0** 版本，主要新增以下功能：

### 新增功能

1. **用户注册与登录模块**
   - 注册页面字段：姓名、所在部门、职务、密码、工号、邮箱、手机号、直接上级
   - 登录认证（JWT + bcrypt 加密）
   - 基于角色的权限控制（RBAC）

2. **企业通讯录**
   - 模仿飞书通讯录界面设计
   - 上下级关系可视化
   - 上级可查看下属的智能体使用情况
   - 支持部门筛选、搜索

3. **Token 统计平台**
   - 个人 Token 使用统计（普通员工仅查看自己）
   - 团队 Token 统计（主管查看下属）
   - 部门 Token 统计（部门经理查看本部门）
   - 全公司统计（总经理查看所有人，支持搜索查询）
   - 部门 Token 用量实时排序
   - 活跃度分析（DAU/WAU/MAU）

4. **数据库设计**
   - 用户信息表（users）
   - 部门架构表（departments）
   - Token 使用记录表（token_usage）
   - Token 统计表（token_stats）
   - 部门 Token 统计表（department_token_stats）
   - 登录日志表（login_logs）
   - 操作审计日志表（audit_logs）

---

## 🔄 更新 GitHub 仓库步骤

### 方法一：手动上传（推荐）

1. **访问 GitHub 仓库**
   ```
   https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent
   ```

2. **上传 README.md**
   - 点击仓库根目录的 `Add file` → `Upload files`
   - 选择本地文件：`/home/jun/.openclaw/workspace/XC-Process-Intelligent-Agent/README.md`
   - 添加提交信息：`feat: 更新 README 文档（v2.0.0）`
   - 点击 `Commit changes`

3. **上传数据库脚本**
   - 创建 `database` 文件夹（如果不存在）
   - 上传文件：`/home/jun/.openclaw/workspace/XC-Process-Intelligent-Agent/database/schema.sql`
   - 添加提交信息：`feat: 添加数据库表结构（v2.0.0）`
   - 点击 `Commit changes`

### 方法二：使用 Git 命令（如果你本地有仓库）

```bash
# 进入仓库目录
cd /home/jun/.openclaw/workspace/XC-Process-Intelligent-Agent

# 初始化 Git（如果是新仓库）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 新增用户管理系统、通讯录、Token 统计功能（v2.0.0）"

# 关联远程仓库（如果尚未关联）
git remote add origin https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent.git

# 推送到 GitHub
git push -u origin main
```

---

## 📁 需要上传的文件

| 文件路径 | 说明 | 优先级 |
|----------|------|--------|
| `README.md` | 项目说明文档（包含新功能说明） | P0 |
| `database/schema.sql` | 数据库表结构 | P0 |
| `docs/architecture.md` | 系统架构设计（待创建） | P1 |
| `docs/api-reference.md` | API 接口文档（待创建） | P1 |
| `docs/deployment.md` | 部署指南（待创建） | P1 |
| `docs/user-guide.md` | 用户手册（待创建） | P2 |

---

## ✏️ 飞书文档已更新

飞书设计文档已同步更新，包含以下内容：

- **文档链接**: https://sharetronic.feishu.cn/docx/XXlldlw2Qo1h4txoj6wcOHyBnNf
- **更新章节**:
  - 第十三章：智能体平台用户管理系统设计
    - 13.1 用户注册与登录模块
    - 13.2 通讯录模块设计
    - 13.3 Token 统计模块设计
    - 13.4 智能体使用活跃度统计
    - 13.5 安全与隐私保护
  - 第十四章：GitHub 仓库配置说明
  - 第十五章：实施优先级与里程碑

---

## 🔍 验证清单

更新完成后，请验证以下内容：

- [ ] GitHub 仓库 README.md 已更新
- [ ] 数据库脚本 schema.sql 已上传
- [ ] 飞书文档已包含新增章节
- [ ] 注册页面字段完整（姓名、部门、职务、密码等）
- [ ] 通讯录界面设计完成
- [ ] Token 统计页面权限逻辑清晰
- [ ] 部门 Token 实时排序算法正确

---

## 📞 需要帮助？

如有问题，请通过以下方式联系：

- **GitHub Issues**: https://github.com/zeonzeonzeon123123123-png/XC-Process-Intelligent-Agent/issues
- **飞书文档评论**: 直接在飞书文档中评论

---

**更新时间**: 2026 年 3 月 16 日  
**版本**: v2.0.0
