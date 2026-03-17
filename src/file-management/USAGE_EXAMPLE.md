# 文件管理系统使用示例

## 快速开始

### 1. 配置环境

```javascript
const { AgentFileHelper } = require('./AgentFileHelper');

// 加载配置
const config = require('./config.json');  // 从 config.example.json 复制并修改

// 初始化智能体文件助手
const agentHelper = new AgentFileHelper(config);
```

---

## 使用场景

### 场景 1：创建新项目（智能体自动创建文件夹结构）

```javascript
// 用户输入
const projectParams = {
  projectName: '智能手表 X1 开发',
  projectType: 'hardware_product',  // 硬件产品开发流程
  creator: '张三',
  description: '新一代智能手表，支持心率监测和 GPS'
};

// 智能体执行
const result = await agentHelper.createProject(projectParams);

console.log('项目创建成功:', result);
```

**输出**：
```
项目创建成功：{
  success: true,
  projectName: '智能手表 X1 开发',
  projectType: '硬件产品开发',
  basePath: 'projects/智能手表 X1 开发',
  folders: [
    { path: 'projects/智能手表 X1 开发/00-项目公共', name: '项目公共', prefix: '00' },
    { path: 'projects/智能手表 X1 开发/01-产品部', name: '产品部', prefix: '01' },
    { path: 'projects/智能手表 X1 开发/02-项目部', name: '项目部', prefix: '02' },
    { path: 'projects/智能手表 X1 开发/03-软件部', name: '软件部', prefix: '03' },
    { path: 'projects/智能手表 X1 开发/04-硬件部', name: '硬件部', prefix: '04' },
    { path: 'projects/智能手表 X1 开发/05-结构部', name: '结构部', prefix: '05' }
  ],
  createdAt: '2026-03-17T11:30:00.000Z'
}
```

**说明**：
- 智能体根据 `hardware_product` 流程类型自动确定部门顺序
- 自动编号：00-项目公共，01-产品部，02-项目部...
- 每个部门文件夹下自动创建子文件夹（PRD、项目计划等）

---

### 场景 2：创建文档（智能体自动命名）

```javascript
// 用户输入
const docParams = {
  projectId: '智能手表 X1 开发',
  docType: 'PRD',
  department: '产品部',
  content: '# 产品需求文档\n\n## 1. 产品概述...',
  creator: '张三',
  isTemplate: false
};

// 智能体执行
const result = await agentHelper.createDocument(docParams);

console.log('文档创建成功:', result);
```

**输出**：
```
文档创建成功：{
  success: true,
  file_id: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  file_path: 'projects/智能手表 X1 开发/01-产品部/PRD_v1.0_张三_20260317.docx',
  file_name: 'PRD_v1.0_张三_20260317.docx',
  project_name: '智能手表 X1 开发',
  doc_type: 'PRD',
  department: '产品部',
  version: 'v1.0',
  creator: '张三',
  created_at: '2026-03-17T11:30:00.000Z',
  status: '草稿'
}
```

**说明**：
- 用户只需提供文档类型（PRD）
- 智能体自动补全：版本号（v1.0）、创建者（张三）、日期（20260317）
- 文件名格式：`PRD_v1.0_张三_20260317.docx`

---

### 场景 3：更新文档（创建新版本）

```javascript
// 用户输入
const updateParams = {
  fileId: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  content: '# 产品需求文档 v2.0\n\n## 更新内容...',
  updater: '李四',
  isMajorUpdate: true  // 主版本更新
};

// 智能体执行
const result = await agentHelper.fsManager.updateFile(
  updateParams.fileId,
  updateParams.content,
  updateParams.updater,
  updateParams.isMajorUpdate
);

console.log('文档更新成功:', result);
```

**输出**：
```
文档更新成功：{
  file_id: 'uuid-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  file_path: 'projects/智能手表 X1 开发/01-产品部/PRD_v2.0_张三_20260318.docx',
  version: 'v2.0',
  previous_version_id: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  is_latest: true,
  ...
}
```

**说明**：
- 旧版本标记为 `is_latest: false`，但保留在 Git history 中
- 新版本文件名：`PRD_v2.0_张三_20260318.docx`
- 文件夹内只显示最新版本

---

### 场景 4：智能体提供修改建议

```javascript
// 用户请求：「帮我优化 PRD 第 3 章的产品性能指标」
const modifyParams = {
  fileId: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  suggestions: [
    {
      type: 'replace',
      original: '产品续航时间：≥8 小时',
      replacement: '产品续航时间：≥10 小时（典型使用场景）',
      description: '根据竞品分析，建议提升到 10 小时',
      isMajorUpdate: false
    },
    {
      type: 'insert',
      after: '## 3.2 性能指标',
      content: '待机时间：≥72 小时',
      description: '添加待机时间指标'
    }
  ],
  updater: '智能体',
  autoApply: false  // 先展示建议，等待用户确认
};

// 智能体执行
const result = await agentHelper.modifyDocument(modifyParams);

console.log('修改建议:', result);
```

**输出**：
```
修改建议：{
  success: true,
  action: 'pending_approval',
  diffView: {
    summary: '共 2 处修改',
    changes: [
      { type: 'replace', description: '根据竞品分析，建议提升到 10 小时' },
      { type: 'insert', description: '添加待机时间指标' }
    ]
  },
  suggestions: [...],
  fileId: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  currentVersion: 'v1.0'
}
```

**用户确认后自动执行**：
```javascript
// 用户点击「采纳修改」
const applyParams = {
  ...modifyParams,
  autoApply: true  // 自动执行修改
};

const result = await agentHelper.modifyDocument(applyParams);
// 智能体自动创建新版本 v1.1
```

---

### 场景 5：查询项目文件

```javascript
// 查询项目所有最新版本的 PRD 文档
const files = await agentHelper.queryFiles('智能手表 X1 开发', {
  doc_type: 'PRD',
  is_latest: true,
  is_deleted: false
});

console.log('查询结果:', files);
```

**输出**：
```
查询结果：[
  {
    file_id: 'uuid-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
    file_path: 'projects/智能手表 X1 开发/01-产品部/PRD_v2.0_张三_20260318.docx',
    doc_type: 'PRD',
    version: 'v2.0',
    is_latest: true,
    ...
  }
]
```

---

### 场景 6：查看文件历史版本

```javascript
// 查看 PRD 的所有历史版本
const history = await agentHelper.getFileHistory('uuid-yyyy-yyyy-yyyy-yyyyyyyyyyyy');

console.log('历史版本:', history);
```

**输出**：
```
历史版本：[
  {
    file_id: 'uuid-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
    version: 'v2.0',
    created_at: '2026-03-18T10:00:00.000Z',
    creator: '张三',
    is_latest: true
  },
  {
    file_id: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    version: 'v1.0',
    created_at: '2026-03-17T11:30:00.000Z',
    creator: '张三',
    is_latest: false
  }
]
```

---

### 场景 7：恢复历史版本

```javascript
// 用户：「找回 PRD v1.0 版本」
const result = await agentHelper.restoreVersion(
  'uuid-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  'v2.0'
);

console.log('恢复结果:', result);
```

**输出**：
```
恢复结果：{
  success: true,
  restoredVersion: 'v2.0',
  newVersion: 'v2.1',  // 创建新版本
  restoredAt: '2026-03-19T09:00:00.000Z'
}
```

---

### 场景 8：删除文件（移动到回收站）

```javascript
// 用户删除文件
const result = await agentHelper.deleteFile(
  'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  '张三',
  '重复文件'
);

console.log('删除结果:', result);
```

**输出**：
```
删除结果：{
  original_path: 'projects/智能手表 X1 开发/01-产品部/PRD_v1.0_张三_20260317.docx',
  deleted_by: '张三',
  deleted_at: '2026-03-19T10:00:00.000Z',
  reason: '重复文件',
  auto_delete_at: '2026-04-18T10:00:00.000Z'  // 30 天后自动清理
}
```

**说明**：
- 文件移动到 `.trash/` 文件夹
- 保留 30 天，支持找回
- 无需审批

---

### 场景 9：恢复删除的文件

```javascript
// 用户：「恢复刚才删除的 PRD 文档」
const result = await agentHelper.restoreFile('uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

console.log('恢复结果:', result);
```

**输出**：
```
恢复结果：{
  fileId: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  restoredPath: 'projects/智能手表 X1 开发/01-产品部/PRD_v1.0_张三_20260317.docx',
  restoredAt: '2026-03-19T10:30:00.000Z'
}
```

---

### 场景 10：列出回收站文件

```javascript
// 查看项目回收站
const trashFiles = await agentHelper.listTrash('智能手表 X1 开发');

console.log('回收站文件:', trashFiles);
```

**输出**：
```
回收站文件：[
  {
    file_id: 'uuid-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    file_name: 'PRD_v1.0_张三_20260317.docx',
    deleted_at: '2026-03-19T10:00:00.000Z',
    reason: '重复文件',
    can_restore: true  // 30 天内可恢复
  }
]
```

---

## 智能体集成示例

### 智能体对话指令

```
用户：创建一个新的硬件产品开发项目
智能体：好的，请提供以下信息：
  1. 项目名称
  2. 项目描述（可选）

用户：项目名称：智能手表 X1 开发，描述：新一代智能手表
智能体：收到，正在创建项目文件夹结构...
  ✅ 项目创建成功
  📁 项目路径：projects/智能手表 X1 开发
  📂 已创建文件夹：
    - 00-项目公共
    - 01-产品部
    - 02-项目部
    - 03-软件部
    - 04-硬件部
    - 05-结构部
  
  接下来需要创建 PRD 文档吗？

用户：好的，创建 PRD
智能体：正在创建 PRD 文档...
  ✅ 文档创建成功
  📄 文件名：PRD_v1.0_张三_20260317.docx
  📍 位置：01-产品部/PRD_v1.0_张三_20260317.docx
  
  请提供 PRD 内容，或使用模板开始编写。
```

---

## 最佳实践

### 1. 项目创建时明确类型
```javascript
// ✅ 好的做法
projectType: 'hardware_product'  // 明确指定流程类型

// ❌ 避免
projectType: 'default'  // 过于模糊
```

### 2. 文档类型使用标准代码
```javascript
// ✅ 好的做法
docType: 'PRD'  // 使用标准代码

// ❌ 避免
docType: '产品需求文档'  // 使用中文名称
```

### 3. 版本更新区分主次
```javascript
// 主版本更新（重大变更）
isMajorUpdate: true  // v1.0 → v2.0

// 次版本更新（小改动）
isMajorUpdate: false  // v1.0 → v1.1
```

### 4. 删除文件时说明原因
```javascript
// ✅ 好的做法
reason: '重复文件'  // 明确原因

// ❌ 避免
reason: '无'  // 过于模糊
```

---

## 错误处理

```javascript
try {
  const result = await agentHelper.createProject({
    projectName: '测试项目',
    projectType: 'unknown_type',  // 未知类型
    creator: '张三'
  });
} catch (error) {
  console.error('创建项目失败:', error.message);
  // 输出：未知的项目类型：unknown_type，可选类型：hardware_product, software_only...
}
```

---

## 配置说明

### 工作流程类型

| 类型代码 | 名称 | 部门顺序 |
|---------|------|---------|
| `hardware_product` | 硬件产品开发 | 产品部→项目部→软件部→硬件部→结构部 |
| `software_only` | 纯软件开发 | 产品部→项目部→软件部 |
| `hardware_only` | 硬件开发 | 产品部→项目部→硬件部→结构部 |
| `structure_only` | 结构设计 | 产品部→项目部→结构部 |

### 文档类型代码

完整列表见 `WorkflowConfig.js` 中的 `DocumentTypes` 对象。

---

**文档版本**: v1.0  
**创建日期**: 2026-03-17  
**适用版本**: XC-Process-Intelligent-Agent v7.0+
