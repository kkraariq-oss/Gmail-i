// نظام إدارة المطعم - الملف الرئيسي v3.0

// التحقق من بيئة Electron
const isElectron = typeof require !== 'undefined' && typeof window.process === 'object';
let ipcRenderer;

if (isElectron) {
    try {
        const electron = require('electron');
        ipcRenderer = electron.ipcRenderer;
    } catch (error) {
        console.log('Running in browser mode');
    }
}

// المتغيرات العامة
let currentUser = null;
let currentSection = 'home';

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // إخفاء شريط العنوان المخصص في وضع المتصفح
    if (!isElectron) {
        const titleBar = document.getElementById('customTitleBar');
        if (titleBar) {
            titleBar.style.display = 'none';
        }
        // تعديل ارتفاع المحتوى
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.style.paddingTop = '0';
        }
    } else {
        // في Electron: إعداد أزرار شريط العنوان
        setupTitleBarControls();
    }
    
    // تهيئة قاعدة البيانات
    LocalDB.initializeDefaults();
    
    // التحقق من حالة تسجيل الدخول
    checkLoginStatus();
    
    // معالجات الأحداث
    setupEventListeners();
    
    // تحديث الإحصائيات
    updateDashboardStats();
});

// إعداد أزرار شريط العنوان في Electron
function setupTitleBarControls() {
    if (!isElectron || !ipcRenderer) return;
    
    // زر التصغير
    const minimizeBtn = document.getElementById('minimizeBtn');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            ipcRenderer.send('window-control', { action: 'minimize' });
        });
    }
    
    // زر التكبير/الاستعادة
    const maximizeBtn = document.getElementById('maximizeBtn');
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            ipcRenderer.send('window-control', { action: 'maximize' });
        });
    }
    
    // زر الإغلاق
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (confirm('هل تريد إغلاق التطبيق؟')) {
                ipcRenderer.send('window-control', { action: 'close' });
            }
        });
    }
    
    // زر الصفحة الرئيسية
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            showHomePage();
        });
    }
    
    // زر التحديث
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }
}

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const savedUser = LocalDB.get(LocalDB.KEYS.CURRENT_USER);
    
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    } else {
        showLoginScreen();
    }
}

// عرض شاشة تسجيل الدخول
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    
    // إخفاء شريط العنوان في شاشة تسجيل الدخول
    const titleBar = document.getElementById('customTitleBar');
    if (titleBar) {
        titleBar.style.display = 'none';
    }
}

// عرض لوحة التحكم
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    
    // إظهار شريط العنوان
    const titleBar = document.getElementById('customTitleBar');
    if (titleBar && isElectron) {
        titleBar.style.display = 'flex';
    }
    
    // تحديث اسم المستخدم
    document.getElementById('currentUser').textContent = currentUser.fullName || currentUser.username;
    
    // إخفاء قسم الحماية إذا لم يكن أدمن
    const securitySection = document.getElementById('securitySection');
    if (securitySection) {
        securitySection.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
    
    // تحديث الإحصائيات
    updateDashboardStats();
}

// عرض الصفحة الرئيسية
function showHomePage() {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة الرئيسية
    const homePage = document.getElementById('homePage');
    if (homePage) {
        homePage.classList.add('active');
    }
    
    // مسح محتوى pageContainer
    const pageContainer = document.getElementById('pageContainer');
    if (pageContainer) {
        pageContainer.innerHTML = '';
    }
    
    currentSection = 'home';
    updateDashboardStats();
}

// إعداد معالجات الأحداث
function setupEventListeners() {
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // بطاقات الأقسام
    document.querySelectorAll('.section-card').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.dataset.section;
            navigateToSection(section);
        });
    });
}

// معالج تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const users = LocalDB.get(LocalDB.KEYS.USERS) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        LocalDB.save(LocalDB.KEYS.CURRENT_USER, user);
        showDashboard();
        showNotification('تم تسجيل الدخول بنجاح', 'success');
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

// معالج تسجيل الخروج
function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        currentUser = null;
        LocalDB.delete(LocalDB.KEYS.CURRENT_USER);
        showLoginScreen();
        showNotification('تم تسجيل الخروج بنجاح', 'info');
    }
}

// التنقل إلى قسم
function navigateToSection(section) {
    currentSection = section;
    
    const pageContainer = document.getElementById('pageContainer');
    const homePage = document.getElementById('homePage');
    
    // إخفاء الصفحة الرئيسية
    if (homePage) {
        homePage.classList.remove('active');
    }
    
    // تحميل القسم المطلوب
    pageContainer.innerHTML = '';
    
    switch (section) {
        case 'pos':
            loadPOSPage(pageContainer);
            break;
        case 'products':
            loadProductsPage(pageContainer);
            break;
        case 'employees':
            loadEmployeesPage(pageContainer);
            break;
        case 'expenses':
            loadExpensesPage(pageContainer);
            break;
        case 'reports':
            loadReportsPage(pageContainer);
            break;
        case 'invoices':
            loadInvoicesPage(pageContainer);
            break;
        case 'backup':
            loadBackupPage(pageContainer);
            break;
        case 'security':
            if (currentUser.role === 'admin') {
                loadSecurityPage(pageContainer);
            } else {
                showNotification('ليس لديك صلاحية الوصول لهذا القسم', 'error');
                showHomePage();
            }
            break;
        case 'settings':
            loadSettingsPage(pageContainer);
            break;
        default:
            showHomePage();
    }
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats() {
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    
    // مبيعات اليوم
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter(inv => inv.date.startsWith(today));
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // تحديث العناصر
    const todaySalesEl = document.getElementById('todaySales');
    if (todaySalesEl) {
        todaySalesEl.textContent = formatCurrency(todaySales);
    }
    
    const totalInvoicesEl = document.getElementById('totalInvoices');
    if (totalInvoicesEl) {
        totalInvoicesEl.textContent = invoices.length;
    }
    
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        totalProductsEl.textContent = products.length;
    }
    
    const totalEmployeesEl = document.getElementById('totalEmployees');
    if (totalEmployeesEl) {
        totalEmployeesEl.textContent = employees.length;
    }
}

// عرض إشعار
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// إنشاء نافذة منبثقة
function createModal(title, content, buttons = []) {
    // إزالة أي نافذة قديمة
    const oldModal = document.getElementById('dynamicModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'dynamicModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="document.getElementById('dynamicModal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة المحتوى
    const modalBody = modal.querySelector('.modal-body');
    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else {
        modalBody.appendChild(content);
    }
    
    // إضافة الأزرار
    const modalFooter = modal.querySelector('.modal-footer');
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class || 'btn-secondary'}`;
        button.textContent = btn.label;
        
        if (btn.callback) {
            button.addEventListener('click', btn.callback);
        } else {
            button.addEventListener('click', () => modal.remove());
        }
        
        modalFooter.appendChild(button);
    });
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

// دالة البحث في المصفوفات
function searchArray(array, searchTerm, keys) {
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return keys.some(key => {
            const value = item[key];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// تصدير الدوال للاستخدام العام
window.showHomePage = showHomePage;
window.navigateToSection = navigateToSection;
window.showNotification = showNotification;
window.createModal = createModal;
window.searchArray = searchArray;
window.updateDashboardStats = updateDashboardStats;

// تصدير currentUser كـ getter لضمان الحصول على القيمة الحالية
Object.defineProperty(window, 'currentUser', {
    get: function() {
        return currentUser;
    },
    set: function(value) {
        currentUser = value;
    }
});
