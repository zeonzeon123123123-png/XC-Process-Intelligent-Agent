-- XC-Process-Intelligent-Agent 数据库表结构
-- 版本：v2.0.0
-- 创建日期：2026-03-16

-- 创建数据库
CREATE DATABASE IF NOT EXISTS xc_process_agent DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xc_process_agent;

-- ============================================
-- 部门架构表
-- ============================================
CREATE TABLE departments (
  department_id VARCHAR(20) PRIMARY KEY COMMENT '部门 ID，格式：DEPT-NNN',
  name VARCHAR(50) NOT NULL COMMENT '部门名称',
  manager_id VARCHAR(20) COMMENT '部门负责人 ID',
  parent_department_id VARCHAR(20) COMMENT '上级部门 ID（用于多级部门）',
  employee_count INT DEFAULT 0 COMMENT '部门人数',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (manager_id) REFERENCES users(user_id),
  FOREIGN KEY (parent_department_id) REFERENCES departments(department_id),
  INDEX idx_parent (parent_department_id),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门架构表';

-- ============================================
-- 用户信息表
-- ============================================
CREATE TABLE users (
  user_id VARCHAR(20) PRIMARY KEY COMMENT '用户 ID，格式：USR-YYYY-NNN',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  employee_id VARCHAR(20) UNIQUE NOT NULL COMMENT '工号',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱（登录账号）',
  phone VARCHAR(20) COMMENT '手机号',
  department_id VARCHAR(20) NOT NULL COMMENT '所在部门',
  position VARCHAR(50) NOT NULL COMMENT '职务',
  manager_id VARCHAR(20) COMMENT '直接上级 ID',
  role ENUM('employee', 'supervisor', 'manager', 'ceo') NOT NULL DEFAULT 'employee' COMMENT '角色',
  status ENUM('active', 'inactive', 'terminated') DEFAULT 'active' COMMENT '状态',
  hire_date DATE COMMENT '入职日期',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  last_login_at DATETIME COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  FOREIGN KEY (manager_id) REFERENCES users(user_id),
  INDEX idx_department (department_id),
  INDEX idx_manager (manager_id),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- ============================================
-- Token 使用记录表（明细表）
-- ============================================
CREATE TABLE token_usage (
  record_id VARCHAR(30) PRIMARY KEY COMMENT '记录 ID，格式：TKN-YYYYMMDD-NNN',
  user_id VARCHAR(20) NOT NULL COMMENT '用户 ID',
  department_id VARCHAR(20) NOT NULL COMMENT '部门 ID（冗余字段，便于查询）',
  agent_name VARCHAR(50) NOT NULL COMMENT '智能体名称',
  request_id VARCHAR(50) UNIQUE NOT NULL COMMENT '请求 ID（唯一标识）',
  input_tokens INT NOT NULL DEFAULT 0 COMMENT '输入 Token 数',
  output_tokens INT NOT NULL DEFAULT 0 COMMENT '输出 Token 数',
  total_tokens INT NOT NULL DEFAULT 0 COMMENT '总 Token 数',
  model_name VARCHAR(50) NOT NULL COMMENT '模型名称',
  request_time DATETIME NOT NULL COMMENT '请求时间',
  request_duration_ms INT COMMENT '请求耗时（毫秒）',
  status ENUM('success', 'failed', 'timeout') NOT NULL DEFAULT 'success' COMMENT '状态',
  error_message TEXT COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  INDEX idx_user_time (user_id, request_time),
  INDEX idx_department_time (department_id, request_time),
  INDEX idx_agent (agent_name),
  INDEX idx_request_time (request_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Token 使用记录表';

-- ============================================
-- Token 统计表（聚合表，用于快速查询）
-- ============================================
CREATE TABLE token_stats (
  stat_id VARCHAR(30) PRIMARY KEY COMMENT '统计 ID，格式：STAT-YYYYMMDD-部门 -NNN',
  stat_date DATE NOT NULL COMMENT '统计日期',
  department_id VARCHAR(20) NOT NULL COMMENT '部门 ID',
  user_id VARCHAR(20) NOT NULL COMMENT '用户 ID',
  total_tokens INT NOT NULL DEFAULT 0 COMMENT '总 Token 数',
  total_calls INT NOT NULL DEFAULT 0 COMMENT '总调用次数',
  input_tokens INT NOT NULL DEFAULT 0 COMMENT '输入 Token 数',
  output_tokens INT NOT NULL DEFAULT 0 COMMENT '输出 Token 数',
  active_agents INT NOT NULL DEFAULT 0 COMMENT '活跃智能体数',
  avg_response_time_ms INT COMMENT '平均响应时间（毫秒）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE KEY uk_date_dept_user (stat_date, department_id, user_id),
  INDEX idx_date (stat_date),
  INDEX idx_department (department_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Token 统计表';

-- ============================================
-- 部门 Token 统计表（日聚合）
-- ============================================
CREATE TABLE department_token_stats (
  stat_id VARCHAR(30) PRIMARY KEY COMMENT '统计 ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  department_id VARCHAR(20) NOT NULL COMMENT '部门 ID',
  total_tokens INT NOT NULL DEFAULT 0 COMMENT '总 Token 数',
  total_calls INT NOT NULL DEFAULT 0 COMMENT '总调用次数',
  user_count INT NOT NULL DEFAULT 0 COMMENT '活跃用户数',
  avg_tokens_per_user INT COMMENT '人均 Token 用量',
  percentage DECIMAL(5,2) COMMENT '占比（%）',
  trend VARCHAR(10) COMMENT '趋势（↑/↓/→）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  UNIQUE KEY uk_date_dept (stat_date, department_id),
  INDEX idx_date (stat_date),
  INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门 Token 统计表';

-- ============================================
-- 智能体使用统计表
-- ============================================
CREATE TABLE agent_usage_stats (
  stat_id VARCHAR(30) PRIMARY KEY COMMENT '统计 ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  agent_name VARCHAR(50) NOT NULL COMMENT '智能体名称',
  total_tokens INT NOT NULL DEFAULT 0 COMMENT '总 Token 数',
  total_calls INT NOT NULL DEFAULT 0 COMMENT '总调用次数',
  user_count INT NOT NULL DEFAULT 0 COMMENT '活跃用户数',
  avg_tokens_per_call INT COMMENT '平均每次调用 Token 数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_date_agent (stat_date, agent_name),
  INDEX idx_date (stat_date),
  INDEX idx_agent (agent_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能体使用统计表';

-- ============================================
-- 登录日志表
-- ============================================
CREATE TABLE login_logs (
  log_id VARCHAR(30) PRIMARY KEY COMMENT '日志 ID',
  user_id VARCHAR(20) NOT NULL COMMENT '用户 ID',
  login_time DATETIME NOT NULL COMMENT '登录时间',
  ip_address VARCHAR(45) COMMENT 'IP 地址',
  user_agent TEXT COMMENT '用户代理',
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '登录状态',
  failure_reason VARCHAR(100) COMMENT '失败原因',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user_time (user_id, login_time),
  INDEX idx_login_time (login_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ============================================
-- 操作审计日志表
-- ============================================
CREATE TABLE audit_logs (
  log_id VARCHAR(30) PRIMARY KEY COMMENT '日志 ID',
  user_id VARCHAR(20) NOT NULL COMMENT '用户 ID',
  action VARCHAR(50) NOT NULL COMMENT '操作类型',
  resource_type VARCHAR(50) COMMENT '资源类型',
  resource_id VARCHAR(50) COMMENT '资源 ID',
  old_value TEXT COMMENT '旧值（JSON）',
  new_value TEXT COMMENT '新值（JSON）',
  ip_address VARCHAR(45) COMMENT 'IP 地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user_time (user_id, created_at),
  INDEX idx_action (action),
  INDEX idx_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作审计日志表';

-- ============================================
-- 系统配置表
-- ============================================
CREATE TABLE system_config (
  config_key VARCHAR(50) PRIMARY KEY COMMENT '配置键',
  config_value TEXT COMMENT '配置值',
  config_type VARCHAR(20) DEFAULT 'string' COMMENT '配置类型',
  description VARCHAR(255) COMMENT '配置说明',
  updated_by VARCHAR(20) COMMENT '最后更新人',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================
-- 初始数据
-- ============================================

-- 插入部门数据
INSERT INTO departments (department_id, name, sort_order) VALUES
('DEPT-001', '产品部', 1),
('DEPT-002', '项目部', 2),
('DEPT-003', '硬件部', 3),
('DEPT-004', '软件部', 4),
('DEPT-005', '结构部', 5),
('DEPT-006', '测试部', 6),
('DEPT-007', '工厂', 7),
('DEPT-008', '管理层', 8);

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('jwt.expires_in', '24h', 'string', 'JWT Token 有效期'),
('session.timeout', '30', 'number', '会话超时时间（分钟）'),
('login.max_failures', '5', 'number', '最大登录失败次数'),
('login.lockout_duration', '30', 'number', '账号锁定时间（分钟）'),
('token.stats.update_interval', '300', 'number', 'Token 统计更新间隔（秒）'),
('password.min_length', '8', 'number', '密码最小长度'),
('password.require_number', 'true', 'boolean', '密码是否要求包含数字'),
('password.require_letter', 'true', 'boolean', '密码是否要求包含字母');

-- ============================================
-- 视图：用户部门视图（便于查询）
-- ============================================
CREATE OR REPLACE VIEW v_user_department AS
SELECT 
  u.user_id,
  u.name,
  u.employee_id,
  u.email,
  u.department_id,
  d.name AS department_name,
  u.manager_id,
  m.name AS manager_name,
  u.role,
  u.status
FROM users u
LEFT JOIN departments d ON u.department_id = d.department_id
LEFT JOIN users m ON u.manager_id = m.user_id;

-- ============================================
-- 存储过程：更新部门 Token 统计
-- ============================================
DELIMITER //

CREATE PROCEDURE sp_update_department_stats(IN p_stat_date DATE)
BEGIN
  -- 删除旧的统计数据
  DELETE FROM department_token_stats WHERE stat_date = p_stat_date;
  
  -- 插入新的统计数据
  INSERT INTO department_token_stats (stat_id, stat_date, department_id, total_tokens, total_calls, user_count, avg_tokens_per_user, created_at)
  SELECT 
    CONCAT('DEPT-STAT-', DATE_FORMAT(p_stat_date, '%Y%m%d'), '-', department_id),
    p_stat_date,
    department_id,
    SUM(total_tokens) AS total_tokens,
    SUM(total_calls) AS total_calls,
    COUNT(DISTINCT user_id) AS user_count,
    SUM(total_tokens) / COUNT(DISTINCT user_id) AS avg_tokens_per_user,
    NOW()
  FROM token_stats
  WHERE stat_date = p_stat_date
  GROUP BY department_id;
  
  -- 更新占比
  UPDATE department_token_stats dts
  INNER JOIN (
    SELECT 
      stat_date,
      SUM(total_tokens) AS grand_total
    FROM department_token_stats
    WHERE stat_date = p_stat_date
    GROUP BY stat_date
  ) gt ON dts.stat_date = gt.stat_date
  SET dts.percentage = (dts.total_tokens / gt.grand_total) * 100
  WHERE dts.stat_date = p_stat_date;
END //

DELIMITER ;

-- ============================================
-- 触发器：Token 使用记录插入时自动更新统计表
-- ============================================
DELIMITER //

CREATE TRIGGER trg_update_token_stats_after_insert
AFTER INSERT ON token_usage
FOR EACH ROW
BEGIN
  DECLARE v_stat_date DATE;
  DECLARE v_stat_id VARCHAR(30);
  
  SET v_stat_date = DATE(NEW.request_time);
  SET v_stat_id = CONCAT('STAT-', DATE_FORMAT(v_stat_date, '%Y%m%d'), '-', NEW.department_id, '-', NEW.user_id);
  
  -- 插入或更新统计表
  INSERT INTO token_stats (stat_id, stat_date, department_id, user_id, total_tokens, total_calls, input_tokens, output_tokens, active_agents, updated_at)
  VALUES (v_stat_id, v_stat_date, NEW.department_id, NEW.user_id, NEW.total_tokens, 1, NEW.input_tokens, NEW.output_tokens, 1, NOW())
  ON DUPLICATE KEY UPDATE
    total_tokens = total_tokens + NEW.total_tokens,
    total_calls = total_calls + 1,
    input_tokens = input_tokens + NEW.input_tokens,
    output_tokens = output_tokens + NEW.output_tokens,
    active_agents = active_agents + 1,
    updated_at = NOW();
END //

DELIMITER ;
