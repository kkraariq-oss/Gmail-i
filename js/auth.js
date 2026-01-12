// نظام المصادقة وتسجيل الدخول
let currentUser = null;

// تسجيل الدخول
function login(username, password) {
    const users = LocalDB.get(LocalDB.KEYS.USERS) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        LocalDB.save(LocalDB.KEYS.CURRENT_USER, user);
        return { success: true, user: user };
    } else {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    LocalDB.delete(LocalDB.KEYS.CURRENT_USER);
    location.reload();
}

// التحقق من تسجيل الدخول
function checkAuth() {
    const savedUser = LocalDB.get(LocalDB.KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = savedUser;
        return true;
    }
    return false;
}

// التحقق من الصلاحيات
function hasPermission(permission) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions && currentUser.permissions[permission];
}

// إظهار/إخفاء العناصر بناءً على الصلاحيات
function applyPermissions() {
    if (!currentUser) return;
    
    // إخفاء قسم نظام الحماية إذا لم يكن المستخدم أدمن
    if (currentUser.role !== 'admin') {
        const securitySection = document.getElementById('securitySection');
        if (securitySection) {
            securitySection.style.display = 'none';
        }
    }
    
    // تطبيق الصلاحيات على الأقسام الأخرى
    const sections = document.querySelectorAll('.section-card[data-section]');
    sections.forEach(section => {
        const sectionName = section.getAttribute('data-section');
        if (!hasPermission(sectionName) && currentUser.role !== 'admin') {
            section.style.opacity = '0.5';
            section.style.pointerEvents = 'none';
            section.title = 'ليس لديك صلاحية للوصول لهذا القسم';
        }
    });
}

// معالجة نموذج تسجيل الدخول
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const currentUserSpan = document.getElementById('currentUser');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // التحقق من تسجيل الدخول السابق
    if (checkAuth()) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        if (currentUserSpan) {
            currentUserSpan.textContent = currentUser.fullName || currentUser.username;
        }
        applyPermissions();
    }
    
    // معالجة تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = login(username, password);
            
            if (result.success) {
                showNotification('تم تسجيل الدخول بنجاح', 'success');
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    dashboard.style.display = 'flex';
                    if (currentUserSpan) {
                        currentUserSpan.textContent = currentUser.fullName || currentUser.username;
                    }
                    applyPermissions();
                    updateDashboardStats();
                }, 500);
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
    
    // معالجة تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                showNotification('تم تسجيل الخروج بنجاح', 'info');
                setTimeout(() => {
                    logout();
                }, 500);
            }
        });
    }
});

// إضافة مستخدم جديد
function addUser(userData) {
    if (!hasPermission('security') && currentUser.role !== 'admin') {
        return { success: false, message: 'ليس لديك صلاحية لإضافة مستخدمين' };
    }
    
    const users = LocalDB.get(LocalDB.KEYS.USERS) || [];
    
    // التحقق من عدم وجود اسم مستخدم مكرر
    if (users.find(u => u.username === userData.username)) {
        return { success: false, message: 'اسم المستخدم موجود مسبقاً' };
    }
    
    const newUser = {
        id: generateId(),
        ...userData,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    LocalDB.save(LocalDB.KEYS.USERS, users);
    
    return { success: true, message: 'تم إضافة المستخدم بنجاح' };
}

// تحديث مستخدم
function updateUser(userId, userData) {
    if (!hasPermission('security') && currentUser.role !== 'admin') {
        return { success: false, message: 'ليس لديك صلاحية لتحديث المستخدمين' };
    }
    
    const users = LocalDB.get(LocalDB.KEYS.USERS) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'المستخدم غير موجود' };
    }
    
    users[userIndex] = {
        ...users[userIndex],
        ...userData,
        id: userId,
        updatedAt: new Date().toISOString()
    };
    
    LocalDB.save(LocalDB.KEYS.USERS, users);
    
    // إذا تم تحديث المستخدم الحالي
    if (userId === currentUser.id) {
        currentUser = users[userIndex];
        LocalDB.save(LocalDB.KEYS.CURRENT_USER, currentUser);
    }
    
    return { success: true, message: 'تم تحديث المستخدم بنجاح' };
}

// حذف مستخدم
function deleteUser(userId) {
    if (currentUser.role !== 'admin') {
        return { success: false, message: 'فقط المدير يمكنه حذف المستخدمين' };
    }
    
    if (userId === currentUser.id) {
        return { success: false, message: 'لا يمكنك حذف حسابك الخاص' };
    }
    
    const users = LocalDB.get(LocalDB.KEYS.USERS) || [];
    const filteredUsers = users.filter(u => u.id !== userId);
    
    LocalDB.save(LocalDB.KEYS.USERS, filteredUsers);
    
    return { success: true, message: 'تم حذف المستخدم بنجاح' };
}

// الحصول على جميع المستخدمين
function getAllUsers() {
    if (!hasPermission('security') && currentUser.role !== 'admin') {
        return [];
    }
    return LocalDB.get(LocalDB.KEYS.USERS) || [];
}
