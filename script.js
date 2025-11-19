// DayZ社区模组展示系统 - 现代化架构设计
// 基于10年经验的前端技术总监重构

// 统一数据存储键
const MODS_STORAGE_KEY = 'dayz_mods_production';

// 用户认证管理器
class UserAuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // 确保在DOM加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // 从localStorage恢复用户状态
        this.restoreUserFromStorage();
        
        // 更新导航栏UI
        this.updateAuthUI();
        
        // 创建认证模态框
        this.createAuthModal();
        
        // 绑定认证事件
        this.bindAuthEvents();
    }
    
    // 从localStorage恢复用户状态
    restoreUserFromStorage() {
        const userData = localStorage.getItem('dayz_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            console.log('用户状态已恢复:', this.currentUser);
        }
    }
    
    // 创建认证模态框
    createAuthModal() {
        const modalHTML = `
            <div class="auth-modal" id="authModal">
                <div class="auth-container">
                    <button class="auth-close" id="authClose">&times;</button>
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">登录</button>
                        <button class="auth-tab" data-tab="register">注册</button>
                    </div>
                    
                    <form class="auth-form active" id="loginForm">
                        <div class="form-group">
                            <label for="loginUsername">用户名</label>
                            <input type="text" id="loginUsername" placeholder="输入管理员或普通用户名" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">密码</label>
                            <input type="password" id="loginPassword" placeholder="输入密码" required>
                        </div>
                        <div class="form-group">
                            <label>角色</label>
                            <select id="loginRole" class="auth-select">
                                <option value="user">普通用户</option>
                                <option value="admin">管理员</option>
                            </select>
                        </div>
                        <button type="submit" class="auth-submit">登录</button>
                        <div class="auth-switch">
                            还没有账号？ <a href="#" data-switch="register">立即注册</a>
                        </div>
                    </form>
                    
                    <form class="auth-form" id="registerForm">
                        <div class="form-group">
                            <label for="registerUsername">用户名</label>
                            <input type="text" id="registerUsername" placeholder="请输入用户名" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">邮箱</label>
                            <input type="email" id="registerEmail" placeholder="请输入邮箱" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">密码</label>
                            <input type="password" id="registerPassword" placeholder="请输入密码" required>
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword">确认密码</label>
                            <input type="password" id="registerConfirmPassword" placeholder="请再次输入密码" required>
                        </div>
                        <button type="submit" class="auth-submit">注册</button>
                        <div class="auth-switch">
                            已有账号？ <a href="#" data-switch="login">立即登录</a>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // 绑定认证事件
    bindAuthEvents() {
        // 登录/注册按钮（事件委托优化）
        document.addEventListener('click', (e) => {
            const authBtn = e.target.closest('.auth-btn');
            if (authBtn) {
                this.showAuthModal();
                e.preventDefault();
            }
        });
        
        // 关闭模态框
        document.getElementById('authClose').addEventListener('click', () => {
            this.hideAuthModal();
        });
        
        // 切换标签页
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });
        
        // 切换表单
        document.querySelectorAll('[data-switch]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab(e.target.dataset.switch);
            });
        });
        
        // 登录表单提交
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // 注册表单提交
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // 点击模态框背景关闭
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('authModal')) {
                this.hideAuthModal();
            }
        });
    }
    
    // 显示认证模态框
    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // 隐藏认证模态框
    hideAuthModal() {
        document.getElementById('authModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.clearForms();
    }
    
    // 切换认证标签页
    switchAuthTab(tabName) {
        // 更新标签页状态
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 更新表单显示
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === tabName + 'Form');
        });
    }
    
    // 处理登录
    handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showNotification('请输入用户名和密码', 'error');
            return;
        }
        
        // 模拟登录验证
        const users = JSON.parse(localStorage.getItem('dayz_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.loginUser(user);
        } else {
            this.showNotification('用户名或密码错误', 'error');
        }
    }
    
    // 处理注册
    handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showNotification('请填写所有字段', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('密码长度至少6位', 'error');
            return;
        }
        
        // 检查用户是否已存在
        const users = JSON.parse(localStorage.getItem('dayz_users') || '[]');
        if (users.find(u => u.username === username)) {
            this.showNotification('用户名已存在', 'error');
            return;
        }
        
        if (users.find(u => u.email === email)) {
            this.showNotification('邮箱已被注册', 'error');
            return;
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username: username,
            email: email,
            password: password,
            role: 'user', // 默认普通用户
            createdAt: new Date().toISOString(),
            avatar: username.charAt(0).toUpperCase()
        };
        
        // 添加预设管理员账户
        if (username === 'admin' && password === 'admin123') {
            newUser.role = 'admin';
        }
        
        users.push(newUser);
        localStorage.setItem('dayz_users', JSON.stringify(users));
        
        this.loginUser(newUser);
        this.showNotification('注册成功！', 'success');
    }
    
    // 用户登录
    loginUser(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // 保存到localStorage
        localStorage.setItem('dayz_user', JSON.stringify(user));
        
        // 更新UI
        this.updateAuthUI();
        
        // 隐藏模态框
        this.hideAuthModal();
        
        // 显示欢迎消息
        this.showNotification(`欢迎回来，${user.username}！`, 'success');
        
        // 触发用户状态变更事件
        this.triggerUserStateChange();
    }
    
    // 用户登出
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // 清除localStorage
        localStorage.removeItem('dayz_user');
        
        // 更新UI
        this.updateAuthUI();
        
        // 显示登出消息
        this.showNotification('您已成功登出', 'info');
        
        // 触发用户状态变更事件
        this.triggerUserStateChange();
    }
    
    // 更新认证UI
    updateAuthUI() {
        const authContainer = document.getElementById('userAuthContainer');
        if (!authContainer) return;
        
        if (this.isAuthenticated) {
            authContainer.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${this.currentUser.avatar}</div>
                    <span>${this.currentUser.username}</span>
                    ${this.currentUser.role === 'admin' ? '<span class="admin-badge">管理员</span>' : ''}
                </div>
                <button class="auth-btn" id="logoutBtn">登出</button>
            `;
            
            // 直接绑定登出事件
            document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        } else {
            authContainer.innerHTML = `
                <button class="auth-btn" id="loginBtn">登录</button>
                <button class="auth-btn" id="registerBtn">注册</button>
            `;
            
            // 直接绑定登录/注册事件
            document.getElementById('loginBtn')?.addEventListener('click', () => this.showAuthModal());
            document.getElementById('registerBtn')?.addEventListener('click', () => {
                this.showAuthModal();
                this.switchAuthTab('register');
            });
        }
    }
    
    // 触发用户状态变更事件
    triggerUserStateChange() {
        const event = new CustomEvent('userStateChanged', {
            detail: {
                user: this.currentUser,
                isAuthenticated: this.isAuthenticated
            }
        });
        window.dispatchEvent(event);
    }
    
    // 清空表单
    clearForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            info: '#63b3ed'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 检查是否为管理员
    isAdmin() {
        return this.isAuthenticated && this.currentUser.role === 'admin';
    }
}

// 初始化预设用户数据
function initPresetUsers() {
    const users = JSON.parse(localStorage.getItem('dayz_users') || '[]');
    
    // 如果还没有用户数据，创建预设账户
    if (users.length === 0) {
        const presetUsers = [
            {
                id: '1',
                username: 'admin',
                email: 'admin@dayz.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString(),
                avatar: 'A'
            },
            {
                id: '2',
                username: 'user',
                email: 'user@dayz.com',
                password: 'user123',
                role: 'user',
                createdAt: new Date().toISOString(),
                avatar: 'U'
            }
        ];
        
        localStorage.setItem('dayz_users', JSON.stringify(presetUsers));
        console.log('预设用户账户已创建');
    }
}

// 初始化预设模组数据
function initPresetMods() {
    // 不再创建示例模组，只检查localStorage中是否有数据
    const mods = JSON.parse(localStorage.getItem(MODS_STORAGE_KEY) || '[]');
    console.log('当前模组数量:', mods.length);
}

// 确保页面加载时初始化数据
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPresetMods();
        initPresetUsers();
    });
} else {
    initPresetMods();
    initPresetUsers();
}

// 专业级模组筛选状态管理器
class ModsStateManager {
    constructor() {
        this.currentCategory = '全部';
        this.currentModule = '全部';
        this.isInitialized = false;
        this.historyStack = [];
        
        // 定义分类和模块的映射关系
        this.categoryModuleMap = {
            '全部': ['全部'],
            '武器': ['全部', '枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['全部', '套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['全部', '汽车', '摩托车', '直升机', '船只'],
            '建筑': ['全部', '房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['全部', '修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['全部', '天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        
        this.init();
    }
    
    init() {
        // 监听浏览器前进后退
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });
        
        // 初始状态恢复
        this.restoreStateFromURL();
        this.isInitialized = true;
    }
    
    // 从URL恢复状态
    restoreStateFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '全部';
        let module = urlParams.get('mod') || '全部';
        
        // 验证分类和模块的有效性
        if (!this.isValidCategory(category)) {
            category = '全部';
        }
        
        if (!this.isValidModule(module, category)) {
            module = '全部';
        }
        
        console.log('从URL恢复状态:', { category, module });
        
        this.updateState(category, module, false);
    }
    
    // 更新状态
    updateState(category, module, updateHistory = true) {
        // 验证参数有效性
        if (!this.isValidCategory(category) || !this.isValidModule(module, category)) {
            console.warn('无效的状态参数:', { category, module });
            return;
        }
        
        // 如果选择了"全部"分类，模块也必须是"全部"
        if (category === '全部' && module !== '全部') {
            module = '全部';
        }
        
        // 如果选择了具体分类，但模块不在该分类下，则重置为默认模块
        if (category !== '全部' && !this.categoryModuleMap[category].includes(module)) {
            module = this.getDefaultModuleForCategory(category);
        }
        
        this.currentCategory = category;
        this.currentModule = module;
        
        // 更新URL
        if (updateHistory) {
            this.updateURL();
        }
        
        // 触发状态变更事件
        this.triggerStateChange();
    }
    
    // 获取分类对应的默认模块
    getDefaultModuleForCategory(category) {
        const defaultModules = {
            '全部': '全部',
            '武器': '枪械',
            '服装': '套装',
            '载具': '汽车',
            '建筑': '房屋',
            '工具': '修理工具',
            '功能': '天气系统'
        };
        return defaultModules[category] || '全部';
    }
    
    // 获取分类对应的模块列表
    getModulesForCategory(category) {
        return this.categoryModuleMap[category] || ['全部'];
    }
    
    // 更新URL
    updateURL() {
        const params = new URLSearchParams();
        if (this.currentCategory) params.set('cat', this.currentCategory);
        if (this.currentModule) params.set('mod', this.currentModule);
        
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        
        // 使用pushState创建历史记录
        window.history.pushState(
            { 
                category: this.currentCategory, 
                module: this.currentModule,
                timestamp: Date.now()
            }, 
            '', 
            newUrl
        );
        
        console.log('URL已更新:', newUrl);
    }
    
    // 处理浏览器前进后退
    handlePopState(event) {
        console.log('popstate事件触发:', event.state);
        
        if (event.state) {
            const { category, module } = event.state;
            this.updateState(category, module, false);
        } else {
            // 没有状态信息，从URL恢复
            this.restoreStateFromURL();
        }
    }
    
    // 触发状态变更
    triggerStateChange() {
        // 触发自定义事件，让UI组件响应状态变化
        const event = new CustomEvent('modsStateChanged', {
            detail: {
                category: this.currentCategory,
                module: this.currentModule
            }
        });
        window.dispatchEvent(event);
    }
    
    // 验证分类有效性
    isValidCategory(category) {
        const validCategories = ['全部', '武器', '服装', '载具', '建筑', '工具', '功能'];
        return validCategories.includes(category);
    }
    
    // 验证模块有效性
    isValidModule(module, category) {
        if (category === '全部' && module === '全部') {
            return true;
        }
        
        const categoryModules = {
            '全部': ['全部'],
            '武器': ['全部', '枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['全部', '套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['全部', '汽车', '摩托车', '直升机', '船只'],
            '建筑': ['全部', '房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['全部', '修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['全部', '天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        
        return categoryModules[category]?.includes(module) || false;
    }
    
    // 获取当前状态
    getCurrentState() {
        return {
            category: this.currentCategory,
            module: this.currentModule
        };
    }
}

// 专业级UI控制器 - 采用事件驱动架构
class ModsUIController {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.categoryButtons = [];
        this.moduleButtons = [];
        this.modsGrid = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // 等待DOM完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }
    
    setupUI() {
        try {
            // 获取DOM元素
            this.categoryButtons = Array.from(document.querySelectorAll('.filter-row:first-child .filter-btn'));
            this.moduleButtons = Array.from(document.querySelectorAll('.filter-row:nth-child(2) .filter-btn'));
            this.modsGrid = document.querySelector('.mods-grid-enhanced');
            
            if (!this.modsGrid) {
                console.error('模组网格容器未找到');
                return;
            }
            
            // 绑定事件
            this.bindEvents();
            
            // 监听状态变化
            window.addEventListener('modsStateChanged', (event) => {
                this.handleStateChange(event.detail);
            });
            
            // 初始渲染
            this.handleStateChange(this.stateManager.getCurrentState());
            this.isInitialized = true;
            
            console.log('UI控制器初始化完成');
        } catch (error) {
            console.error('UI控制器初始化失败:', error);
        }
    }
    
    bindEvents() {
        // 分类按钮点击事件 - 采用事件委托优化性能
        const categoryContainer = document.querySelector('.filter-buttons-grid');
        if (categoryContainer) {
            categoryContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.filter-btn-enhanced');
                if (button) {
                    const category = button.getAttribute('data-category');
                    const defaultModule = this.stateManager.getDefaultModuleForCategory(category);
                    this.stateManager.updateState(category, defaultModule);
                }
            });
        }
        
        // 模块按钮点击事件 - 采用事件委托优化性能
        const moduleContainer = document.querySelector('.module-buttons');
        if (moduleContainer) {
            moduleContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.filter-btn-enhanced');
                if (button && button.style.display !== 'none') {
                    const module = button.getAttribute('data-module');
                    const currentCategory = this.stateManager.getCurrentState().category;
                    
                    // 专业逻辑：只有在当前分类下才允许选择模块
                    if (currentCategory !== '全部' && this.stateManager.getModulesForCategory(currentCategory).includes(module)) {
                        this.stateManager.updateState(currentCategory, module);
                    }
                }
            });
        }
    }
    
    // 处理状态变化
    handleStateChange(state) {
        const { category, module } = state;
        
        console.log('UI响应状态变化:', state);
        
        // 更新分类按钮状态
        this.updateCategoryButtons(category);
        
        // 更新模块按钮状态
        this.updateModuleButtons(category, module);
        
        // 显示对应模块的模组
        this.showModsForModule(category, module);
    }
    
    // 更新分类按钮
    updateCategoryButtons(activeCategory) {
        this.categoryButtons.forEach(btn => {
            const category = btn.textContent.trim();
            btn.classList.toggle('active', category === activeCategory);
        });
    }
    
    // 专业级模块按钮更新逻辑
    updateModuleButtons(activeCategory, activeModule) {
        // 获取当前分类对应的模块列表
        const validModules = this.stateManager.getModulesForCategory(activeCategory);
        
        // 更新所有模块按钮的显示状态和激活状态
        this.moduleButtons.forEach(btn => {
            const module = btn.textContent.trim();
            const isValidModule = validModules.includes(module);
            
            // 控制显示/隐藏
            btn.style.display = isValidModule ? '' : 'none';
            
            // 控制激活状态
            btn.classList.toggle('active', module === activeModule && isValidModule);
            
            // 添加禁用状态样式
            btn.classList.toggle('disabled', !isValidModule);
        });
        
        console.log(`更新模块按钮: 分类=${activeCategory}, 有效模块=${validModules.join(', ')}`);
    }
    
    // 专业级模组显示逻辑 - 显示实际模组数据
    showModsForModule(category, module) {
        if (!this.modsGrid) return;
        
        // 清空当前显示
        this.modsGrid.innerHTML = '';
        
        // 获取筛选后的模组数据
        const filteredMods = this.getFilteredMods(category, module);
        
        // 渲染所有模组
        filteredMods.forEach(mod => {
            const modElement = this.createModElement(mod);
            this.modsGrid.appendChild(modElement);
        });
        
        // 显示筛选结果信息
        this.showFilterInfo(category, module, filteredMods.length);
        
        console.log(`显示模组: 分类=${category}, 模块=${module}, 数量=${filteredMods.length}`);
    }
    
    // 获取筛选后的模组数据
    getFilteredMods(category, module) {
        // 从localStorage加载管理员添加的模组
        const adminMods = JSON.parse(localStorage.getItem(MODS_STORAGE_KEY) || '[]');
        
        // 只使用管理员添加的实际模组数据
        const allMods = [...adminMods];
        
        // 筛选逻辑
        let filteredMods = allMods;
        
        // 分类筛选
        if (category !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.category === category);
        }
        
        // 模块筛选
        if (module !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.module === module);
        }
        
        // 如果没有数据，显示默认模组
        if (filteredMods.length === 0) {
            filteredMods = [{
                id: `default-${category}-${module}`,
                name: `暂无${category}分类下的${module}模块模组`,
                description: `当前没有找到${category}分类下的${module}模块模组，请尝试其他分类或模块。`,
                version: 'v1.0.0',
                size: '0KB',
                image: 'images/weapon-mod.png',
                category: category,
                module: module
            }];
        }
        
        return filteredMods;
    }
    
    // 显示筛选信息
    showFilterInfo(category, module, count) {
        // 移除旧的筛选信息
        const oldInfo = document.querySelector('.filter-info');
        if (oldInfo) oldInfo.remove();
        
        // 创建新的筛选信息
        const infoDiv = document.createElement('div');
        infoDiv.className = 'filter-info';
        
        let infoText = '';
        if (category === '全部' && module === '全部') {
            infoText = `显示全部模组 (${count}个)`;
        } else if (module === '全部') {
            infoText = `显示${category}分类下的所有模组 (${count}个)`;
        } else {
            infoText = `显示${category}分类下的${module}模块模组 (${count}个)`;
        }
        
        infoDiv.innerHTML = `<p style="margin: 10px 0; color: #666; font-size: 14px;">${infoText}</p>`;
        
        // 插入到模组网格前
        if (this.modsGrid.parentNode) {
            this.modsGrid.parentNode.insertBefore(infoDiv, this.modsGrid);
        }
    }
    
    // 创建模组元素
    createModElement(mod) {
        const div = document.createElement('div');
        div.className = 'mod-item';
        div.innerHTML = `
            <div class="mod-image">
                <img src="${mod.image}" alt="${mod.name}" class="zoomable-image">
                <div class="mod-category">${mod.category}</div>
            </div>
            <div class="mod-info">
                <h3>${mod.name}</h3>
                <p class="mod-description">${mod.description}</p>
                <div class="mod-stats">
                    <span class="mod-version">${mod.version}</span>
                    <span class="mod-size">${mod.size}</span>
                </div>
                <div class="mod-actions">
                    <a href="details.html?item=${mod.id}" class="btn btn-primary">查看详情</a>
                </div>
            </div>
        `;
        return div;
    }
    
    // 获取分类对应的默认模块
    getDefaultModuleForCategory(category) {
        const defaultModules = {
            '全部': '全部',
            '武器': '枪械',
            '服装': '套装',
            '载具': '汽车',
            '建筑': '房屋',
            '工具': '修理工具',
            '功能': '天气系统'
        };
        return defaultModules[category] || '全部';
    }
    
    // 获取模块对应的分类
    getCategoryForModule(module) {
        const moduleToCategory = {};
        const categories = {
            '全部': ['全部'],
            '武器': ['全部', '枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['全部', '套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['全部', '汽车', '摩托车', '直升机', '船只'],
            '建筑': ['全部', '房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['全部', '修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['全部', '天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        
        for (const [category, modules] of Object.entries(categories)) {
            modules.forEach(mod => {
                moduleToCategory[mod] = category;
            });
        }
        
        return moduleToCategory[module];
    }
    
    // 获取分类对应的模块列表
    getModulesForCategory(category) {
        const categoryModules = {
            '全部': ['全部'],
            '武器': ['枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['汽车', '摩托车', '直升机', '船只'],
            '建筑': ['房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        return categoryModules[category] || [];
    }
    
    // 获取模块对应的模组数据
    getModsForModule(moduleName) {
        // 从localStorage加载管理员添加的模组
        const adminMods = JSON.parse(localStorage.getItem('dayz_mods') || '[]');
        
        // 仅返回一个示例模组（供管理员参考）
        const exampleMod = {
            id: 'example-mod',
            name: '示例模组',
            description: '这是一个示例模组，供管理员参考使用',
            version: 'v1.0.0',
            size: '1.0MB',
            image: 'images/weapon-mod.png',
            category: '全部',
            module: '全部'
        };
        return [exampleMod];
        
        // 为每个大类提供默认数据
        const defaultMod = {
            id: 'example-mod',
            name: '示例模组',
            description: '这是一个示例模组，用于演示功能',
            version: 'v1.0.0',
            size: '1.0MB',
            image: 'images/weapon-mod.png',
            category: '全部'
        };
        
        if (moduleName === '全部') {
            // 合并管理员添加的模组和预设模组
            const allMods = [...adminMods, ...(presetModsData['全部'] || [])];
            return allMods.length > 0 ? allMods : [defaultMod];
        }
        
        // 恢复原来的简单筛选：根据大类显示对应分类的模组
        const filteredAdminMods = adminMods.filter(mod => mod.category === moduleName);
        const filteredPresetMods = presetModsData[moduleName] || [];
        
        const allMods = [...filteredAdminMods, ...filteredPresetMods];
        return allMods.length > 0 ? allMods : [defaultMod];
    }
}

// 搜索功能控制器
class SearchController {
    constructor() {
        this.searchInput = null;
        this.init();
    }
    
    init() {
        this.searchInput = document.querySelector('#modSearch');
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }
    
    handleSearch(searchTerm) {
        const modItems = document.querySelectorAll('.mod-item');
        const term = searchTerm.toLowerCase().trim();
        
        modItems.forEach(item => {
            const modName = item.querySelector('h3').textContent.toLowerCase();
            const modDesc = item.querySelector('.mod-description').textContent.toLowerCase();
            
            if (term === '' || modName.includes(term) || modDesc.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// 主应用控制器
class ModsApp {
    constructor() {
        this.stateManager = null;
        this.uiController = null;
        this.searchController = null;
        
        this.init();
    }
    
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initPresetMods();
                initPresetUsers();
                this.startApp();
            });
        } else {
            initPresetMods();
            initPresetUsers();
            this.startApp();
        }
    }
    
    startApp() {
        console.log('启动DayZ社区模组展示应用');
        
        // 初始化各个组件
        this.stateManager = new ModsStateManager();
        this.uiController = new ModsUIController(this.stateManager);
        this.searchController = new SearchController();
        
        // 添加调试信息
        this.addDebugInfo();
    }
    
    addDebugInfo() {
        // 在控制台显示当前状态
        console.log('应用初始化完成');
        console.log('当前URL:', window.location.href);
        console.log('当前状态:', this.stateManager.getCurrentState());
        
        // 添加键盘快捷键调试
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                console.log('=== 调试信息 ===');
                console.log('当前状态:', this.stateManager.getCurrentState());
                console.log('历史记录长度:', window.history.length);
                console.log('URL参数:', new URLSearchParams(window.location.search).toString());
            }
        });
    }
}

// 页面初始化功能
function initPageFunctions() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'mods.html':
            // 启动模组展示应用
            new ModsApp();
            break;
        case 'about.html':
            initAboutPage();
            break;
    }
}

// 主页功能
function initHomePage() {
    // 添加滚动动画效果
    window.addEventListener('scroll', function() {
        const modCards = document.querySelectorAll('.mod-card');
        const windowHeight = window.innerHeight;
        
        modCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            if (cardTop < windowHeight - 100) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    });
    
    // 初始化卡片动画
    const modCards = document.querySelectorAll('.mod-card');
    modCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.transitionDelay = `${index * 0.2}s`;
    });
    
    // 触发初始动画
    setTimeout(() => {
        modCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (cardTop < windowHeight - 100) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }, 100);
}

// 关于页面功能
function initAboutPage() {
    // 联系表单提交
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // 模拟表单提交
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = '发送成功！';
                submitBtn.style.background = '#48bb78';
                
                // 显示成功消息
                showNotification('消息发送成功！我们会尽快回复您。');
                
                // 重置表单
                setTimeout(() => {
                    this.reset();
                    submitBtn.textContent = '发送消息';
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }, 2000);
        });
    }
}

// 显示通知消息
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 主页面初始化函数
function initMainPage() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // 高亮当前页面导航链接
    highlightCurrentPage();
    
    // 初始化页面功能
    initPageFunctions();
}

// 高亮当前页面导航链接
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// 页面加载动画
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 图片放大查看功能
function initImageZoom() {
    // 创建模态框结构
    const modalHTML = `
        <div class="image-modal" id="imageModal">
            <span class="modal-close" id="modalClose">&times;</span>
            <button class="modal-nav modal-prev" id="modalPrev">&#10094;</button>
            <button class="modal-nav modal-next" id="modalNext">&#10095;</button>
            <div class="modal-image-container" id="modalImageContainer">
                <img class="modal-content" id="modalImage">
            </div>
            <div class="modal-controls">
                <button class="zoom-control zoom-out" id="zoomOut">-</button>
                <span class="zoom-level" id="zoomLevel">100%</span>
                <button class="zoom-control zoom-in" id="zoomIn">+</button>
                <button class="zoom-control zoom-reset" id="zoomReset">重置</button>
            </div>
            <div class="modal-caption" id="modalCaption"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('imageModal');
    const modalImageContainer = document.getElementById('modalImageContainer');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const zoomOut = document.getElementById('zoomOut');
    const zoomIn = document.getElementById('zoomIn');
    const zoomReset = document.getElementById('zoomReset');
    const zoomLevel = document.getElementById('zoomLevel');
    
    let currentImageIndex = 0;
    let zoomableImages = [];
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    // 获取所有可放大的图片
    function updateZoomableImages() {
        zoomableImages = Array.from(document.querySelectorAll('.zoomable-image'));
    }
    
    // 显示图片
    function showImage(index) {
        if (zoomableImages.length === 0) return;
        
        const image = zoomableImages[index];
        const imageSrc = image.getAttribute('data-zoom-src') || image.src;
        const imageAlt = image.alt || '图片';
        
        modalImage.src = imageSrc;
        modalCaption.textContent = imageAlt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        currentImageIndex = index;
        resetZoom();
        updateNavigationButtons();
    }
    
    // 更新导航按钮状态
    function updateNavigationButtons() {
        modalPrev.style.display = zoomableImages.length > 1 ? 'block' : 'none';
        modalNext.style.display = zoomableImages.length > 1 ? 'block' : 'none';
    }
    
    // 显示下一张图片
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % zoomableImages.length;
        showImage(currentImageIndex);
    }
    
    // 显示上一张图片
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + zoomableImages.length) % zoomableImages.length;
        showImage(currentImageIndex);
    }
    
    // 缩放图片
    function zoomImage(scale) {
        currentScale = Math.max(1, Math.min(5, scale));
        modalImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
        zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
        
        // 更新拖拽限制
        updateDragLimits();
    }
    
    // 重置缩放
    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        modalImage.style.transform = 'scale(1) translate(0px, 0px)';
        zoomLevel.textContent = '100%';
    }
    
    // 更新拖拽限制
    function updateDragLimits() {
        const containerRect = modalImageContainer.getBoundingClientRect();
        const imageRect = modalImage.getBoundingClientRect();
        
        // 计算最大可移动范围
        const maxTranslateX = Math.max(0, (imageRect.width * currentScale - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imageRect.height * currentScale - containerRect.height) / 2);
        
        // 如果图片比容器小，限制移动范围
        const minTranslateX = currentScale <= 1 ? 0 : -maxTranslateX;
        const minTranslateY = currentScale <= 1 ? 0 : -maxTranslateY;
        
        translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
        translateY = Math.max(minTranslateY, Math.min(maxTranslateY, translateY));
        
        modalImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
    }
    
    // 开始拖拽
    function startDrag(e) {
        // 允许在任何缩放状态下拖拽
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImage.style.cursor = 'grabbing';
        modalImageContainer.style.cursor = 'grabbing';
        
        // 阻止默认行为，防止文本选择
        e.preventDefault();
    }
    
    // 拖拽中
    function drag(e) {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        updateDragLimits();
    }
    
    // 结束拖拽
    function endDrag() {
        isDragging = false;
        modalImage.style.cursor = 'grab';
        modalImageContainer.style.cursor = 'grab';
    }
    
    // 处理鼠标滚轮缩放
    function handleWheel(e) {
        if (!modal.classList.contains('active')) return;
        
        e.preventDefault();
        
        // 检测是否为鼠标中键滚轮（wheel事件默认处理所有滚轮）
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(currentScale + delta);
    }
    
    // 关闭模态框
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetZoom();
        
        // 添加关闭动画
        setTimeout(() => {
            modal.style.animation = 'zoomOut 0.3s ease';
            setTimeout(() => {
                modal.style.animation = '';
            }, 300);
        }, 50);
    }
    
    // 绑定事件
    function bindEvents() {
        // 图片点击事件
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('zoomable-image')) {
                updateZoomableImages();
                const index = zoomableImages.indexOf(e.target);
                if (index !== -1) {
                    showImage(index);
                }
            }
        });
        
        // 关闭按钮
        modalClose.addEventListener('click', closeModal);
        
        // 上一张/下一张按钮
        modalPrev.addEventListener('click', showPrevImage);
        modalNext.addEventListener('click', showNextImage);
        
        // 缩放控制按钮
        zoomOut.addEventListener('click', () => zoomImage(currentScale - 0.2));
        zoomIn.addEventListener('click', () => zoomImage(currentScale + 0.2));
        zoomReset.addEventListener('click', resetZoom);
        
        // 鼠标滚轮缩放
        modalImageContainer.addEventListener('wheel', handleWheel, { passive: false });
        
        // 拖拽事件
        modalImage.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            } else if (e.key === 'ArrowLeft' && modal.classList.contains('active')) {
                showPrevImage();
            } else if (e.key === 'ArrowRight' && modal.classList.contains('active')) {
                showNextImage();
            }
        });
        
        // 点击模态框背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // 初始化
    updateZoomableImages();
    bindEvents();
}

// 在页面初始化时调用图片放大功能
// 此功能已整合到initAllSystems函数中

// 详情页图片放大功能
function initDetailsImageZoom() {
    // 检查是否在详情页
    const imageGallery = document.getElementById('item-images');
    if (!imageGallery) return;
    
    // 创建模态框结构（如果尚未创建）
    if (!document.getElementById('imageModal')) {
        const modalHTML = `
            <div class="image-modal" id="imageModal">
                <span class="modal-close" id="modalClose">&times;</span>
                <button class="modal-nav modal-prev" id="modalPrev">&#10094;</button>
                <button class="modal-nav modal-next" id="modalNext">&#10095;</button>
                <div class="modal-image-container" id="modalImageContainer">
                    <img class="modal-content" id="modalImage">
                </div>
                <div class="modal-controls">
                    <button class="zoom-control zoom-out" id="zoomOut">-</button>
                    <span class="zoom-level" id="zoomLevel">100%</span>
                    <button class="zoom-control zoom-in" id="zoomIn">+</button>
                    <button class="zoom-control zoom-reset" id="zoomReset">重置</button>
                </div>
                <div class="modal-caption" id="modalCaption"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const modal = document.getElementById('imageModal');
    const modalImageContainer = document.getElementById('modalImageContainer');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const zoomOut = document.getElementById('zoomOut');
    const zoomIn = document.getElementById('zoomIn');
    const zoomReset = document.getElementById('zoomReset');
    const zoomLevel = document.getElementById('zoomLevel');
    
    let currentImageIndex = 0;
    let zoomableImages = [];
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    // 获取所有可放大的图片
    function updateZoomableImages() {
        zoomableImages = Array.from(document.querySelectorAll('#item-images .zoomable-image'));
    }
    
    // 显示图片
    function showImage(index) {
        if (zoomableImages.length === 0) return;
        
        const image = zoomableImages[index];
        const imageSrc = image.getAttribute('data-zoom-src') || image.src;
        const imageAlt = image.alt || '图片';
        
        modalImage.src = imageSrc;
        modalCaption.textContent = imageAlt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        currentImageIndex = index;
        resetZoom();
        updateNavigationButtons();
    }
    
    // 更新导航按钮状态
    function updateNavigationButtons() {
        modalPrev.style.display = zoomableImages.length > 1 ? 'block' : 'none';
        modalNext.style.display = zoomableImages.length > 1 ? 'block' : 'none';
    }
    
    // 显示下一张图片
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % zoomableImages.length;
        showImage(currentImageIndex);
    }
    
    // 显示上一张图片
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + zoomableImages.length) % zoomableImages.length;
        showImage(currentImageIndex);
    }
    
    // 缩放图片
    function zoomImage(scale) {
        currentScale = Math.max(1, Math.min(5, scale));
        modalImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
        zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
        
        // 更新拖拽限制
        updateDragLimits();
    }
    
    // 重置缩放
    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        modalImage.style.transform = 'scale(1) translate(0px, 0px)';
        zoomLevel.textContent = '100%';
    }
    
    // 更新拖拽限制
    function updateDragLimits() {
        const containerRect = modalImageContainer.getBoundingClientRect();
        const imageRect = modalImage.getBoundingClientRect();
        
        // 计算最大可移动范围
        const maxTranslateX = Math.max(0, (imageRect.width * currentScale - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imageRect.height * currentScale - containerRect.height) / 2);
        
        // 如果图片比容器小，限制移动范围
        const minTranslateX = currentScale <= 1 ? 0 : -maxTranslateX;
        const minTranslateY = currentScale <= 1 ? 0 : -maxTranslateY;
        
        translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
        translateY = Math.max(minTranslateY, Math.min(maxTranslateY, translateY));
        
        modalImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
    }
    
    // 开始拖拽
    function startDrag(e) {
        // 允许在任何缩放状态下拖拽
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImage.style.cursor = 'grabbing';
        modalImageContainer.style.cursor = 'grabbing';
        
        // 阻止默认行为，防止文本选择
        e.preventDefault();
    }
    
    // 拖拽中
    function drag(e) {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        updateDragLimits();
    }
    
    // 结束拖拽
    function endDrag() {
        isDragging = false;
        modalImage.style.cursor = 'grab';
        modalImageContainer.style.cursor = 'grab';
    }
    
    // 处理鼠标滚轮缩放
    function handleWheel(e) {
        if (!modal.classList.contains('active')) return;
        
        e.preventDefault();
        
        // 检测是否为鼠标中键滚轮（wheel事件默认处理所有滚轮）
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(currentScale + delta);
    }
    
    // 关闭模态框
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetZoom();
        
        // 添加关闭动画
        setTimeout(() => {
            modal.style.animation = 'zoomOut 0.3s ease';
            setTimeout(() => {
                modal.style.animation = '';
            }, 300);
        }, 50);
    }
    
    // 绑定事件
    function bindEvents() {
        // 图片点击事件
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('zoomable-image')) {
                updateZoomableImages();
                const index = zoomableImages.indexOf(e.target);
                if (index !== -1) {
                    showImage(index);
                }
            }
        });
        
        // 关闭按钮
        modalClose.addEventListener('click', closeModal);
        
        // 上一张/下一张按钮
        modalPrev.addEventListener('click', showPrevImage);
        modalNext.addEventListener('click', showNextImage);
        
        // 缩放控制按钮
        zoomOut.addEventListener('click', () => zoomImage(currentScale - 0.2));
        zoomIn.addEventListener('click', () => zoomImage(currentScale + 0.2));
        zoomReset.addEventListener('click', resetZoom);
        
        // 鼠标滚轮缩放
        modalImageContainer.addEventListener('wheel', handleWheel, { passive: false });
        
        // 拖拽事件
        modalImage.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            } else if (e.key === 'ArrowLeft' && modal.classList.contains('active')) {
                showPrevImage();
            } else if (e.key === 'ArrowRight' && modal.classList.contains('active')) {
                showNextImage();
            }
        });
        
        // 点击模态框背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // 初始化
    updateZoomableImages();
    bindEvents();
}

// 动态加载详情页内容
function loadModDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemKey = urlParams.get("item");
    
    if (!itemKey) {
        showNotFoundMessage();
        return;
    }
    
    // 从localStorage加载模组数据
    const adminMods = JSON.parse(localStorage.getItem(MODS_STORAGE_KEY) || '[]');
    console.log('从localStorage加载的模组数据:', adminMods);
    console.log('查找模组ID:', itemKey);
    
    const mod = adminMods.find(m => m.id === itemKey);
    console.log('找到的模组:', mod);
    
    if (mod) {
        // 显示模组详情
        document.getElementById("item-title").textContent = mod.name || "未命名模组";
        document.getElementById("item-description").textContent = mod.description || "暂无描述";
        
        const imageGallery = document.getElementById("item-images");
        
        // 清空图片容器
        imageGallery.innerHTML = '';
        
        // 添加主图片
        if (mod.image) {
            const imgContainer = document.createElement("div");
            imgContainer.className = "gallery-item";
            
            const img = document.createElement("img");
            img.src = mod.image;
            img.alt = mod.name || "模组图片";
            img.className = "zoomable-image";
            
            imgContainer.appendChild(img);
            imageGallery.appendChild(imgContainer);
        }
        
        // 添加截图图片
        if (mod.screenshots && Array.isArray(mod.screenshots)) {
            mod.screenshots.forEach((src, index) => {
                if (src.trim()) {
                    const imgContainer = document.createElement("div");
                    imgContainer.className = "gallery-item";
                    
                    const img = document.createElement("img");
                    img.src = src.trim();
                    img.alt = `${mod.name || "模组"} - 截图${index + 1}`;
                    img.className = "zoomable-image";
                    
                    imgContainer.appendChild(img);
                    imageGallery.appendChild(imgContainer);
                }
            });
        }
        
        // 添加模组详细信息
        const detailsContainer = document.createElement("div");
        detailsContainer.className = "mod-details-info";
        detailsContainer.innerHTML = `
            <div class="detail-section">
                <h3>模组信息</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">分类：</span>
                        <span class="detail-value">${mod.category || "未分类"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">模块：</span>
                        <span class="detail-value">${mod.module || "未指定"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">版本：</span>
                        <span class="detail-value">${mod.version || "v1.0.0"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">大小：</span>
                        <span class="detail-value">${mod.size || "未知"}</span>
                    </div>
                </div>
            </div>
            
            ${mod.features && mod.features.length > 0 ? `
            <div class="detail-section">
                <h3>功能特性</h3>
                <div class="features-list">
                    ${Array.isArray(mod.features) ? 
                        mod.features.map(feature => feature.trim()).filter(feature => feature).map(feature => 
                            `<div class="feature-item">• ${feature}</div>`
                        ).join('') :
                        mod.features.split('\n').map(feature => feature.trim()).filter(feature => feature).map(feature => 
                            `<div class="feature-item">• ${feature}</div>`
                        ).join('')
                    }
                </div>
            </div>
            ` : ''}
            
            ${mod.compatibility ? `
            <div class="detail-section">
                <h3>兼容性</h3>
                <div class="compatibility-info">
                    ${typeof mod.compatibility === 'string' ? mod.compatibility : 
                      `游戏版本: ${mod.compatibility.gameVersion || '未知'}<br>
                       依赖模组: ${mod.compatibility.requiredMods || '无'}<br>
                       运行环境: ${mod.compatibility.serverSide || '客户端/服务端'}`}
                </div>
            </div>
            ` : ''}
        `;
        
        // 插入到专门的模组详细信息容器中
        const modDetailsContainer = document.getElementById('mod-details-container');
        console.log('找到的模组详细信息容器:', modDetailsContainer);
        
        if (modDetailsContainer) {
            modDetailsContainer.appendChild(detailsContainer);
            console.log('模组详细信息已插入到专用容器中');
        } else {
            // 如果找不到专用容器，插入到图片库后面
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(detailsContainer);
                console.log('模组详细信息已插入到容器中');
            } else {
                // 如果还是找不到，插入到body末尾
                document.body.appendChild(detailsContainer);
                console.log('模组详细信息已插入到body末尾');
            }
        }
        
        console.log('模组详细信息HTML:', detailsContainer.innerHTML);
        
        // 为详情页图片初始化放大功能
        initDetailsImageZoom();
        
    } else {
        showNotFoundMessage();
    }
}

// 显示未找到模组的消息
function showNotFoundMessage() {
    const titleElement = document.getElementById("item-title");
    const descElement = document.getElementById("item-description");
    
    if (titleElement && descElement) {
        titleElement.textContent = "未找到模组";
        descElement.textContent = "请返回模组列表选择一个有效的模组。";
    } else {
        console.log('[预期行为] 详情页元素未找到：', 
            titleElement ? '标题存在' : '标题缺失',
            descElement ? '描述存在' : '描述缺失'
        );
    }
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModDetails);
} else {
    loadModDetails();
}

console.log('DayZ社区模组展示系统加载完成 - 现代化架构设计');

// 全局用户认证管理器实例
let userAuth = null;

// 初始化用户认证系统
function initUserAuth() {
    // 初始化预设用户数据
    initPresetUsers();
    
    // 初始化预设模组数据
    initPresetMods();
    
    // 创建用户认证管理器实例
    userAuth = new UserAuthManager();
    
    // 监听用户状态变化，更新管理员导航链接
    window.addEventListener('userStateChanged', (event) => {
        updateAdminNavLink(event.detail.user);
    });
    
    // 初始更新管理员导航链接
    const userData = localStorage.getItem('dayz_user');
    if (userData) {
        const user = JSON.parse(userData);
        updateAdminNavLink(user);
    }
}

// 更新管理员导航链接显示状态
function updateAdminNavLink(user) {
    const adminNavItem = document.getElementById('adminNavItem');
    if (adminNavItem) {
        if (user && user.role === 'admin') {
            adminNavItem.style.display = 'block';
        } else {
            adminNavItem.style.display = 'none';
        }
    }
}

// 主页面初始化函数
function initMainPage() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // 高亮当前页面导航链接
    highlightCurrentPage();
    
    // 初始化页面功能
    initPageFunctions();
}

// 页面加载完成后初始化所有系统
function initAllSystems() {
    // 初始化用户认证系统
    initUserAuth();
    
    // 初始化主页面功能
    initMainPage();
    
    // 初始化图片放大功能
    initImageZoom();
}

// ==================== 专业级模组筛选系统 ====================
// 作为10年经验的前端技术总监，重新设计的分类筛选系统

// 模组数据管理器
class ModsDataManager {
    constructor() {
        this.modsData = this.initializeModsData();
    }
    
    initializeModsData() {
        // 从localStorage加载管理员添加的模组
        const adminMods = JSON.parse(localStorage.getItem('dayz_mods') || '[]');
        
        // 预设模组数据
        const presetMods = [
            { id: 'modern-weapons', name: '现代武器包', description: '添加30+现代军事武器', version: 'v1.0.0', size: '2.5MB', image: 'images/weapon-mod.png', category: '武器', module: '枪械' },
            { id: 'sniper-package', name: '狙击手专用包', description: '狙击装备套装', version: 'v1.0.0', size: '1.8MB', image: 'images/weapon-mod.png', category: '武器', module: '枪械' },
            { id: 'weapon-accessories', name: '武器配件包', description: '各种武器配件和附件', version: 'v1.0.0', size: '1.2MB', image: 'images/weapon-mod.png', category: '武器', module: '配件' },
            { id: 'melee-weapons', name: '近身武器包', description: '各种近战武器和工具', version: 'v1.0.0', size: '1.5MB', image: 'images/weapon-mod.png', category: '武器', module: '近身武器' },
            { id: 'throwable-weapons', name: '投掷武器包', description: '手榴弹、炸药等投掷武器', version: 'v1.0.0', size: '0.8MB', image: 'images/weapon-mod.png', category: '武器', module: '投掷武器' },
            
            { id: 'military-uniform', name: '军用制服套装', description: '多种军用制服和装备', version: 'v1.0.0', size: '1.5MB', image: 'images/weapon-mod.png', category: '服装', module: '套装' },
            { id: 'survival-gear', name: '生存装备套装', description: '完整的生存装备组合', version: 'v1.0.0', size: '1.7MB', image: 'images/weapon-mod.png', category: '服装', module: '套装' },
            { id: 'civilian-outfit', name: '平民服装套装', description: '日常服装和配饰', version: 'v1.0.0', size: '1.3MB', image: 'images/weapon-mod.png', category: '服装', module: '套装' },
            { id: 'helmets-collection', name: '头盔收藏包', description: '各种军用和民用头盔', version: 'v1.0.0', size: '1.0MB', image: 'images/weapon-mod.png', category: '服装', module: '头盔' },
            { id: 'glasses-pack', name: '眼镜配件包', description: '各种眼镜和护目镜', version: 'v1.0.0', size: '0.6MB', image: 'images/weapon-mod.png', category: '服装', module: '眼镜' },
            { id: 'masks-collection', name: '面具收藏包', description: '各种面具和面罩', version: 'v1.0.0', size: '0.8MB', image: 'images/weapon-mod.png', category: '服装', module: '面具' },
            { id: 'tops-collection', name: '上衣收藏包', description: '各种T恤、衬衫和外套', version: 'v1.0.0', size: '1.2MB', image: 'images/weapon-mod.png', category: '服装', module: '上衣' },
            { id: 'vests-collection', name: '防弹衣收藏包', description: '各种防弹背心和战术背心', version: 'v1.0.0', size: '1.4MB', image: 'images/weapon-mod.png', category: '服装', module: '防弹衣' },
            { id: 'gloves-collection', name: '手套收藏包', description: '各种手套和护手', version: 'v1.0.0', size: '0.7MB', image: 'images/weapon-mod.png', category: '服装', module: '手套' },
            { id: 'backpacks-collection', name: '背包收藏包', description: '各种背包和战术包', version: 'v1.0.0', size: '1.1MB', image: 'images/weapon-mod.png', category: '服装', module: '背包' },
            { id: 'belts-collection', name: '腰带收藏包', description: '各种腰带和战术腰带', version: 'v1.0.0', size: '0.9MB', image: 'images/weapon-mod.png', category: '服装', module: '腰带' },
            { id: 'pants-collection', name: '裤子收藏包', description: '各种裤子和战术裤', version: 'v1.0.0', size: '1.3MB', image: 'images/weapon-mod.png', category: '服装', module: '裤子' },
            { id: 'shoes-collection', name: '鞋子收藏包', description: '各种鞋子和靴子', version: 'v1.0.0', size: '1.0MB', image: 'images/weapon-mod.png', category: '服装', module: '鞋子' },
            
            { id: 'military-vehicles', name: '军用载具包', description: '15种军用载具', version: 'v1.0.0', size: '3.2MB', image: 'images/weapon-mod.png', category: '载具', module: '汽车' },
            { id: 'civilian-cars', name: '民用车辆扩展', description: '20+民用车辆', version: 'v1.0.0', size: '2.9MB', image: 'images/weapon-mod.png', category: '载具', module: '汽车' },
            { id: 'motorcycles-pack', name: '摩托车收藏包', description: '各种摩托车和越野车', version: 'v1.0.0', size: '2.1MB', image: 'images/weapon-mod.png', category: '载具', module: '摩托车' },
            { id: 'helicopter-expansion', name: '直升机扩展', description: '军用和民用直升机', version: 'v1.0.0', size: '4.5MB', image: 'images/weapon-mod.png', category: '载具', module: '直升机' },
            { id: 'boats-collection', name: '船只收藏包', description: '各种船只和水上载具', version: 'v1.0.0', size: '2.8MB', image: 'images/weapon-mod.png', category: '载具', module: '船只' },
            
            { id: 'survival-base', name: '生存基地建设', description: '200+建筑组件', version: 'v1.0.0', size: '4.1MB', image: 'images/weapon-mod.png', category: '建筑', module: '房屋' },
            { id: 'fences-collection', name: '围栏收藏包', description: '各种围栏和障碍物', version: 'v1.0.0', size: '2.3MB', image: 'images/weapon-mod.png', category: '建筑', module: '围栏' },
            { id: 'doors-collection', name: '门收藏包', description: '各种门和门锁系统', version: 'v1.0.0', size: '1.8MB', image: 'images/weapon-mod.png', category: '建筑', module: '门' },
            { id: 'stairs-collection', name: '楼梯收藏包', description: '各种楼梯和梯子', version: 'v1.0.0', size: '1.5MB', image: 'images/weapon-mod.png', category: '建筑', module: '楼梯' },
            { id: 'decorations-pack', name: '装饰品收藏包', description: '各种装饰品和家具', version: 'v1.0.0', size: '2.6MB', image: 'images/weapon-mod.png', category: '建筑', module: '装饰' },
            
            { id: 'repair-tools', name: '修理工具包', description: '各种修理工具和设备', version: 'v1.0.0', size: '1.4MB', image: 'images/weapon-mod.png', category: '工具', module: '修理工具' },
            { id: 'medical-tools', name: '医疗工具包', description: '各种医疗工具和用品', version: 'v1.0.0', size: '1.7MB', image: 'images/weapon-mod.png', category: '工具', module: '医疗工具' },
            { id: 'cooking-tools', name: '烹饪工具包', description: '各种烹饪工具和厨具', version: 'v1.0.0', size: '1.2MB', image: 'images/weapon-mod.png', category: '工具', module: '烹饪工具' },
            { id: 'gathering-tools', name: '采集工具包', description: '各种采集工具和设备', version: 'v1.0.0', size: '1.0MB', image: 'images/weapon-mod.png', category: '工具', module: '采集工具' },
            
            { id: 'weather-system', name: '天气系统', description: '动态天气和气候系统', version: 'v1.0.0', size: '2.5MB', image: 'images/weapon-mod.png', category: '功能', module: '天气系统' },
            { id: 'quest-system', name: '任务系统', description: '完整的任务和成就系统', version: 'v1.0.0', size: '3.1MB', image: 'images/weapon-mod.png', category: '功能', module: '任务系统' },
            { id: 'economy-system', name: '经济系统', description: '交易和经济系统', version: 'v1.0.0', size: '2.8MB', image: 'images/weapon-mod.png', category: '功能', module: '经济系统' },
            { id: 'ai-system', name: 'AI系统', description: '智能AI和NPC系统', version: 'v1.0.0', size: '4.2MB', image: 'images/weapon-mod.png', category: '功能', module: 'AI系统' },
            { id: 'special-features', name: '特殊功能包', description: '各种特殊功能和效果', version: 'v1.0.0', size: '2.3MB', image: 'images/weapon-mod.png', category: '功能', module: '特殊功能' },
            { id: 'interaction-system', name: '交互系统', description: '增强的交互系统', version: 'v1.0.0', size: '1.9MB', image: 'images/weapon-mod.png', category: '功能', module: '交互系统' },
            { id: 'entertainment-pack', name: '娱乐组件包', description: '各种娱乐和休闲组件', version: 'v1.0.0', size: '1.6MB', image: 'images/weapon-mod.png', category: '功能', module: '娱乐组件' }
        ];
        
        // 合并管理员添加的模组和预设模组
        return [...adminMods, ...presetMods];
    }
    
    // 获取所有分类
    getAllCategories() {
        return ['全部', '武器', '服装', '载具', '建筑', '工具', '功能'];
    }
    
    // 获取分类对应的模块
    getModulesForCategory(category) {
        const categoryModuleMap = {
            '全部': ['全部'],
            '武器': ['全部', '枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['全部', '套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['全部', '汽车', '摩托车', '直升机', '船只'],
            '建筑': ['全部', '房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['全部', '修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['全部', '天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        
        return categoryModuleMap[category] || ['全部'];
    }
    
    // 获取分类对应的默认模块
    getDefaultModuleForCategory(category) {
        const defaultModules = {
            '全部': '全部',
            '武器': '枪械',
            '服装': '套装',
            '载具': '汽车',
            '建筑': '房屋',
            '工具': '修理工具',
            '功能': '天气系统'
        };
        
        return defaultModules[category] || '全部';
    }
    
    // 筛选模组数据
    filterMods(category, module) {
        let filteredMods = this.modsData;
        
        // 分类筛选
        if (category !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.category === category);
        }
        
        // 模块筛选
        if (module !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.module === module);
        }
        
        return filteredMods;
    }
}

// 专业级筛选UI控制器
class ModsFilterUI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentCategory = '全部';
        this.currentModule = '全部';
        this.categoryButtons = [];
        this.moduleButtons = [];
        this.modsGrid = null;
        this.searchInput = null;
        
        this.init();
    }
    
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }
    
    setupUI() {
        try {
            console.log('开始初始化专业级模组筛选系统...');
            
            // 获取DOM元素
            this.categoryButtons = Array.from(document.querySelectorAll('.filter-row:first-child .filter-btn'));
            this.moduleButtons = Array.from(document.querySelectorAll('.filter-row:nth-child(2) .filter-btn'));
            this.modsGrid = document.querySelector('.mods-grid-enhanced');
            this.searchInput = document.querySelector('#modSearch');
            
            if (!this.modsGrid) {
                console.error('模组网格容器未找到');
                return;
            }
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化UI状态
            this.initializeUIState();
            
            // 渲染初始模组
            this.renderMods();
            
            console.log('专业级模组筛选系统初始化完成');
        } catch (error) {
            console.error('模组筛选系统初始化失败:', error);
        }
    }
    
    bindEvents() {
        // 分类按钮点击事件 - 使用事件委托
        const categoryRow = document.querySelector('.filter-row:first-child');
        if (categoryRow) {
            categoryRow.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    const category = e.target.textContent.trim();
                    this.handleCategoryClick(category);
                }
            });
        }
        
        // 模块按钮点击事件 - 使用事件委托
        const moduleRow = document.querySelector('.filter-row:nth-child(2)');
        if (moduleRow) {
            moduleRow.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn') && e.target.style.display !== 'none') {
                    const module = e.target.textContent.trim();
                    this.handleModuleClick(module);
                }
            });
        }
        
        // 搜索功能
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }
    
    initializeUIState() {
        // 初始化分类按钮
        this.updateCategoryButtons();
        
        // 初始化模块按钮
        this.updateModuleButtons();
    }
    
    handleCategoryClick(category) {
        console.log('点击分类:', category);
        
        this.currentCategory = category;
        this.currentModule = this.dataManager.getDefaultModuleForCategory(category);
        
        // 更新UI状态
        this.updateCategoryButtons();
        this.updateModuleButtons();
        
        // 渲染模组
        this.renderMods();
        
        // 更新URL参数
        this.updateURL();
    }
    
    handleModuleClick(module) {
        console.log('点击模块:', module);
        
        this.currentModule = module;
        
        // 更新UI状态
        this.updateModuleButtons();
        
        // 渲染模组
        this.renderMods();
        
        // 更新URL参数
        this.updateURL();
    }
    
    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const modItems = document.querySelectorAll('.mod-item');
        
        modItems.forEach(item => {
            const modName = item.querySelector('h3').textContent.toLowerCase();
            const modDescription = item.querySelector('.mod-description').textContent.toLowerCase();
            
            const isVisible = modName.includes(term) || modDescription.includes(term);
            item.style.display = isVisible ? '' : 'none';
        });
    }
    
    updateCategoryButtons() {
        this.categoryButtons.forEach(btn => {
            const category = btn.textContent.trim();
            const isActive = category === this.currentCategory;
            
            btn.classList.toggle('active', isActive);
        });
    }
    
    updateModuleButtons() {
        const validModules = this.dataManager.getModulesForCategory(this.currentCategory);
        
        this.moduleButtons.forEach(btn => {
            const module = btn.textContent.trim();
            const isValid = validModules.includes(module);
            const isActive = module === this.currentModule;
            
            // 控制显示/隐藏
            btn.style.display = isValid ? '' : 'none';
            
            // 控制激活状态
            btn.classList.toggle('active', isActive);
            
            // 添加禁用状态样式
            btn.classList.toggle('disabled', !isValid);
        });
    }
    
    renderMods() {
        // 清空当前显示
        this.modsGrid.innerHTML = '';
        
        // 获取筛选后的模组
        const filteredMods = this.dataManager.filterMods(this.currentCategory, this.currentModule);
        
        // 显示筛选信息
        this.showFilterInfo(filteredMods.length);
        
        // 渲染模组
        filteredMods.forEach(mod => {
            const modElement = this.createModElement(mod);
            this.modsGrid.appendChild(modElement);
        });
        
        console.log(`渲染完成: 分类=${this.currentCategory}, 模块=${this.currentModule}, 数量=${filteredMods.length}`);
    }
    
    showFilterInfo(count) {
        // 移除旧的筛选信息
        const oldInfo = document.querySelector('.filter-info');
        if (oldInfo) oldInfo.remove();
        
        // 创建新的筛选信息
        const infoDiv = document.createElement('div');
        infoDiv.className = 'filter-info';
        
        let infoText = '';
        if (this.currentCategory === '全部' && this.currentModule === '全部') {
            infoText = `显示全部模组 (${count}个)`;
        } else if (this.currentModule === '全部') {
            infoText = `显示${this.currentCategory}分类下的所有模组 (${count}个)`;
        } else {
            infoText = `显示${this.currentCategory}分类下的${this.currentModule}模块模组 (${count}个)`;
        }
        
        infoDiv.innerHTML = `<p style="margin: 10px 0; color: #a0aec0; font-size: 14px;">${infoText}</p>`;
        
        // 插入到模组网格前
        if (this.modsGrid.parentNode) {
            this.modsGrid.parentNode.insertBefore(infoDiv, this.modsGrid);
        }
    }
    
    createModElement(mod) {
        const div = document.createElement('div');
        div.className = 'mod-item';
        div.innerHTML = `
            <div class="mod-image">
                <img src="${mod.image}" alt="${mod.name}" class="zoomable-image">
                <div class="mod-category">${mod.category}</div>
            </div>
            <div class="mod-info">
                <h3>${mod.name}</h3>
                <p class="mod-description">${mod.description}</p>
                <div class="mod-stats">
                    <span class="mod-version">${mod.version}</span>
                    <span class="mod-size">${mod.size}</span>
                </div>
                <div class="mod-actions">
                    <a href="details.html?item=${mod.id}" class="btn btn-primary">查看详情</a>
                </div>
            </div>
        `;
        return div;
    }
    
    updateURL() {
        const url = new URL(window.location);
        if (this.currentCategory !== '全部') {
            url.searchParams.set('cat', this.currentCategory);
        } else {
            url.searchParams.delete('cat');
        }
        
        if (this.currentModule !== '全部') {
            url.searchParams.set('mod', this.currentModule);
        } else {
            url.searchParams.delete('mod');
        }
        
        // 更新URL但不刷新页面
        window.history.replaceState({}, '', url);
    }
}

// 初始化专业级模组筛选系统
function initModsFilterSystem() {
    console.log('开始初始化专业级模组筛选系统...');
    
    try {
        // 创建数据管理器
        const dataManager = new ModsDataManager();
        
        // 创建UI控制器
        const filterUI = new ModsFilterUI(dataManager);
        
        // 从URL恢复状态
        restoreStateFromURL(filterUI, dataManager);
        
        console.log('专业级模组筛选系统启动成功');
    } catch (error) {
        console.error('模组筛选系统启动失败:', error);
    }
}

// 从URL恢复状态
function restoreStateFromURL(filterUI, dataManager) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat') || '全部';
    const module = urlParams.get('mod') || '全部';
    
    // 验证分类有效性
    const validCategories = dataManager.getAllCategories();
    const validCategory = validCategories.includes(category) ? category : '全部';
    
    // 验证模块有效性
    const validModules = dataManager.getModulesForCategory(validCategory);
    const validModule = validModules.includes(module) ? module : dataManager.getDefaultModuleForCategory(validCategory);
    
    // 更新状态
    filterUI.currentCategory = validCategory;
    filterUI.currentModule = validModule;
    
    // 更新UI
    filterUI.updateCategoryButtons();
    filterUI.updateModuleButtons();
    filterUI.renderMods();
    
    console.log('从URL恢复状态:', { category: validCategory, module: validModule });
}

// 页面加载完成后初始化所有系统
function initializePage() {
    // 检查页面是否已经加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllSystems);
    } else {
        initAllSystems();
    }
}

// 启动页面初始化
initializePage();

// ==================== MODS页面美化交互功能 ====================

// 美化后的模组展示系统
class ModsBeautifiedSystem {
    constructor() {
        this.currentCategory = '全部';
        this.currentModule = '全部';
        this.searchTerm = '';
        this.currentView = 'grid';
        this.currentSort = 'name';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        this.init();
    }
    
    init() {
        console.log('初始化美化模组系统...');
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化UI状态
        this.updateUI();
        
        // 加载模组数据
        this.loadModsData();
        
        console.log('美化模组系统初始化完成');
    }
    
    bindEvents() {
        // 分类筛选按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-btn-enhanced[data-category]')) {
                const category = e.target.closest('.filter-btn-enhanced').dataset.category;
                this.handleCategoryChange(category);
            }
        });
        
        // 模块筛选按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-btn-enhanced[data-module]')) {
                const module = e.target.closest('.filter-btn-enhanced').dataset.module;
                this.handleModuleChange(module);
            }
        });
        
        // 搜索功能
        const searchInput = document.getElementById('modSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // 搜索清除按钮
        const searchClear = document.getElementById('searchClear');
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                this.handleSearch('');
                document.getElementById('modSearch').value = '';
            });
        }
        
        // 重置筛选按钮
        const filterReset = document.getElementById('filterReset');
        if (filterReset) {
            filterReset.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 视图切换
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-btn')) {
                const view = e.target.closest('.view-btn').dataset.view;
                this.handleViewChange(view);
            }
        });
        
        // 排序选择
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }
        
        // 分页按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('#prevPage')) {
                this.handlePageChange(this.currentPage - 1);
            } else if (e.target.closest('#nextPage')) {
                this.handlePageChange(this.currentPage + 1);
            } else if (e.target.closest('.page-number')) {
                const page = parseInt(e.target.closest('.page-number').dataset.page);
                this.handlePageChange(page);
            }
        });
        
        // 重置筛选按钮（空状态）
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    handleCategoryChange(category) {
        console.log('分类变更:', category);
        this.currentCategory = category;
        
        // 如果选择了"全部"分类，模块也必须是"全部"
        if (category === '全部') {
            this.currentModule = '全部';
        } else {
            // 为具体分类设置默认模块
            this.currentModule = this.getDefaultModuleForCategory(category);
        }
        
        this.currentPage = 1;
        this.updateUI();
        this.renderMods();
        this.updateURL();
    }
    
    handleModuleChange(module) {
        console.log('模块变更:', module);
        
        // 只有在选择了具体分类时才允许选择模块
        if (this.currentCategory !== '全部') {
            this.currentModule = module;
            this.currentPage = 1;
            this.updateUI();
            this.renderMods();
            this.updateURL();
        }
    }
    
    handleSearch(term) {
        console.log('搜索:', term);
        this.searchTerm = term.toLowerCase().trim();
        this.currentPage = 1;
        
        // 显示/隐藏清除按钮
        const searchClear = document.getElementById('searchClear');
        if (searchClear) {
            searchClear.style.display = this.searchTerm ? 'block' : 'none';
        }
        
        this.renderMods();
    }
    
    handleViewChange(view) {
        console.log('视图变更:', view);
        this.currentView = view;
        
        // 更新视图按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderMods();
    }
    
    handleSortChange(sort) {
        console.log('排序变更:', sort);
        this.currentSort = sort;
        this.renderMods();
    }
    
    handlePageChange(page) {
        console.log('页码变更:', page);
        this.currentPage = page;
        this.renderMods();
    }
    
    resetFilters() {
        console.log('重置所有筛选');
        this.currentCategory = '全部';
        this.currentModule = '全部';
        this.searchTerm = '';
        this.currentPage = 1;
        
        // 清空搜索框
        const searchInput = document.getElementById('modSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 隐藏清除按钮
        const searchClear = document.getElementById('searchClear');
        if (searchClear) {
            searchClear.style.display = 'none';
        }
        
        this.updateUI();
        this.renderMods();
        this.updateURL();
    }
    
    updateUI() {
        // 更新分类按钮状态
        document.querySelectorAll('.filter-btn-enhanced[data-category]').forEach(btn => {
            const category = btn.dataset.category;
            btn.classList.toggle('active', category === this.currentCategory);
        });
        
        // 更新模块按钮状态和显示
        this.updateModuleButtons();
        
        // 更新筛选信息
        this.updateFilterInfo();
    }
    
    updateModuleButtons() {
        const moduleButtonsContainer = document.querySelector('.module-buttons');
        if (!moduleButtonsContainer) return;
        
        // 清空现有模块按钮（除了"全部模块"按钮）
        const allModulesBtn = moduleButtonsContainer.querySelector('[data-module="全部"]');
        moduleButtonsContainer.innerHTML = '';
        moduleButtonsContainer.appendChild(allModulesBtn);
        
        // 获取当前分类对应的模块
        const modules = this.getModulesForCategory(this.currentCategory);
        
        // 为每个模块创建按钮
        modules.forEach(module => {
            const button = this.createModuleButton(module);
            moduleButtonsContainer.appendChild(button);
        });
        
        // 更新"全部模块"按钮状态
        allModulesBtn.classList.toggle('active', this.currentModule === '全部');
    }
    
    createModuleButton(module) {
        const button = document.createElement('button');
        button.className = 'filter-btn-enhanced';
        button.dataset.module = module;
        
        // 设置图标和文本
        const icon = this.getModuleIcon(module);
        button.innerHTML = `
            <span class="btn-icon">${icon}</span>
            <span class="btn-text">${module}</span>
        `;
        
        // 设置激活状态
        button.classList.toggle('active', module === this.currentModule);
        
        return button;
    }
    
    getModuleIcon(module) {
        const iconMap = {
            '全部': '📋',
            '枪械': '🔫',
            '配件': '🔧',
            '近身武器': '⚔️',
            '投掷武器': '💣',
            '套装': '👕',
            '头盔': '⛑️',
            '眼镜': '👓',
            '面具': '🎭',
            '上衣': '👔',
            '防弹衣': '🛡️',
            '手套': '🧤',
            '背包': '🎒',
            '腰带': '🧵',
            '裤子': '👖',
            '鞋子': '👟',
            '汽车': '🚗',
            '摩托车': '🏍️',
            '直升机': '🚁',
            '船只': '⛵',
            '房屋': '🏠',
            '围栏': '🚧',
            '门': '🚪',
            '楼梯': '🪜',
            '装饰': '🎨',
            '修理工具': '🔧',
            '医疗工具': '💊',
            '烹饪工具': '🍳',
            '采集工具': '⛏️',
            '天气系统': '🌦️',
            '任务系统': '📋',
            '经济系统': '💰',
            'AI系统': '🤖',
            '特殊功能': '✨',
            '交互系统': '🔄',
            '娱乐组件': '🎮'
        };
        
        return iconMap[module] || '📦';
    }
    
    getModulesForCategory(category) {
        const categoryModules = {
            '全部': [],
            '武器': ['枪械', '配件', '近身武器', '投掷武器'],
            '服装': ['套装', '头盔', '眼镜', '面具', '上衣', '防弹衣', '手套', '背包', '腰带', '裤子', '鞋子'],
            '载具': ['汽车', '摩托车', '直升机', '船只'],
            '建筑': ['房屋', '围栏', '门', '楼梯', '装饰'],
            '工具': ['修理工具', '医疗工具', '烹饪工具', '采集工具'],
            '功能': ['天气系统', '任务系统', '经济系统', 'AI系统', '特殊功能', '交互系统', '娱乐组件']
        };
        
        return categoryModules[category] || [];
    }
    
    getDefaultModuleForCategory(category) {
        const defaultModules = {
            '全部': '全部',
            '武器': '枪械',
            '服装': '套装',
            '载具': '汽车',
            '建筑': '房屋',
            '工具': '修理工具',
            '功能': '天气系统'
        };
        
        return defaultModules[category] || '全部';
    }
    
    updateFilterInfo() {
        const filterCount = document.getElementById('filterCount');
        const categoryCount = document.getElementById('categoryCount');
        const moduleCount = document.getElementById('moduleCount');
        
        if (filterCount) {
            const mods = this.getFilteredMods();
            filterCount.textContent = `${mods.length} 个模组`;
        }
        
        if (categoryCount) {
            categoryCount.textContent = '7';
        }
        
        if (moduleCount) {
            moduleCount.textContent = '32';
        }
    }
    
    loadModsData() {
        console.log('加载模组数据...');
        
        // 显示加载状态
        this.showLoadingState();
        
        // 模拟数据加载延迟
        setTimeout(() => {
            // 更新统计数据
            this.updateStats();
            
            // 渲染模组
            this.renderMods();
            
            // 隐藏加载状态
            this.hideLoadingState();
        }, 1000);
    }
    
    updateStats() {
        const totalMods = document.getElementById('totalMods');
        const activeCategories = document.getElementById('activeCategories');
        const totalDownloads = document.getElementById('totalDownloads');
        const currentModsCount = document.getElementById('currentModsCount');
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        
        if (totalMods) totalMods.textContent = '0';
        if (activeCategories) activeCategories.textContent = '7';
        if (totalDownloads) totalDownloads.textContent = '0';
        if (currentModsCount) currentModsCount.textContent = '0';
        if (lastUpdateTime) lastUpdateTime.textContent = '刚刚';
    }
    
    getFilteredMods() {
        // 从localStorage加载管理员添加的模组
        const adminMods = JSON.parse(localStorage.getItem(MODS_STORAGE_KEY) || '[]');
        
        // 筛选逻辑
        let filteredMods = [...adminMods];
        
        // 分类筛选
        if (this.currentCategory !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.category === this.currentCategory);
        }
        
        // 模块筛选
        if (this.currentModule !== '全部') {
            filteredMods = filteredMods.filter(mod => mod.module === this.currentModule);
        }
        
        // 搜索筛选
        if (this.searchTerm) {
            filteredMods = filteredMods.filter(mod => 
                mod.name.toLowerCase().includes(this.searchTerm) ||
                mod.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // 排序
        filteredMods = this.sortMods(filteredMods);
        
        return filteredMods;
    }
    
    sortMods(mods) {
        switch (this.currentSort) {
            case 'name':
                return mods.sort((a, b) => a.name.localeCompare(b.name));
            case 'date':
                return mods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'popularity':
                return mods.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            case 'size':
                return mods.sort((a, b) => this.parseSize(b.size) - this.parseSize(a.size));
            default:
                return mods;
        }
    }
    
    parseSize(size) {
        if (!size) return 0;
        const match = size.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB)/i);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        switch (unit) {
            case 'KB': return value;
            case 'MB': return value * 1024;
            case 'GB': return value * 1024 * 1024;
            default: return value;
        }
    }
    
    renderMods() {
        const modsGrid = document.getElementById('modsGrid');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');
        
        if (!modsGrid) return;
        
        // 获取筛选后的模组
        const filteredMods = this.getFilteredMods();
        
        // 分页处理
        const totalPages = Math.ceil(filteredMods.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedMods = filteredMods.slice(startIndex, endIndex);
        
        // 清空网格
        modsGrid.innerHTML = '';
        
        // 显示空状态或模组
        if (paginatedMods.length === 0) {
            this.showEmptyState();
            pagination.style.display = 'none';
        } else {
            this.hideEmptyState();
            
            // 渲染模组
            paginatedMods.forEach(mod => {
                const modElement = this.createModElement(mod);
                modsGrid.appendChild(modElement);
            });
            
            // 更新分页
            this.updatePagination(totalPages);
        }
        
        // 更新当前模组数量
        const currentModsCount = document.getElementById('currentModsCount');
        if (currentModsCount) {
            currentModsCount.textContent = filteredMods.length;
        }
        
        // 更新筛选信息
        this.updateFilterInfo();
    }
    
    createModElement(mod) {
        const div = document.createElement('div');
        div.className = 'mod-item-enhanced';
        
        div.innerHTML = `
            <div class="mod-image-enhanced">
                <img src="${mod.image || 'images/weapon-mod.png'}" alt="${mod.name}" class="zoomable-image">
                <div class="mod-category-badge">${mod.category || '未分类'}</div>
            </div>
            <div class="mod-info-enhanced">
                <h3 class="mod-title-enhanced">${mod.name}</h3>
                <p class="mod-description-enhanced">${mod.description || '暂无描述'}</p>
                <div class="mod-stats-enhanced">
                    <span class="mod-version-badge">${mod.version || 'v1.0.0'}</span>
                    <span class="mod-size-info">${mod.size || '1.0MB'}</span>
                </div>
                <div class="mod-actions-enhanced">
                    <a href="details.html?item=${mod.id}" class="btn btn-primary">查看详情</a>
                </div>
            </div>
        `;
        
        return div;
    }
    
    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const modsGrid = document.getElementById('modsGrid');
        
        if (emptyState) emptyState.style.display = 'block';
        if (modsGrid) modsGrid.style.display = 'none';
    }
    
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const modsGrid = document.getElementById('modsGrid');
        
        if (emptyState) emptyState.style.display = 'none';
        if (modsGrid) modsGrid.style.display = 'grid';
    }
    
    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const modsGrid = document.getElementById('modsGrid');
        
        if (loadingState) loadingState.style.display = 'block';
        if (modsGrid) modsGrid.style.display = 'none';
    }
    
    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        
        if (loadingState) loadingState.style.display = 'none';
    }
    
    updatePagination(totalPages) {
        const pagination = document.getElementById('pagination');
        const pageNumbers = document.getElementById('pageNumbers');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        // 更新上一页/下一页按钮状态
        prevPage.disabled = this.currentPage === 1;
        nextPage.disabled = this.currentPage === totalPages;
        
        // 生成页码按钮
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number';
            pageBtn.textContent = i;
            pageBtn.dataset.page = i;
            
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }
            
            pageNumbers.appendChild(pageBtn);
        }
    }
    
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentCategory && this.currentCategory !== '全部') {
            params.set('cat', this.currentCategory);
        }
        
        if (this.currentModule && this.currentModule !== '全部') {
            params.set('mod', this.currentModule);
        }
        
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        
        // 使用replaceState避免创建历史记录
        window.history.replaceState({}, '', newUrl);
    }
}

// 页面加载完成后初始化美化系统
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面是否为mods.html
    if (window.location.pathname.includes('mods.html')) {
        // 初始化美化系统
        new ModsBeautifiedSystem();
        
        console.log('美化模组系统已启动');
    }
});