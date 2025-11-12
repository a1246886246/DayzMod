// JavaScript功能实现

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

// 初始化页面特定功能
function initPageFunctions() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'mods.html':
            initModsPage();
            break;
        case 'download.html':
            initDownloadPage();
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

// 模组列表页面功能
function initModsPage() {
    // 模拟搜索功能
    const searchInput = document.querySelector('#modSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const modItems = document.querySelectorAll('.mod-item');
            
            modItems.forEach(item => {
                const modName = item.querySelector('h3').textContent.toLowerCase();
                const modDesc = item.querySelector('.mod-description').textContent.toLowerCase();
                
                if (modName.includes(searchTerm) || modDesc.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // 分类筛选功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active状态
            filterButtons.forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active状态
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const modItems = document.querySelectorAll('.mod-item');
            
            modItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// 下载页面功能
function initDownloadPage() {
    // 下载按钮点击事件
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modName = this.getAttribute('data-mod');
            
            // 模拟下载过程
            this.textContent = '下载中...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = '下载完成';
                this.style.background = '#48bb78';
                
                // 显示下载成功消息
                showNotification(`模组 "${modName}" 下载成功！`);
            }, 2000);
        });
    });
    
    // 安装指南切换
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guideContents = document.querySelectorAll('.guide-content');
    
    guideTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // 移除所有active状态
            guideTabs.forEach(t => t.classList.remove('active'));
            guideContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前active状态
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
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

// 页面加载动画
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});