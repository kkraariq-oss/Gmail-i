// نظام إدارة قاعدة البيانات المحلية
const LocalDB = {
    // مفاتيح التخزين
    KEYS: {
        PRODUCTS: 'restaurant_products',
        CATEGORIES: 'restaurant_categories',
        EMPLOYEES: 'restaurant_employees',
        EXPENSES: 'restaurant_expenses',
        INVOICES: 'restaurant_invoices',
        USERS: 'restaurant_users',
        SETTINGS: 'restaurant_settings',
        SUSPENDED_SALES: 'restaurant_suspended_sales',
        CURRENT_USER: 'restaurant_current_user'
    },

    // حفظ البيانات
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            
            // حفظ إلى Firebase إذا كان مفعلاً
            const settings = this.get(this.KEYS.SETTINGS) || {};
            if (settings.autoBackupToCloud && typeof FirebaseDB !== 'undefined') {
                FirebaseDB.save(key, data).catch(err => console.error('Firebase save error:', err));
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return { success: false, error: error.message };
        }
    },

    // جلب البيانات
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    },

    // حذف البيانات
    delete(key) {
        try {
            localStorage.removeItem(key);
            
            // حذف من Firebase إذا كان مفعلاً
            const settings = this.get(this.KEYS.SETTINGS) || {};
            if (settings.autoBackupToCloud && typeof FirebaseDB !== 'undefined') {
                FirebaseDB.delete(key).catch(err => console.error('Firebase delete error:', err));
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting from localStorage:', error);
            return { success: false, error: error.message };
        }
    },

    // مسح كل البيانات
    clear() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return { success: true };
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return { success: false, error: error.message };
        }
    },

    // إعداد البيانات الافتراضية
    initializeDefaults() {
        // إعدادات افتراضية
        if (!this.get(this.KEYS.SETTINGS)) {
            const defaultSettings = {
                restaurantName: 'مطعم الوجبات السريعة',
                restaurantPhone: '07XXXXXXXXX',
                restaurantAddress: 'بغداد، العراق',
                language: 'ar',
                currency: 'IQD',
                autoBackupToCloud: false,
                printerType: 'thermal',
                printerName: '',
                printAutomatically: true,
                printKitchenCopy: true,
                printCashierCopy: true,
                invoiceHeader: 'شكراً لزيارتكم',
                invoiceFooter: 'نتمنى لكم يوماً سعيداً',
                logoPath: '',
                fontSize: 'medium',
                textAlign: 'center'
            };
            this.save(this.KEYS.SETTINGS, defaultSettings);
        }

        // مستخدم أدمن افتراضي
        if (!this.get(this.KEYS.USERS)) {
            const defaultUsers = [{
                id: '1',
                username: 'admin',
                password: 'admin123', // في الإنتاج، استخدم تشفير للكلمات السرية
                role: 'admin',
                fullName: 'المدير العام',
                createdAt: new Date().toISOString(),
                permissions: {
                    pos: true,
                    products: true,
                    employees: true,
                    expenses: true,
                    reports: true,
                    invoices: true,
                    backup: true,
                    security: true,
                    settings: true
                }
            }];
            this.save(this.KEYS.USERS, defaultUsers);
        }

        // تصنيفات افتراضية
        if (!this.get(this.KEYS.CATEGORIES)) {
            const defaultCategories = [
                { id: '1', name: 'همبرجر', icon: '🍔' },
                { id: '2', name: 'بيتزا', icon: '🍕' },
                { id: '3', name: 'دجاج', icon: '🍗' },
                { id: '4', name: 'مشروبات باردة', icon: '🥤' },
                { id: '5', name: 'مشروبات ساخنة', icon: '☕' },
                { id: '6', name: 'حلويات', icon: '🍰' }
            ];
            this.save(this.KEYS.CATEGORIES, defaultCategories);
        }

        // منتجات افتراضية
        if (!this.get(this.KEYS.PRODUCTS)) {
            this.save(this.KEYS.PRODUCTS, []);
        }

        // موظفين افتراضية
        if (!this.get(this.KEYS.EMPLOYEES)) {
            this.save(this.KEYS.EMPLOYEES, []);
        }

        // مصاريف افتراضية
        if (!this.get(this.KEYS.EXPENSES)) {
            this.save(this.KEYS.EXPENSES, []);
        }

        // فواتير افتراضية
        if (!this.get(this.KEYS.INVOICES)) {
            this.save(this.KEYS.INVOICES, []);
        }

        // مبيعات معلقة افتراضية
        if (!this.get(this.KEYS.SUSPENDED_SALES)) {
            this.save(this.KEYS.SUSPENDED_SALES, []);
        }
    }
};

// تصدير نسخة احتياطية
function exportBackup(format = 'json') {
    const data = {
        products: LocalDB.get(LocalDB.KEYS.PRODUCTS) || [],
        categories: LocalDB.get(LocalDB.KEYS.CATEGORIES) || [],
        employees: LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [],
        expenses: LocalDB.get(LocalDB.KEYS.EXPENSES) || [],
        invoices: LocalDB.get(LocalDB.KEYS.INVOICES) || [],
        settings: LocalDB.get(LocalDB.KEYS.SETTINGS) || {},
        exportDate: new Date().toISOString()
    };

    const filename = `backup_${new Date().toISOString().split('T')[0]}.${format}`;

    switch (format) {
        case 'json':
            downloadJSON(data, filename);
            break;
        case 'excel':
            exportToExcel(data, filename);
            break;
        default:
            downloadJSON(data, filename);
    }
}

// تحميل JSON
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// استيراد نسخة احتياطية
function importBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // استعادة البيانات
                if (data.products) LocalDB.save(LocalDB.KEYS.PRODUCTS, data.products);
                if (data.categories) LocalDB.save(LocalDB.KEYS.CATEGORIES, data.categories);
                if (data.employees) LocalDB.save(LocalDB.KEYS.EMPLOYEES, data.employees);
                if (data.expenses) LocalDB.save(LocalDB.KEYS.EXPENSES, data.expenses);
                if (data.invoices) LocalDB.save(LocalDB.KEYS.INVOICES, data.invoices);
                if (data.settings) LocalDB.save(LocalDB.KEYS.SETTINGS, data.settings);
                
                resolve({ success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح' });
            } catch (error) {
                reject({ success: false, error: 'خطأ في قراءة الملف' });
            }
        };
        
        reader.onerror = () => {
            reject({ success: false, error: 'خطأ في قراءة الملف' });
        };
        
        reader.readAsText(file);
    });
}

// دالة لإنشاء ID فريد
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// دالة لتنسيق التاريخ
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

// دالة لتنسيق الوقت
function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// دالة لتنسيق المبلغ
function formatCurrency(amount) {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    const currency = settings.currency || 'IQD';
    return `${Number(amount).toLocaleString('ar-IQ')} ${currency}`;
}

// تهيئة قاعدة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    LocalDB.initializeDefaults();
});
