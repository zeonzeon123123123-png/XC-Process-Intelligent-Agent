/**
 * 统一导航栏组件
 * 所有页面共享的导航栏生成逻辑
 */

// 导航栏配置
const NAVBAR_CONFIG = {
    // 6 个固定菜单
    menuItems: [
        { name: '首页', url: 'index.html' },
        { name: '交互中心', url: 'interaction-center.html' },
        { name: '文件管理', url: 'file-manager.html' },
        { name: 'Token 统计', url: 'token-stats.html' },
        { name: '通讯录', url: 'contacts.html' },
        { name: '管理后台', url: 'admin.html', adminOnly: true }
    ],
    
    // 各页面的 Logo 配置
    logos: {
        'index.html': { icon: '🚀', text: '研发工作流程智能体' },
        'interaction-center.html': { icon: '🔗', text: '交互中心' },
        'file-manager.html': { icon: '📁', text: '文件管理' },
        'token-stats.html': { icon: '📊', text: 'Token 统计' },
        'contacts.html': { icon: '👥', text: '通讯录' },
        'admin.html': { icon: '⚙️', text: '管理后台' },
        'product-agent.html': { icon: '📱', text: '产品部智能体' },
        'project-agent.html': { icon: '📋', text: '项目部智能体' },
        'hardware-agent.html': { icon: '🔧', text: '硬件部智能体' },
        'software-agent.html': { icon: '💻', text: '软件部智能体' },
        'structure-agent.html': { icon: '🏗️', text: '结构部智能体' },
        'test-agent.html': { icon: '✅', text: '测试部智能体' }
    }
};

/**
 * 生成导航栏 HTML
 * @param {string} currentPage - 当前页面文件名
 * @param {object} currentUser - 当前用户信息
 * @returns {string} 导航栏 HTML
 */
function generateNavbar(currentPage, currentUser) {
    const logo = NAVBAR_CONFIG.logos[currentPage] || { icon: '🚀', text: '研发工作流程智能体' };
    
    // 生成菜单项
    const menuHtml = NAVBAR_CONFIG.menuItems.map(item => {
        const isActive = item.url === currentPage ? ' class="active"' : '';
        const adminClass = item.adminOnly ? ' class="admin-link"' : '';
        const adminId = item.adminOnly ? ' id="adminNavLink"' : '';
        return `<li><a href="${item.url}"${isActive}${adminClass}${adminId}>${item.name}</a></li>`;
    }).join('\n                    ');
    
    // 用户头像
    const avatar = currentUser ? (currentUser.avatar || currentUser.name[0].toUpperCase()) : 'U';
    const username = currentUser ? currentUser.name : '用户';
    
    return `
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="navbar-content">
            <a href="index.html" class="navbar-brand">${logo.icon} ${logo.text}</a>
            <div class="nav-menu-container">
                <ul class="nav-menu">
                    ${menuHtml}
                </ul>
            </div>
            <div class="user-info">
                <div class="user-avatar" id="navAvatar">${avatar}</div>
                <div>
                    <div style="font-weight: 600; color: #333;" id="navUsername">${username}</div>
                    <div style="font-size: 12px; color: #666;" id="navRole">${currentUser?.role || '用户'}</div>
                </div>
                <button onclick="logout()" style="margin-left: 10px; padding: 8px 16px; background: #ffebee; color: #c62828; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">退出</button>
            </div>
        </div>
    </nav>
`;
}

/**
 * 初始化导航栏
 */
function initNavbar() {
    // 获取当前页面文件名
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 获取当前用户
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // 检查登录状态（登录页面除外）
    if (!currentUser && !currentPage.includes('login.html')) {
        // window.location.href = 'login.html';
        // 暂时不强制跳转，方便调试
    }
    
    // 生成导航栏
    const navbarHtml = generateNavbar(currentPage, currentUser);
    
    // 插入到页面顶部
    const navContainer = document.createElement('div');
    navContainer.innerHTML = navbarHtml;
    document.body.insertBefore(navContainer, document.body.firstChild);
    
    // 权限控制：只有管理员可以看到管理后台
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'ceo' || currentUser.role === 'manager')) {
        const adminLink = document.getElementById('adminNavLink');
        if (adminLink) {
            adminLink.classList.add('visible');
        }
    }
    
    // 设置用户信息
    if (currentUser) {
        document.getElementById('navAvatar').textContent = currentUser.avatar || currentUser.name[0].toUpperCase();
        document.getElementById('navUsername').textContent = currentUser.name;
        document.getElementById('navRole').textContent = getRoleName(currentUser.role);
    }
}

/**
 * 获取角色名称
 */
function getRoleName(role) {
    const roleNames = {
        'admin': '管理员',
        'ceo': '总经理',
        'manager': '部门经理',
        'supervisor': '主管',
        'employee': '员工'
    };
    return roleNames[role] || '用户';
}

/**
 * 退出登录
 */
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// 页面加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
});
