// Dayz模组展示系统 - 现代化架构设计
// 基于10年经验的前端技术总监重构

// 全局状态管理器
class ModsStateManager {
    constructor() {
        this.currentCategory = null;
        this.currentModule = null;
        this.isInitialized = false;
        this.historyStack = [];
        
        // 初始化状态管理器
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
        const category = urlParams.get('cat');
        const module = urlParams.get('mod');
        
        console.log('从URL恢复状态:', { category, module });
        
        if (category || module) {
            this.updateState(category, module, false);
        } else {
            // 默认状态：全部-全部
            this.updateState('全部', '全部', false);
        }
    }
    
    // 更新状态
    updateState(category, module, updateHistory = true) {
        // 验证参数有效性
        if (!this.isValidCategory(category) || !this.isValidModule(module, category)) {
            console.warn('无效的状态参数:', { category, module });
            return;
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

// UI控制器
class ModsUIController {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.categoryButtons = [];
        this.moduleButtons = [];
        this.modsGrid = null;
        
        this.init();
    }
    
    init() {
        // 获取DOM元素
        this.categoryButtons = Array.from(document.querySelectorAll('.filter-row:first-child .filter-btn'));
        this.moduleButtons = Array.from(document.querySelectorAll('.filter-row:nth-child(2) .filter-btn'));
        this.modsGrid = document.querySelector('.mods-grid');
        
        // 绑定事件
        this.bindEvents();
        
        // 监听状态变化
        window.addEventListener('modsStateChanged', (event) => {
            this.handleStateChange(event.detail);
        });
        
        // 初始渲染
        this.handleStateChange(this.stateManager.getCurrentState());
    }
    
    bindEvents() {
        // 分类按钮点击事件
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.textContent.trim();
                const defaultModule = this.getDefaultModuleForCategory(category);
                this.stateManager.updateState(category, defaultModule);
            });
        });
        
        // 模块按钮点击事件
        this.moduleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.style.display === 'none') return;
                
                const module = btn.textContent.trim();
                const currentCategory = this.stateManager.getCurrentState().category;
                
                // 如果点击的是"全部"模块，保持当前分类不变
                if (module === '全部') {
                    this.stateManager.updateState(currentCategory, module);
                } else {
                    // 其他模块按原逻辑处理
                    const category = this.getCategoryForModule(module);
                    if (category) {
                        this.stateManager.updateState(category, module);
                    }
                }
            });
        });
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
        this.showModsForModule(module);
    }
    
    // 更新分类按钮
    updateCategoryButtons(activeCategory) {
        this.categoryButtons.forEach(btn => {
            const category = btn.textContent.trim();
            btn.classList.toggle('active', category === activeCategory);
        });
    }
    
    // 更新模块按钮
    updateModuleButtons(activeCategory, activeModule) {
        // 先隐藏所有模块按钮
        this.moduleButtons.forEach(btn => {
            btn.style.display = 'none';
            btn.classList.remove('active');
        });
        
        // 显示当前分类下的模块按钮
        const validModules = this.getModulesForCategory(activeCategory);
        this.moduleButtons.forEach(btn => {
            const module = btn.textContent.trim();
            if (validModules.includes(module)) {
                btn.style.display = '';
                btn.classList.toggle('active', module === activeModule);
            }
        });
    }
    
    // 显示指定模块的模组
    showModsForModule(moduleName) {
        if (!this.modsGrid) return;
        
        // 清空当前显示
        this.modsGrid.innerHTML = '';
        
        // 获取该模块的模组数据
        const mods = this.getModsForModule(moduleName);
        
        // 渲染模组
        mods.forEach(mod => {
            const modElement = this.createModElement(mod);
            this.modsGrid.appendChild(modElement);
        });
        
        console.log(`显示 ${moduleName} 模块的 ${mods.length} 个模组`);
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
        // 模拟数据 - 实际项目中应该从API获取
        const modsData = {
            '全部': [
                { id: 'modern-weapons', name: '现代武器包', description: '添加30+现代军事武器', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '枪械' },
                { id: 'sniper-package', name: '狙击手专用包', description: '狙击装备套装', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '枪械' },
                { id: 'military-vehicles', name: '军用载具包', description: '15种军用载具', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '汽车' },
                { id: 'civilian-cars', name: '民用车辆扩展', description: '20+民用车辆', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '汽车' },
                { id: 'helicopter-expansion', name: '直升机扩展', description: '军用和民用直升机', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '直升机' },
                { id: 'survival-base', name: '生存基地建设', description: '200+建筑组件', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '房屋' },
                { id: 'advanced-survival', name: '高级生存系统', description: '疾病、温度管理', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '特殊功能' },
                { id: 'farming-system', name: '农业种植系统', description: '完整农业系统', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '交互系统' },
                { id: 'military-uniform', name: '军用制服套装', description: '多种军用制服和装备', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'survival-gear', name: '生存装备套装', description: '完整的生存装备组合', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'civilian-outfit', name: '平民服装套装', description: '日常服装和配饰', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'civilian-outfit1', name: '初始套装', description: '日常服装和配饰', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' }
            ],
            '枪械': [
                { id: 'modern-weapons', name: '现代武器包', description: '添加30+现代军事武器', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '枪械' },
                { id: 'sniper-package', name: '狙击手专用包', description: '狙击装备套装', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '枪械' }
            ],
            '汽车': [
                { id: 'military-vehicles', name: '军用载具包', description: '15种军用载具', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '汽车' },
                { id: 'civilian-cars', name: '民用车辆扩展', description: '20+民用车辆', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '汽车' }
            ],
            '直升机': [
                { id: 'helicopter-expansion', name: '直升机扩展', description: '军用和民用直升机', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '直升机' }
            ],
            '房屋': [
                { id: 'survival-base', name: '生存基地建设', description: '200+建筑组件', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '房屋' }
            ],
            '特殊功能': [
                { id: 'advanced-survival', name: '高级生存系统', description: '疾病、温度管理', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '特殊功能' }
            ],
            '交互系统': [
                { id: 'farming-system', name: '农业种植系统', description: '完整农业系统', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '交互系统' }
            ],
            '套装': [
                { id: 'military-uniform', name: '军用制服套装', description: '多种军用制服和装备', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'survival-gear', name: '生存装备套装', description: '完整的生存装备组合', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'civilian-outfit', name: '平民服装套装', description: '日常服装和配饰', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' },
                { id: 'civilian-outfit1', name: '初始套装', description: '日常服装和配饰', version: 'v1.0.0', size: '0MB', image: 'images/weapon-mod.png', category: '套装' }
            ]
        };
        
        // 为每个模块提供默认数据
        const defaultMod = {
            id: `preset-${moduleName}`,
            name: `${moduleName}示例模组`,
            description: `这是${moduleName}分类下的预设模组描述`,
            version: 'v1.0.0',
            size: '0MB',
            image: 'images/weapon-mod.png',
            category: moduleName
        };
        
        if (moduleName === '全部') {
            return modsData['全部'] || [defaultMod];
        }
        
        return modsData[moduleName] ? [defaultMod, ...modsData[moduleName]] : [defaultMod];
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
            document.addEventListener('DOMContentLoaded', () => this.startApp());
        } else {
            this.startApp();
        }
    }
    
    startApp() {
        console.log('启动Dayz模组展示应用');
        
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

// 导航条响应式功能
document.addEventListener('DOMContentLoaded', function() {
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
});

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
document.addEventListener('DOMContentLoaded', function() {
    initImageZoom();
});

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

// 模组详细信息数据
const modDetails = {
    "modern-weapons": {
        title: "现代武器包",
        description: "添加30+现代军事武器，包括突击步枪、狙击枪和手枪。",
        images: ["images/weapon1/weapon1.png", "images/weapon1/weapon2.png", "images/weapon3.jpg"]
    }
    // 其他模组详情数据...
};

// 动态加载详情页内容
const urlParams = new URLSearchParams(window.location.search);
const itemKey = urlParams.get("item");

if (modDetails[itemKey]) {
    const mod = modDetails[itemKey];
    document.getElementById("item-title").textContent = mod.title;
    document.getElementById("item-description").textContent = mod.description;

    const imageGallery = document.getElementById("item-images");
    mod.images.forEach((src, index) => {
        // 创建图片容器
        const imgContainer = document.createElement("div");
        imgContainer.className = "gallery-item";
        
        // 创建可放大的图片
        const img = document.createElement("img");
        img.src = src;
        img.alt = `${mod.title} - 图片${index + 1}`;
        img.className = "zoomable-image";
        
        imgContainer.appendChild(img);
        imageGallery.appendChild(imgContainer);
    });
    
    // 为详情页图片初始化放大功能
    initDetailsImageZoom();
} else {
    document.getElementById("item-title").textContent = "未找到模组";
    document.getElementById("item-description").textContent = "请返回模组列表选择一个有效的模组。";
}

console.log('Dayz模组展示系统加载完成 - 现代化架构设计');