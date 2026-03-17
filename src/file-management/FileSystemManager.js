/**
 * 文件系统管理器 - 核心模块
 * 提供统一的文件系统接口，支持 GitHub 和飞书（未来）
 */

class FileSystemManager {
  constructor(config) {
    this.config = config;
    this.provider = config.storage.provider;
    
    // 根据配置初始化对应的文件系统实现
    if (this.provider === 'github') {
      this.fs = new GitHubFileSystem(config.storage.github);
    } else if (this.provider === 'feishu') {
      this.fs = new FeishuFileSystem(config.storage.feishu);
    } else {
      throw new Error(`不支持的存储提供者：${this.provider}`);
    }
    
    this.fileIndex = new FileIndexManager(config);
  }

  /**
   * 创建项目文件夹结构（智能体自动编号）
   * @param {string} projectName - 项目名称
   * @param {string} projectType - 项目类型（hardware_product, software_only 等）
   * @returns {Promise<object>} 创建的文件夹结构
   */
  async createProjectStructure(projectName, projectType) {
    console.log(`[FileSystem] 创建项目文件夹：${projectName}, 类型：${projectType}`);
    
    // 1. 生成文件夹结构（智能体自动编号）
    const folderStructure = this.generateFolderStructure(projectType);
    
    // 2. 创建文件夹
    const basePath = `${this.config.storage.basePath}/${projectName}`;
    const createdFolders = [];
    
    for (const folder of folderStructure) {
      const folderPath = `${basePath}/${folder.prefix}-${folder.name}`;
      await this.fs.createFolder(folderPath);
      createdFolders.push({
        path: folderPath,
        name: folder.name,
        prefix: folder.prefix
      });
      
      // 创建子文件夹
      if (folder.subfolders) {
        for (const subfolder of folder.subfolders) {
          const subfolderPath = `${folderPath}/${subfolder.prefix}-${subfolder.name}`;
          await this.fs.createFolder(subfolderPath);
          createdFolders.push({
            path: subfolderPath,
            name: subfolder.name,
            prefix: subfolder.prefix,
            parent: folder.name
          });
        }
      }
    }
    
    // 3. 创建项目元数据文件
    const projectMetadata = {
      projectName,
      projectType,
      createdAt: new Date().toISOString(),
      folderStructure: createdFolders
    };
    
    await this.fs.createFile(
      `${basePath}/.project-metadata.json`,
      JSON.stringify(projectMetadata, null, 2)
    );
    
    // 4. 创建回收站文件夹
    await this.fs.createFolder(`${basePath}/.trash`);
    
    console.log(`[FileSystem] 项目文件夹创建完成：${createdFolders.length} 个文件夹`);
    
    return {
      projectName,
      basePath,
      folders: createdFolders,
      metadataPath: `${basePath}/.project-metadata.json`
    };
  }

  /**
   * 根据工作流程类型生成文件夹结构（智能体自动编号）
   * @param {string} projectType - 项目类型
   * @returns {Array} 文件夹结构数组
   */
  generateFolderStructure(projectType) {
    const workflows = this.config.workflows || {};
    const workflow = workflows[projectType];
    
    if (!workflow) {
      throw new Error(`未知的工作流程类型：${projectType}`);
    }
    
    const folderStructure = [];
    
    // 1. 项目公共文件夹（始终为 00）
    folderStructure.push({
      prefix: '00',
      name: '项目公共',
      order: 0,
      subfolders: [
        { prefix: '01', name: '项目立项' },
        { prefix: '02', name: '项目计划' },
        { prefix: '03', name: '会议纪要' },
        { prefix: '04', name: '变更日志' }
      ]
    });
    
    // 2. 根据部门顺序自动编号
    const departmentOrder = workflow.departmentOrder || [];
    const departmentSubfolders = workflow.subfolders || {};
    
    departmentOrder.forEach((dept, index) => {
      const prefix = String(index + 1).padStart(2, '0');
      const subfolders = (departmentSubfolders[dept] || []).map((sf, sfIndex) => ({
        prefix: String(sfIndex + 1).padStart(2, '0'),
        name: sf
      }));
      
      folderStructure.push({
        prefix,
        name: dept,
        order: index + 1,
        subfolders
      });
    });
    
    return folderStructure;
  }

  /**
   * 生成文件名（智能体自动补全）
   * @param {string} docType - 文档类型
   * @param {string} creator - 创建者
   * @param {string} projectId - 项目 ID
   * @returns {Promise<string>} 完整的文件名
   */
  async generateFileName(docType, creator, projectId) {
    // 1. 获取当前日期（YYYYMMDD）
    const date = this.formatDate(new Date(), 'YYYYMMDD');
    
    // 2. 查询下一版本号
    const version = await this.fileIndex.getNextVersion(projectId, docType);
    
    // 3. 生成文件名
    const fileName = `${docType}_v${version}_${creator}_${date}`;
    
    console.log(`[FileSystem] 生成文件名：${fileName}`);
    
    return fileName;
  }

  /**
   * 创建文件（智能体自动命名）
   * @param {string} projectId - 项目 ID
   * @param {string} docType - 文档类型
   * @param {string} department - 所属部门
   * @param {string} content - 文件内容
   * @param {string} creator - 创建者
   * @param {object} metadata - 额外元数据
   * @returns {Promise<object>} 创建的文件信息
   */
  async createFile(projectId, docType, department, content, creator, metadata = {}) {
    // 1. 获取项目信息
    const projectInfo = await this.fileIndex.getProjectInfo(projectId);
    if (!projectInfo) {
      throw new Error(`项目不存在：${projectId}`);
    }
    
    // 2. 生成文件名
    const fileName = await this.generateFileName(docType, creator, projectId);
    
    // 3. 构建文件路径
    const filePath = `${projectInfo.basePath}/${this.getDepartmentPrefix(department, projectInfo.projectType)}-${department}/${fileName}`;
    
    // 4. 创建文件
    await this.fs.createFile(filePath, content);
    
    // 5. 记录到文件索引
    const fileRecord = {
      file_id: this.generateUUID(),
      file_path: filePath,
      project_name: projectInfo.projectName,
      project_id: projectId,
      doc_type: docType,
      department: department,
      version: this.extractVersion(fileName),
      creator: creator,
      creator_id: metadata.creator_id || creator,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: metadata.status || '草稿',
      tags: metadata.tags || [],
      related_files: metadata.related_files || [],
      file_size: content.length,
      is_latest: true,
      git_commit_hash: metadata.git_commit_hash || null
    };
    
    await this.fileIndex.addFile(fileRecord);
    
    console.log(`[FileSystem] 文件创建成功：${filePath}`);
    
    return {
      ...fileRecord,
      file_name: fileName,
      full_path: filePath
    };
  }

  /**
   * 读取文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} 文件内容
   */
  async readFile(filePath) {
    return await this.fs.readFile(filePath);
  }

  /**
   * 更新文件（创建新版本）
   * @param {string} fileId - 文件 ID
   * @param {string} content - 新内容
   * @param {string} updater - 更新者
   * @param {boolean} isMajorUpdate - 是否主版本更新
   * @returns {Promise<object>} 更新后的文件信息
   */
  async updateFile(fileId, content, updater, isMajorUpdate = false) {
    // 1. 查询当前文件信息
    const fileInfo = await this.fileIndex.getFileById(fileId);
    if (!fileInfo) {
      throw new Error(`文件不存在：${fileId}`);
    }
    
    // 2. 标记旧版本为非最新
    await this.fileIndex.markAsNotLatest(fileId);
    
    // 3. 生成新版本号
    const newVersion = this.incrementVersion(fileInfo.version, isMajorUpdate);
    
    // 4. 生成新文件名
    const date = this.formatDate(new Date(), 'YYYYMMDD');
    const docType = fileInfo.doc_type;
    const creator = fileInfo.creator;
    const newFileName = `${docType}_v${newVersion}_${creator}_${date}`;
    
    // 5. 构建新文件路径（同一文件夹，新文件名）
    const folderPath = fileInfo.file_path.substring(0, fileInfo.file_path.lastIndexOf('/'));
    const newFilePath = `${folderPath}/${newFileName}`;
    
    // 6. 创建新文件
    await this.fs.createFile(newFilePath, content);
    
    // 7. 记录新版本到索引
    const newFileRecord = {
      file_id: this.generateUUID(),
      file_path: newFilePath,
      project_name: fileInfo.project_name,
      project_id: fileInfo.project_id,
      doc_type: fileInfo.doc_type,
      department: fileInfo.department,
      version: newVersion,
      creator: fileInfo.creator,
      creator_id: fileInfo.creator_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: fileInfo.status,
      tags: fileInfo.tags,
      related_files: fileInfo.related_files,
      file_size: content.length,
      is_latest: true,
      git_commit_hash: null,
      previous_version_id: fileId  // 关联上一版本
    };
    
    await this.fileIndex.addFile(newFileRecord);
    
    console.log(`[FileSystem] 文件更新成功：${newFilePath}, 版本：${newVersion}`);
    
    return newFileRecord;
  }

  /**
   * 删除文件（移动到回收站）
   * @param {string} fileId - 文件 ID
   * @param {string} deleter - 删除者
   * @param {string} reason - 删除原因
   * @returns {Promise<object>} 删除记录
   */
  async deleteFile(fileId, deleter, reason = '其他') {
    // 1. 查询文件信息
    const fileInfo = await this.fileIndex.getFileById(fileId);
    if (!fileInfo) {
      throw new Error(`文件不存在：${fileId}`);
    }
    
    // 2. 读取文件内容
    const content = await this.fs.readFile(fileInfo.file_path);
    
    // 3. 构建回收站路径
    const projectInfo = await this.fileIndex.getProjectInfo(fileInfo.project_id);
    const trashPath = `${projectInfo.basePath}/.trash/${fileInfo.file_name}_deleted.json`;
    
    // 4. 创建删除记录
    const deleteRecord = {
      original_path: fileInfo.file_path,
      original_file_id: fileId,
      file_name: fileInfo.file_name,
      deleted_by: deleter,
      deleted_by_id: deleter,
      deleted_at: new Date().toISOString(),
      reason: reason,
      auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 天后
      file_snapshot: {
        version: fileInfo.version,
        size: fileInfo.file_size,
        content: content  // 保存文件内容以便恢复
      }
    };
    
    // 5. 保存删除记录到回收站
    await this.fs.createFile(trashPath, JSON.stringify(deleteRecord, null, 2));
    
    // 6. 从原位置删除文件
    await this.fs.deleteFile(fileInfo.file_path);
    
    // 7. 更新文件索引
    await this.fileIndex.markAsDeleted(fileId, trashPath);
    
    console.log(`[FileSystem] 文件已删除到回收站：${fileId}`);
    
    return deleteRecord;
  }

  /**
   * 恢复删除的文件
   * @param {string} fileId - 文件 ID
   * @returns {Promise<object>} 恢复的文件信息
   */
  async restoreFile(fileId) {
    // 1. 查询删除记录
    const deleteRecord = await this.fileIndex.getDeleteRecord(fileId);
    if (!deleteRecord) {
      throw new Error(`未找到删除记录：${fileId}`);
    }
    
    // 2. 读取回收站内容
    const trashContent = await this.fs.readFile(deleteRecord.trash_path);
    const trashData = JSON.parse(trashContent);
    
    // 3. 恢复文件到原位置
    await this.fs.createFile(trashData.original_path, trashData.file_snapshot.content);
    
    // 4. 删除回收站记录
    await this.fs.deleteFile(deleteRecord.trash_path);
    
    // 5. 更新文件索引
    await this.fileIndex.markAsRestored(fileId);
    
    console.log(`[FileSystem] 文件已恢复：${fileId}`);
    
    return {
      fileId,
      restoredPath: trashData.original_path,
      restoredAt: new Date().toISOString()
    };
  }

  /**
   * 查询项目文件
   * @param {string} projectId - 项目 ID
   * @param {object} filters - 过滤条件
   * @returns {Promise<Array>} 文件列表
   */
  async queryProjectFiles(projectId, filters = {}) {
    return await this.fileIndex.queryFiles(projectId, filters);
  }

  /**
   * 获取文件历史版本
   * @param {string} fileId - 文件 ID
   * @returns {Promise<Array>} 历史版本列表
   */
  async getFileHistory(fileId) {
    return await this.fileIndex.getFileHistory(fileId);
  }

  /**
   * 获取部门前缀
   */
  getDepartmentPrefix(department, projectType) {
    const workflows = this.config.workflows || {};
    const workflow = workflows[projectType];
    if (!workflow) return '99';
    
    const index = workflow.departmentOrder.indexOf(department);
    if (index === -1) return '99';
    
    return String(index + 1).padStart(2, '0');
  }

  /**
   * 格式化日期
   */
  formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 生成 UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 从文件名提取版本号
   */
  extractVersion(fileName) {
    const match = fileName.match(/_v(\d+\.\d+(?:\.\d+)?)_/);
    return match ? match[1] : '1.0';
  }

  /**
   * 递增版本号
   */
  incrementVersion(version, isMajorUpdate = false) {
    const parts = version.split('.').map(Number);
    
    if (isMajorUpdate) {
      parts[0] += 1;  // 主版本 +1
      parts[1] = 0;   // 次版本归零
      if (parts[2] !== undefined) parts[2] = 0;  // 修订号归零
    } else {
      if (parts.length === 2) {
        parts[1] += 1;  // 次版本 +1
      } else if (parts.length === 3) {
        parts[2] += 1;  // 修订号 +1
      }
    }
    
    return parts.join('.');
  }
}

/**
 * GitHub 文件系统实现
 */
class GitHubFileSystem {
  constructor(config) {
    this.repo = config.repo;
    this.branch = config.branch || 'main';
    this.basePath = config.basePath || '';
    this.token = config.token;  // GitHub Personal Access Token
  }

  async createFolder(path) {
    // GitHub 通过创建 .gitkeep 文件来创建文件夹
    console.log(`[GitHub] 创建文件夹：${path}`);
    // 实际实现需要调用 GitHub API
    // 这里先返回成功
    return { success: true, path };
  }

  async createFile(path, content) {
    console.log(`[GitHub] 创建文件：${path}`);
    // 实际实现需要调用 GitHub API
    return { success: true, path };
  }

  async readFile(path) {
    console.log(`[GitHub] 读取文件：${path}`);
    // 实际实现需要调用 GitHub API
    return '';
  }

  async updateFile(path, content) {
    console.log(`[GitHub] 更新文件：${path}`);
    // 实际实现需要调用 GitHub API
    return { success: true, path };
  }

  async deleteFile(path) {
    console.log(`[GitHub] 删除文件：${path}`);
    // 实际实现需要调用 GitHub API
    return { success: true, path };
  }

  async listFiles(folderPath) {
    console.log(`[GitHub] 列出文件：${folderPath}`);
    // 实际实现需要调用 GitHub API
    return [];
  }
}

/**
 * 飞书文件系统实现（未来扩展）
 */
class FeishuFileSystem {
  constructor(config) {
    this.folderToken = config.folderToken;
    this.driveType = config.driveType || 'normal';
  }

  async createFolder(path) {
    console.log(`[Feishu] 创建文件夹：${path}`);
    // 使用 feishu_drive 工具实现
    return { success: true, path };
  }

  async createFile(path, content) {
    console.log(`[Feishu] 创建文件：${path}`);
    // 使用 feishu_doc 工具实现
    return { success: true, path };
  }

  async readFile(path) {
    console.log(`[Feishu] 读取文件：${path}`);
    // 使用 feishu_doc 工具实现
    return '';
  }

  async updateFile(path, content) {
    console.log(`[Feishu] 更新文件：${path}`);
    // 使用 feishu_doc 工具实现
    return { success: true, path };
  }

  async deleteFile(path) {
    console.log(`[Feishu] 删除文件：${path}`);
    // 使用 feishu_drive 工具实现
    return { success: true, path };
  }

  async listFiles(folderPath) {
    console.log(`[Feishu] 列出文件：${folderPath}`);
    // 使用 feishu_drive 工具实现
    return [];
  }
}

/**
 * 文件索引管理器
 */
class FileIndexManager {
  constructor(config) {
    this.config = config;
    this.index = {
      files: [],
      projects: {},
      deletedFiles: {}
    };
    this.loadIndex();
  }

  /**
   * 加载索引（从本地存储或 GitHub）
   */
  async loadIndex() {
    // 实际实现需要从 GitHub 或本地存储加载
    console.log('[FileIndex] 加载索引');
  }

  /**
   * 保存索引
   */
  async saveIndex() {
    // 实际实现需要保存到 GitHub 或本地存储
    console.log('[FileIndex] 保存索引');
  }

  /**
   * 添加文件记录
   */
  async addFile(fileRecord) {
    this.index.files.push(fileRecord);
    
    // 更新项目索引
    if (!this.index.projects[fileRecord.project_id]) {
      this.index.projects[fileRecord.project_id] = {
        projectName: fileRecord.project_name,
        fileCount: 0,
        files: []
      };
    }
    this.index.projects[fileRecord.project_id].files.push(fileRecord.file_id);
    this.index.projects[fileRecord.project_id].fileCount += 1;
    
    await this.saveIndex();
  }

  /**
   * 获取文件 by ID
   */
  async getFileById(fileId) {
    return this.index.files.find(f => f.file_id === fileId);
  }

  /**
   * 获取下一版本号
   */
  async getNextVersion(projectId, docType) {
    const projectFiles = this.index.files.filter(
      f => f.project_id === projectId && f.doc_type === docType
    );
    
    if (projectFiles.length === 0) {
      return '1.0';
    }
    
    // 找到最新版本
    const latestVersion = projectFiles
      .filter(f => f.is_latest)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    
    if (!latestVersion) {
      return '1.0';
    }
    
    // 递增版本号
    const parts = latestVersion.version.split('.').map(Number);
    parts[1] += 1;  // 次版本 +1
    return parts.join('.');
  }

  /**
   * 标记文件为非最新
   */
  async markAsNotLatest(fileId) {
    const file = this.index.files.find(f => f.file_id === fileId);
    if (file) {
      file.is_latest = false;
      await this.saveIndex();
    }
  }

  /**
   * 标记文件为已删除
   */
  async markAsDeleted(fileId, trashPath) {
    const file = this.index.files.find(f => f.file_id === fileId);
    if (file) {
      file.is_deleted = true;
      file.deleted_at = new Date().toISOString();
      file.trash_path = trashPath;
      
      // 添加到删除记录
      this.index.deletedFiles[fileId] = {
        trash_path: trashPath,
        deleted_at: file.deleted_at
      };
      
      await this.saveIndex();
    }
  }

  /**
   * 标记文件为已恢复
   */
  async markAsRestored(fileId) {
    const file = this.index.files.find(f => f.file_id === fileId);
    if (file) {
      file.is_deleted = false;
      file.deleted_at = null;
      file.trash_path = null;
      
      delete this.index.deletedFiles[fileId];
      await this.saveIndex();
    }
  }

  /**
   * 获取删除记录
   */
  async getDeleteRecord(fileId) {
    return this.index.deletedFiles[fileId];
  }

  /**
   * 查询文件
   */
  async queryFiles(projectId, filters = {}) {
    let results = this.index.files.filter(f => f.project_id === projectId);
    
    // 应用过滤条件
    if (filters.doc_type) {
      results = results.filter(f => f.doc_type === filters.doc_type);
    }
    if (filters.department) {
      results = results.filter(f => f.department === filters.department);
    }
    if (filters.status) {
      results = results.filter(f => f.status === filters.status);
    }
    if (filters.is_latest !== undefined) {
      results = results.filter(f => f.is_latest === filters.is_latest);
    }
    if (filters.is_deleted !== undefined) {
      results = results.filter(f => f.is_deleted === filters.is_deleted);
    }
    
    return results;
  }

  /**
   * 获取文件历史版本
   */
  async getFileHistory(fileId) {
    const file = this.index.files.find(f => f.file_id === fileId);
    if (!file) return [];
    
    // 查找所有同一路径的文件（不同版本）
    const history = this.index.files.filter(
      f => f.project_id === file.project_id &&
           f.doc_type === file.doc_type &&
           f.department === file.department
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return history;
  }

  /**
   * 获取项目信息
   */
  async getProjectInfo(projectId) {
    return this.index.projects[projectId];
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileSystemManager,
    GitHubFileSystem,
    FeishuFileSystem,
    FileIndexManager
  };
}
