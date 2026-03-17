# 文件管理系统配置

## 概述

本配置定义智能体如何为每个新项目自动生成文件夹结构，包括自动编号规则、文件命名规范、权限管理和版本控制。

---

## 1. 文件夹结构设计

### 1.1 智能体自动编号规则

**核心原则**：智能体根据工作流程顺序自动编号，无需人工预设模板。

#### 编号逻辑

```javascript
// 智能体创建项目文件夹时的自动编号算法
function generateFolderStructure(projectType) {
  // 1. 项目公共文件夹始终为 00
  const folders = [
    { prefix: '00', name: '项目公共', order: 0 }
  ];
  
  // 2. 根据项目类型获取部门参与顺序
  const departmentOrder = getDepartmentOrderByWorkflow(projectType);
  
  // 3. 为部门分配编号（从 01 开始）
  departmentOrder.forEach((dept, index) => {
    folders.push({
      prefix: String(index + 1).padStart(2, '0'),
      name: dept,
      order: index + 1
    });
  });
  
  return folders;
}
```

#### 工作流程类型定义

| 工作流程类型 | 代码 | 部门顺序 |
|-------------|------|---------|
| 硬件产品开发 | `hardware_product` | 产品部 → 项目部 → 软件部 → 硬件部 → 结构部 |
| 纯软件开发 | `software_only` | 产品部 → 项目部 → 软件部 |
| 硬件开发 | `hardware_only` | 产品部 → 项目部 → 硬件部 → 结构部 |
| 结构设计 | `structure_only` | 产品部 → 项目部 → 结构部 |

#### 生成的文件夹结构示例

**硬件产品开发流程**：
```
{项目名称}/
├── 00-项目公共/
│   ├── 01-项目立项/
│   ├── 02-项目计划/
│   ├── 03-会议纪要/
│   └── 04-变更日志/
├── 01-产品部/
│   ├── 01-市场需求/
│   ├── 02-PRD/
│   ├── 03-竞品分析/
│   └── 04-评审记录/
├── 02-项目部/
│   ├── 01-项目计划/
│   ├── 02-风险管理/
│   ├── 03-进度报告/
│   └── 04-验收文档/
├── 03-软件部/
│   ├── 01-需求分析/
│   ├── 02-设计文档/
│   ├── 03-API 文档/
│   ├── 04-版本发布/
│   └── 05-代码评审/
├── 04-硬件部/
│   ├── 01-原理图/
│   ├── 02-PCB 设计/
│   ├── 03-BOM 表/
│   ├── 04-测试报告/
│   └── 05-问题跟踪/
└── 05-结构部/
    ├── 01-ID 设计/
    ├── 02-结构设计/
    ├── 03-模具开发/
    └── 04-手板管理/
```

**纯软件开发流程**：
```
{项目名称}/
├── 00-项目公共/
├── 01-产品部/
├── 02-项目部/
└── 03-软件部/
```

---

## 2. 文件命名规范

### 2.1 命名格式

```
{文档类型}_{版本号}_{创建者}_{日期}.{扩展名}

日期格式：YYYYMMDD
版本号格式：v{主版本}.{次版本}.{修订号}
```

### 2.2 智能体自动补全逻辑

```javascript
// 智能体创建文件时自动命名
async function generateFileName(docType, creator, projectId) {
  // 1. 获取当前日期
  const date = formatDate(new Date(), 'YYYYMMDD');
  
  // 2. 查询下一版本号
  const version = await getNextVersion(projectId, docType);
  
  // 3. 生成文件名
  const fileName = `${docType}_v${version}_${creator}_${date}.docx`;
  
  return fileName;
}

// 示例输出：
// PRD_v1.0_张三_20260317.docx
// GPIO 配置表_v2.3_李四_20260317.xlsx
// 测试报告_EVT_v1.0_王五_20260317.pdf
```

### 2.3 文档类型枚举

| 代码 | 名称 | 适用部门 |
|------|------|---------|
| `PRD` | 产品需求文档 | 产品部 |
| `MRD` | 市场需求文档 | 产品部 |
| `竞品分析` | 竞品分析报告 | 产品部 |
| `立项书` | 项目立项书 | 项目部 |
| `可行性报告` | 可行性分析报告 | 项目部 |
| `项目章程` | 项目章程 | 项目部 |
| `项目计划` | 项目进度计划 | 项目部 |
| `设计文档` | 系统设计文档 | 软件部 |
| `API 文档` | API 接口文档 | 软件部 |
| `版本发布` | 版本发布说明 | 软件部 |
| `原理图` | 电路原理图 | 硬件部 |
| `PCB 设计` | PCB 设计文件 | 硬件部 |
| `BOM 表` | 物料清单 | 硬件部 |
| `测试报告` | 测试报告 | 硬件部/测试部 |
| `ID 设计` | 工业设计文档 | 结构部 |
| `结构设计` | 结构设计文档 | 结构部 |
| `模具开发` | 模具开发文档 | 结构部 |
| `会议纪要` | 会议纪要 | 全部 |
| `变更申请` | 变更申请单 | 全部 |

---

## 3. 文件元数据管理

### 3.1 文件索引数据结构

```json
{
  "file_id": "uuid-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "file_path": "项目 A/01-产品部/PRD_v1.0_张三_20260317.docx",
  "project_name": "项目 A",
  "doc_type": "PRD",
  "department": "产品部",
  "version": "v1.0",
  "creator": "张三",
  "creator_id": "zhangsan@company.com",
  "created_at": "2026-03-17T10:30:00+08:00",
  "updated_at": "2026-03-17T10:30:00+08:00",
  "status": "草稿",
  "tags": ["需求", "V1"],
  "related_files": [],
  "file_size": 102400,
  "checksum": "sha256:xxxxx",
  "is_latest": true,
  "git_commit_hash": "abc123..."
}
```

### 3.2 文件索引存储

- **存储位置**: GitHub 仓库 `/file-index/index.json`
- **更新方式**: 智能体每次创建/更新文件时自动更新索引
- **查询接口**: 智能体通过索引快速定位文件

---

## 4. 文件访问权限设计

### 4.1 权限模型

```
┌─────────────────────────────────────────┐
│  项目级权限                              │
│  - 项目成员：完整访问（创建/编辑/删除）  │
│  - 相关部门：只读本部门 + 公共文件夹     │
│  - 管理层：只读全部                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  部门级权限                              │
│  - 本部门成员：创建 + 编辑               │
│  - 智能体：仅创建                        │
│  - 其他部门：只读                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  文件级权限                              │
│  - 草稿：仅创建者可编辑                  │
│  - 已发布：只读，不可修改                │
│  - 机密：仅指定人员可访问                │
└─────────────────────────────────────────┘
```

### 4.2 智能体权限

| 操作 | 权限 | 说明 |
|------|------|------|
| 创建文件夹 | ✅ 允许 | 项目创建时自动生成 |
| 创建文件 | ✅ 允许 | 用户确认后执行 |
| 读取文件 | ✅ 允许 | 用于提供修改建议 |
| 编辑文件 | ⚠️ 受限 | 需用户确认修改建议后执行 |
| 删除文件 | ❌ 禁止 | 只能由人工操作 |

### 4.3 智能体编辑文档流程

```
1. 用户请求：「帮我优化 PRD 第 3 章」
        ↓
2. 智能体读取当前文档内容
        ↓
3. 智能体分析并生成修改建议（diff 格式）
        ↓
4. 展示建议给用户，等待确认
        ↓
5. 用户点击「采纳修改」
        ↓
6. 智能体执行修改，提交新版本
        ↓
7. 更新文件索引
```

---

## 5. 版本管理策略

### 5.1 版本规则

| 场景 | 策略 | 说明 |
|------|------|------|
| 草稿阶段 | 覆盖原文件 | 文件名不变，内容更新 |
| 已发布文档 | 创建新版本 | v1.0 → v1.1，保留历史 |
| 重大变更 | 创建新版本 + 变更日志 | v1.0 → v2.0 |
| 智能体生成 | 创建新版本 | 保留人工修改痕迹 |

### 5.2 文件夹显示规则

- **文件夹内**：只显示最新版本文件
- **历史记录**：通过 Git history 查询
- **版本找回**：智能体从 Git history 恢复指定版本

### 5.3 版本命名规范

```
v{主版本}.{次版本}.{修订号}

- 主版本：重大变更（需求变化、架构调整）
- 次版本：功能增加（新增章节、新增数据）
- 修订号：小修正（错别字、格式调整）
```

---

## 6. 文件删除与回收站

### 6.1 删除流程

```
用户删除 → 移动到 .trash/ 文件夹 → 记录删除日志 → 30 天后自动清理
```

**无需审批**，回收站保留 30 天足够用户找回。

### 6.2 回收站结构

```
{项目文件夹}/.trash/
├── 2026-03-17_PRD_张三_deleted.json
├── 2026-03-18_测试报告_李四_deleted.json
└── ...
```

### 6.3 删除记录格式

```json
{
  "original_path": "01-产品部/PRD_v1.0_张三_20260310.docx",
  "deleted_by": "张三",
  "deleted_by_id": "zhangsan@company.com",
  "deleted_at": "2026-03-17T11:30:00+08:00",
  "reason": "重复文件",
  "auto_delete_at": "2026-04-16T11:30:00+08:00",
  "file_snapshot": {
    "version": "v1.0",
    "size": 102400,
    "checksum": "sha256:xxxxx"
  }
}
```

### 6.4 找回机制

```
用户：「恢复删除的 PRD 文档」
  ↓
智能体查询 .trash/ 文件夹
  ↓
列出最近删除的文件（30 天内）
  ↓
用户选择要恢复的文件
  ↓
智能体将文件移回原路径
```

### 6.5 自动清理任务

使用 GitHub Actions 每天凌晨 2 点清理超过 30 天的文件：

```yaml
# .github/workflows/cleanup-trash.yml
name: 清理回收站
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 删除超过 30 天的文件
        run: |
          # 检查 .trash/ 中每个文件的删除时间
          # 超过 30 天的执行 git rm 并提交
```

---

## 7. 智能体使用文件历史

### 7.1 使用场景

#### 场景 1：生成新文档时参考历史
```
任务：「生成 PRD v2.0」
  ↓
读取 PRD v1.0
读取相关会议纪要
读取市场需求变更
  ↓
生成 PRD v2.0 草稿，标注变更部分
```

#### 场景 2：提供修改建议
```
任务：「评审软件设计文档」
  ↓
读取 PRD（需求来源）
读取历史设计文档（类似项目参考）
读取 API 文档（依赖接口）
  ↓
输出评审意见：「第 3 章与 PRD 第 5.2 节需求不一致...」
```

#### 场景 3：追溯决策依据
```
用户问：「为什么 GPIO 引脚分配是这样？」
  ↓
智能体查询文件索引
找到「GPIO 配置评审会议纪要」
找到「硬件部设计说明 v1.3」
  ↓
回复：「根据 2026-03-10 的评审会议，由于...」
```

### 7.2 智能体检索接口

```javascript
// 智能体工具函数
async function searchProjectFiles(projectName, filters) {
  // filters 示例：
  // { doc_type: 'PRD', department: '产品部', min_version: 'v1.0' }
  
  // 1. 查询文件索引
  const files = await queryFileIndex({ project: projectName, ...filters });
  
  // 2. 从 GitHub 读取内容
  const contents = await Promise.all(
    files.map(f => github.getFile(f.path))
  );
  
  // 3. 返回给智能体作为上下文
  return contents;
}
```

---

## 8. 技术实现

### 8.1 文件系统抽象层

```javascript
// 定义统一接口，底层可切换实现（GitHub/飞书）
class FileSystem {
  async createFolder(path) { }
  async createFile(path, content) { }
  async readFile(path) { }
  async updateFile(path, content) { }
  async deleteFile(path) { }
  async listFiles(folderPath) { }
  async getPermissions(path) { }
  async setPermissions(path, permissions) { }
}

// GitHub 实现（当前使用）
class GitHubFileSystem extends FileSystem {
  // 使用 GitHub API 实现
}

// 飞书实现（未来扩展）
class FeishuFileSystem extends FileSystem {
  // 使用 feishu_drive 工具实现
}

// 配置切换
const fileSystem = config.storage.provider === 'feishu'
  ? new FeishuFileSystem()
  : new GitHubFileSystem();
```

### 8.2 配置文件

```json
{
  "storage": {
    "provider": "github",
    "github": {
      "repo": "zeonzeon123123123-png/XC-Process-Intelligent-Agent",
      "branch": "main",
      "basePath": "projects"
    },
    "feishu": {
      "folderToken": "",
      "driveType": "normal"
    }
  },
  "fileManagement": {
    "autoNumbering": true,
    "versioning": {
      "enabled": true,
      "maxHistoryVersions": 10,
      "retentionDays": 365
    },
    "trash": {
      "enabled": true,
      "retentionDays": 30
    }
  }
}
```

---

## 9. 落地路线图

### 阶段一：基础框架（1 周）
- [ ] 实现智能体自动编号逻辑
- [ ] 创建项目文件夹模板生成器
- [ ] 实现文件命名自动补全
- [ ] 创建文件索引数据结构

### 阶段二：权限与流程（1-2 周）
- [ ] 实现文件权限自动配置
- [ ] 实现文件删除与回收站
- [ ] 实现文件创建审计日志
- [ ] 配置 GitHub Actions 自动清理任务

### 阶段三：智能体集成（2-3 周）
- [ ] 实现智能体读取文件历史能力
- [ ] 实现智能体提供修改建议并自动执行
- [ ] 实现智能体自动归档功能
- [ ] 实现文件索引查询接口

---

## 10. 附录

### 10.1 工作流程类型详细定义

```json
{
  "hardware_product": {
    "name": "硬件产品开发",
    "description": "完整的硬件产品开发流程，包含所有部门",
    "departmentOrder": ["产品部", "项目部", "软件部", "硬件部", "结构部"],
    "subfolders": {
      "产品部": ["市场需求", "PRD", "竞品分析", "评审记录"],
      "项目部": ["项目计划", "风险管理", "进度报告", "验收文档"],
      "软件部": ["需求分析", "设计文档", "API 文档", "版本发布", "代码评审"],
      "硬件部": ["原理图", "PCB 设计", "BOM 表", "测试报告", "问题跟踪"],
      "结构部": ["ID 设计", "结构设计", "模具开发", "手板管理"]
    }
  },
  "software_only": {
    "name": "纯软件开发",
    "description": "仅涉及软件开发的流程",
    "departmentOrder": ["产品部", "项目部", "软件部"],
    "subfolders": {
      "产品部": ["市场需求", "PRD", "竞品分析", "评审记录"],
      "项目部": ["项目计划", "风险管理", "进度报告", "验收文档"],
      "软件部": ["需求分析", "设计文档", "API 文档", "版本发布", "代码评审"]
    }
  }
}
```

### 10.2 文档类型与部门映射

| 文档类型 | 主责部门 | 协作部门 |
|---------|---------|---------|
| PRD | 产品部 | 项目部、软件部、硬件部 |
| 立项书 | 项目部 | 产品部 |
| 设计文档 | 软件部 | 硬件部 |
| 原理图 | 硬件部 | 软件部 |
| 测试报告 | 硬件部 | 软件部、结构部 |
| ID 设计 | 结构部 | 产品部 |

---

**文档版本**: v1.0  
**创建日期**: 2026-03-17  
**最后更新**: 2026-03-17  
**维护者**: 智能体系统团队
