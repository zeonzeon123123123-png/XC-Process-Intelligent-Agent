/**
 * 智能体文件操作助手
 * 为智能体提供高级文件操作接口
 */

const { FileSystemManager } = require('./FileSystemManager');
const { WorkflowConfig, DocumentTypes, getWorkflowConfig } = require('./WorkflowConfig');

class AgentFileHelper {
  constructor(config) {
    this.fsManager = new FileSystemManager(config);
    this.config = config;
  }

  /**
   * 智能体创建项目（自动创建文件夹结构）
   * @param {object} params - 项目参数
   * @returns {Promise<object>} 创建的项目信息
   */
  async createProject(params) {
    const {
      projectName,
      projectType,
      creator,
      description = '',
      metadata = {}
    } = params;
    
    console.log(`[AgentFileHelper] 创建项目：${projectName}`);
    
    // 1. 验证项目类型
    const workflow = getWorkflowConfig(projectType);
    if (!workflow) {
      throw new Error(`未知的项目类型：${projectType}，可选类型：${Object.keys(WorkflowConfig).join(', ')}`);
    }
    
    // 2. 创建项目文件夹结构
    const projectStructure = await this.fsManager.createProjectStructure(projectName, projectType);
    
    // 3. 创建项目说明文档
    const readmeContent = this.generateProjectReadme(projectName, workflow, creator, description);
    await this.fsManager.createFile(
      projectName,  // projectId（临时使用项目名称）
      '项目说明',
      '项目公共',
      readmeContent,
      creator,
      { status: '已发布' }
    );
    
    console.log(`[AgentFileHelper] 项目创建完成：${projectName}`);
    
    return {
      success: true,
      projectName,
      projectType: workflow.name,
      basePath: projectStructure.basePath,
      folders: projectStructure.folders,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 智能体生成文档（自动命名 + 自动保存）
   * @param {object} params - 文档参数
   * @returns {Promise<object>} 创建的文档信息
   */
  async createDocument(params) {
    const {
      projectId,
      docType,
      department,
      content,
      creator,
      isTemplate = false
    } = params;
    
    console.log(`[AgentFileHelper] 创建文档：${docType}, 项目：${projectId}`);
    
    // 1. 验证文档类型
    const docConfig = DocumentTypes[docType];
    if (!docConfig) {
      throw new Error(`未知的文档类型：${docType}`);
    }
    
    // 2. 创建文件（智能体自动命名）
    const fileInfo = await this.fsManager.createFile(
      projectId,
      docType,
      department,
      content,
      creator,
      {
        status: isTemplate ? '模板' : '草稿',
        tags: [docType, department]
      }
    );
    
    console.log(`[AgentFileHelper] 文档创建完成：${fileInfo.file_name}`);
    
    return {
      success: true,
      ...fileInfo
    };
  }

  /**
   * 智能体提供修改建议并执行
   * @param {object} params - 修改参数
   * @returns {Promise<object>} 修改结果
   */
  async modifyDocument(params) {
    const {
      fileId,
      suggestions,
      updater,
      autoApply = false
    } = params;
    
    console.log(`[AgentFileHelper] 修改文档：${fileId}`);
    
    // 1. 读取当前文档
    const fileInfo = await this.fsManager.fileIndex.getFileById(fileId);
    if (!fileInfo) {
      throw new Error(`文件不存在：${fileId}`);
    }
    
    const currentContent = await this.fsManager.readFile(fileInfo.file_path);
    
    // 2. 生成修改建议（diff 格式）
    const modifiedContent = await this.applySuggestions(currentContent, suggestions);
    const diffView = this.generateDiffView(currentContent, modifiedContent, suggestions);
    
    // 3. 如果自动应用，直接执行修改
    if (autoApply) {
      const updatedFile = await this.fsManager.updateFile(
        fileId,
        modifiedContent,
        updater,
        suggestions.isMajorUpdate || false
      );
      
      return {
        success: true,
        action: 'auto_applied',
        diffView,
        updatedFile
      };
    }
    
    // 4. 否则返回建议等待用户确认
    return {
      success: true,
      action: 'pending_approval',
      diffView,
      suggestions,
      fileId,
      currentVersion: fileInfo.version
    };
  }

  /**
   * 智能体查询项目文件
   * @param {string} projectId - 项目 ID
   * @param {object} filters - 过滤条件
   * @returns {Promise<Array>} 文件列表
   */
  async queryFiles(projectId, filters = {}) {
    return await this.fsManager.queryProjectFiles(projectId, filters);
  }

  /**
   * 智能体获取文件历史版本
   * @param {string} fileId - 文件 ID
   * @returns {Promise<Array>} 历史版本列表
   */
  async getFileHistory(fileId) {
    return await this.fsManager.getFileHistory(fileId);
  }

  /**
   * 智能体恢复历史版本
   * @param {string} fileId - 文件 ID
   * @param {string} targetVersion - 目标版本号
   * @returns {Promise<object>} 恢复结果
   */
  async restoreVersion(fileId, targetVersion) {
    const history = await this.getFileHistory(fileId);
    const targetFile = history.find(f => f.version === targetVersion);
    
    if (!targetFile) {
      throw new Error(`未找到版本：${targetVersion}`);
    }
    
    // 读取历史版本内容
    const content = await this.fsManager.readFile(targetFile.file_path);
    
    // 创建新版本（恢复）
    const restoredFile = await this.fsManager.updateFile(
      fileId,
      content,
      'system_restore',
      false
    );
    
    return {
      success: true,
      restoredVersion: targetVersion,
      newVersion: restoredFile.version,
      restoredAt: new Date().toISOString()
    };
  }

  /**
   * 智能体删除文件（移动到回收站）
   * @param {string} fileId - 文件 ID
   * @param {string} deleter - 删除者
   * @param {string} reason - 删除原因
   * @returns {Promise<object>} 删除结果
   */
  async deleteFile(fileId, deleter, reason = '其他') {
    return await this.fsManager.deleteFile(fileId, deleter, reason);
  }

  /**
   * 智能体恢复删除的文件
   * @param {string} fileId - 文件 ID
   * @returns {Promise<object>} 恢复结果
   */
  async restoreFile(fileId) {
    return await this.fsManager.restoreFile(fileId);
  }

  /**
   * 智能体列出回收站文件
   * @param {string} projectId - 项目 ID
   * @returns {Promise<Array>} 回收站文件列表
   */
  async listTrash(projectId) {
    const deletedFiles = await this.fsManager.fileIndex.queryFiles(projectId, {
      is_deleted: true
    });
    
    return deletedFiles.map(f => ({
      file_id: f.file_id,
      file_name: f.doc_type + '_v' + f.version + '_' + f.creator + '_' + this.formatDate(new Date(f.created_at), 'YYYYMMDD'),
      deleted_at: f.deleted_at,
      reason: f.delete_reason,
      can_restore: new Date(f.deleted_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }));
  }

  /**
   * 智能体获取部门文件夹路径
   * @param {string} projectId - 项目 ID
   * @param {string} department - 部门名称
   * @returns {Promise<string>} 文件夹路径
   */
  async getDepartmentFolderPath(projectId, department) {
    const projectInfo = await this.fsManager.fileIndex.getProjectInfo(projectId);
    if (!projectInfo) {
      throw new Error(`项目不存在：${projectId}`);
    }
    
    const prefix = this.fsManager.getDepartmentPrefix(department, projectInfo.projectType);
    return `${projectInfo.basePath}/${prefix}-${department}`;
  }

  /**
   * 智能体生成项目 README
   */
  generateProjectReadme(projectName, workflow, creator, description) {
    const date = this.fsManager.formatDate(new Date(), 'YYYY-MM-DD');
    
    return `# ${projectName}

## 项目信息

- **项目类型**: ${workflow.name}
- **创建日期**: ${date}
- **创建者**: ${creator}
- **描述**: ${description || '暂无描述'}

## 文件夹结构

本项目采用智能体自动编号的文件夹结构：

\`\`\`
${projectName}/
├── 00-项目公共/          ← 跨部门共享文件
${workflow.departmentOrder.map((dept, i) => `├── 0${i + 1}-${dept}/`).join('\n')}
└── .trash/               ← 回收站（隐藏）
\`\`\`

## 部门说明

${workflow.departmentOrder.map((dept, i) => {
  const subfolders = workflow.subfolders[dept] || [];
  return `### 0${i + 1}-${dept}
${subfolders.length > 0 ? '包含：' + subfolders.join('、') : ''}
`;
}).join('\n')}

## 文件命名规范

所有文件遵循以下命名规范：

\`\`\`
{文档类型}_{版本号}_{创建者}_{日期}.{扩展名}

示例：PRD_v1.0_张三_20260317.docx
\`\`\`

## 版本管理

- 文件夹内只显示最新版本文件
- 历史版本可通过 Git history 查询
- 支持历史版本找回

## 删除与恢复

- 删除的文件移动到 .trash/ 文件夹
- 保留 30 天，支持找回
- 30 天后自动清理

---

**创建时间**: ${date}
**智能体系统**: XC-Process-Intelligent-Agent v7.0
`;
  }

  /**
   * 应用修改建议
   */
  async applySuggestions(content, suggestions) {
    // 简单实现：直接替换
    // 实际实现需要更复杂的 diff/patch 逻辑
    let modifiedContent = content;
    
    for (const suggestion of suggestions) {
      if (suggestion.type === 'replace') {
        modifiedContent = modifiedContent.replace(suggestion.original, suggestion.replacement);
      } else if (suggestion.type === 'insert') {
        modifiedContent = modifiedContent.replace(
          suggestion.after,
          suggestion.after + '\n' + suggestion.content
        );
      } else if (suggestion.type === 'delete') {
        modifiedContent = modifiedContent.replace(suggestion.target, '');
      }
    }
    
    return modifiedContent;
  }

  /**
   * 生成 diff 视图
   */
  generateDiffView(oldContent, newContent, suggestions) {
    return {
      summary: `共 ${suggestions.length} 处修改`,
      changes: suggestions.map(s => ({
        type: s.type,
        description: s.description || `执行${s.type}操作`
      })),
      oldContent,
      newContent
    };
  }

  /**
   * 格式化日期
   */
  formatDate(date, format) {
    return this.fsManager.formatDate(date, format);
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AgentFileHelper
  };
}
