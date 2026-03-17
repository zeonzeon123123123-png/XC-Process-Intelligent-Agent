/**
 * 工作流程配置
 * 定义不同项目类型的部门顺序和子文件夹结构
 */

const WorkflowConfig = {
  /**
   * 硬件产品开发流程（完整流程）
   */
  hardware_product: {
    name: '硬件产品开发',
    code: 'hardware_product',
    description: '完整的硬件产品开发流程，包含所有 5 个部门',
    departmentOrder: ['产品部', '项目部', '软件部', '硬件部', '结构部'],
    subfolders: {
      '产品部': [
        '市场需求',
        'PRD',
        '竞品分析',
        '评审记录'
      ],
      '项目部': [
        '项目计划',
        '风险管理',
        '进度报告',
        '验收文档'
      ],
      '软件部': [
        '需求分析',
        '设计文档',
        'API 文档',
        '版本发布',
        '代码评审'
      ],
      '硬件部': [
        '原理图',
        'PCB 设计',
        'BOM 表',
        '测试报告',
        '问题跟踪'
      ],
      '结构部': [
        'ID 设计',
        '结构设计',
        '模具开发',
        '手板管理'
      ]
    },
    // 公共文件夹子文件夹
    commonSubfolders: [
      { prefix: '01', name: '项目立项' },
      { prefix: '02', name: '项目计划' },
      { prefix: '03', name: '会议纪要' },
      { prefix: '04', name: '变更日志' }
    ]
  },

  /**
   * 纯软件开发流程
   */
  software_only: {
    name: '纯软件开发',
    code: 'software_only',
    description: '仅涉及软件开发的流程，不包含硬件和结构部门',
    departmentOrder: ['产品部', '项目部', '软件部'],
    subfolders: {
      '产品部': [
        '市场需求',
        'PRD',
        '竞品分析',
        '评审记录'
      ],
      '项目部': [
        '项目计划',
        '风险管理',
        '进度报告',
        '验收文档'
      ],
      '软件部': [
        '需求分析',
        '设计文档',
        'API 文档',
        '版本发布',
        '代码评审'
      ]
    },
    commonSubfolders: [
      { prefix: '01', name: '项目立项' },
      { prefix: '02', name: '项目计划' },
      { prefix: '03', name: '会议纪要' },
      { prefix: '04', name: '变更日志' }
    ]
  },

  /**
   * 硬件开发流程（不含软件）
   */
  hardware_only: {
    name: '硬件开发',
    code: 'hardware_only',
    description: '仅涉及硬件开发的流程，不包含软件部门',
    departmentOrder: ['产品部', '项目部', '硬件部', '结构部'],
    subfolders: {
      '产品部': [
        '市场需求',
        'PRD',
        '竞品分析',
        '评审记录'
      ],
      '项目部': [
        '项目计划',
        '风险管理',
        '进度报告',
        '验收文档'
      ],
      '硬件部': [
        '原理图',
        'PCB 设计',
        'BOM 表',
        '测试报告',
        '问题跟踪'
      ],
      '结构部': [
        'ID 设计',
        '结构设计',
        '模具开发',
        '手板管理'
      ]
    },
    commonSubfolders: [
      { prefix: '01', name: '项目立项' },
      { prefix: '02', name: '项目计划' },
      { prefix: '03', name: '会议纪要' },
      { prefix: '04', name: '变更日志' }
    ]
  },

  /**
   * 结构设计流程
   */
  structure_only: {
    name: '结构设计',
    code: 'structure_only',
    description: '仅涉及结构设计的流程',
    departmentOrder: ['产品部', '项目部', '结构部'],
    subfolders: {
      '产品部': [
        '市场需求',
        'PRD',
        '竞品分析',
        '评审记录'
      ],
      '项目部': [
        '项目计划',
        '风险管理',
        '进度报告',
        '验收文档'
      ],
      '结构部': [
        'ID 设计',
        '结构设计',
        '模具开发',
        '手板管理'
      ]
    },
    commonSubfolders: [
      { prefix: '01', name: '项目立项' },
      { prefix: '02', name: '项目计划' },
      { prefix: '03', name: '会议纪要' },
      { prefix: '04', name: '变更日志' }
    ]
  },

  /**
   * 产品规划流程
   */
  product_planning: {
    name: '产品规划',
    code: 'product_planning',
    description: '仅涉及产品部的规划流程',
    departmentOrder: ['产品部', '项目部'],
    subfolders: {
      '产品部': [
        '市场需求',
        'PRD',
        '竞品分析',
        '评审记录',
        '产品路线图'
      ],
      '项目部': [
        '项目计划',
        '风险管理'
      ]
    },
    commonSubfolders: [
      { prefix: '01', name: '项目立项' },
      { prefix: '02', name: '项目计划' },
      { prefix: '03', name: '会议纪要' },
      { prefix: '04', name: '变更日志' }
    ]
  }
};

/**
 * 文档类型定义
 */
const DocumentTypes = {
  // 产品部文档
  PRD: {
    code: 'PRD',
    name: '产品需求文档',
    department: '产品部',
    description: 'Product Requirements Document',
    templates: ['PRD_v1.0_模板.docx']
  },
  MRD: {
    code: 'MRD',
    name: '市场需求文档',
    department: '产品部',
    description: 'Market Requirements Document',
    templates: ['MRD_v1.0_模板.docx']
  },
  '竞品分析': {
    code: '竞品分析',
    name: '竞品分析报告',
    department: '产品部',
    description: 'Competitive Analysis Report',
    templates: ['竞品分析_v1.0_模板.docx']
  },
  
  // 项目部文档
  '立项书': {
    code: '立项书',
    name: '项目立项书',
    department: '项目部',
    description: 'Project Charter',
    templates: ['立项书_v1.0_模板.docx']
  },
  '可行性报告': {
    code: '可行性报告',
    name: '可行性分析报告',
    department: '项目部',
    description: 'Feasibility Report',
    templates: ['可行性报告_v1.0_模板.docx']
  },
  '正式立项说明': {
    code: '正式立项说明',
    name: '正式立项说明',
    department: '项目部',
    description: 'Formal Project Initiation',
    templates: ['正式立项说明_v1.0_模板.docx']
  },
  '项目章程': {
    code: '项目章程',
    name: '项目章程',
    department: '项目部',
    description: 'Project Charter Document',
    templates: ['项目章程_v1.0_模板.docx']
  },
  '项目状态表': {
    code: '项目状态表',
    name: '项目状态表',
    department: '项目部',
    description: 'Project Status Report',
    templates: ['项目状态表_v1.0_模板.docx']
  },
  '结项报告': {
    code: '结项报告',
    name: '结项报告',
    department: '项目部',
    description: 'Project Closure Report',
    templates: ['结项报告_v1.0_模板.docx']
  },
  '成果报告': {
    code: '成果报告',
    name: '成果报告',
    department: '项目部',
    description: 'Project Achievement Report',
    templates: ['成果报告_v1.0_模板.docx']
  },
  '评审流程': {
    code: '评审流程',
    name: '评审流程文档',
    department: '项目部',
    description: 'Review Process Document',
    templates: ['评审流程_v1.0_模板.docx']
  },
  
  // 软件部文档
  '设计文档': {
    code: '设计文档',
    name: '系统设计文档',
    department: '软件部',
    description: 'System Design Document',
    templates: ['设计文档_v1.0_模板.docx']
  },
  'API 文档': {
    code: 'API 文档',
    name: 'API 接口文档',
    department: '软件部',
    description: 'API Documentation',
    templates: ['API 文档_v1.0_模板.docx']
  },
  '版本发布': {
    code: '版本发布',
    name: '版本发布说明',
    department: '软件部',
    description: 'Release Notes',
    templates: ['版本发布_v1.0_模板.docx']
  },
  
  // 硬件部文档
  '原理图': {
    code: '原理图',
    name: '电路原理图',
    department: '硬件部',
    description: 'Circuit Schematic',
    templates: ['原理图_v1.0_模板.sch']
  },
  'PCB 设计': {
    code: 'PCB 设计',
    name: 'PCB 设计文件',
    department: '硬件部',
    description: 'PCB Design Files',
    templates: ['PCB 设计_v1.0_模板.pcb']
  },
  'BOM 表': {
    code: 'BOM 表',
    name: '物料清单',
    department: '硬件部',
    description: 'Bill of Materials',
    templates: ['BOM 表_v1.0_模板.xlsx']
  },
  '测试报告': {
    code: '测试报告',
    name: '测试报告',
    department: '硬件部',
    description: 'Test Report',
    templates: ['测试报告_v1.0_模板.docx']
  },
  
  // 结构部文档
  'ID 设计': {
    code: 'ID 设计',
    name: '工业设计文档',
    department: '结构部',
    description: 'Industrial Design Document',
    templates: ['ID 设计_v1.0_模板.docx']
  },
  '结构设计': {
    code: '结构设计',
    name: '结构设计文档',
    department: '结构部',
    description: 'Mechanical Design Document',
    templates: ['结构设计_v1.0_模板.docx']
  },
  '模具开发': {
    code: '模具开发',
    name: '模具开发文档',
    department: '结构部',
    description: 'Mold Development Document',
    templates: ['模具开发_v1.0_模板.docx']
  },
  
  // 通用文档
  '会议纪要': {
    code: '会议纪要',
    name: '会议纪要',
    department: '全部',
    description: 'Meeting Minutes',
    templates: ['会议纪要_v1.0_模板.docx']
  },
  '变更申请': {
    code: '变更申请',
    name: '变更申请单',
    department: '全部',
    description: 'Change Request',
    templates: ['变更申请_v1.0_模板.docx']
  }
};

/**
 * 获取工作流程配置
 */
function getWorkflowConfig(workflowCode) {
  return WorkflowConfig[workflowCode] || null;
}

/**
 * 获取所有工作流程
 */
function getAllWorkflows() {
  return Object.values(WorkflowConfig);
}

/**
 * 获取文档类型配置
 */
function getDocumentTypeConfig(docCode) {
  return DocumentTypes[docCode] || null;
}

/**
 * 获取某部门的所有文档类型
 */
function getDocumentTypesByDepartment(department) {
  return Object.values(DocumentTypes).filter(dt => 
    dt.department === department || dt.department === '全部'
  );
}

/**
 * 根据工作流程获取部门顺序
 */
function getDepartmentOrder(workflowCode) {
  const workflow = WorkflowConfig[workflowCode];
  return workflow ? workflow.departmentOrder : [];
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WorkflowConfig,
    DocumentTypes,
    getWorkflowConfig,
    getAllWorkflows,
    getDocumentTypeConfig,
    getDocumentTypesByDepartment,
    getDepartmentOrder
  };
}
