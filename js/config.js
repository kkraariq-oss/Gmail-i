/* ========================================
   Application Configuration
   إعدادات التطبيق الرئيسية
   ======================================== */

const CONFIG = {
    // Application Info
    APP_NAME: 'نظام إدارة المطعم المتطور',
    APP_VERSION: '3.0.0',
    APP_COMPANY: 'Digital Creativity Company',
    
    // Firebase Configuration (Optional)
    FIREBASE_ENABLED: false,
    FIREBASE_CONFIG: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        PRODUCTS: 'restaurant_products',
        EMPLOYEES: 'restaurant_employees',
        EXPENSES: 'restaurant_expenses',
        INVOICES: 'restaurant_invoices',
        SUSPENDED_SALES: 'restaurant_suspended_sales',
        SETTINGS: 'restaurant_settings',
        USER: 'restaurant_current_user',
        REMEMBER_ME: 'restaurant_remember_me'
    },
    
    // Default Settings
    DEFAULT_SETTINGS: {
        currency: 'IQD',
        taxRate: 0,
        language: 'ar',
        theme: 'light',
        soundsEnabled: true,
        notificationsEnabled: true,
        autoSave: true,
        printerName: 'default',
        paperSize: '80mm'
    },
    
    // Default Categories
    DEFAULT_CATEGORIES: [
        { id: 'all', name: 'الكل', icon: 'fa-th' },
        { id: 'meals', name: 'وجبات', icon: 'fa-utensils' },
        { id: 'drinks', name: 'مشروبات', icon: 'fa-coffee' },
        { id: 'desserts', name: 'حلويات', icon: 'fa-ice-cream' },
        { id: 'appetizers', name: 'مقبلات', icon: 'fa-pepper-hot' }
    ],
    
    // Sample Products (للعرض التجريبي)
    SAMPLE_PRODUCTS: [
        {
            id: 'P001',
            name: 'برغر لحم',
            category: 'meals',
            price: 15000,
            image: null,
            description: 'برغر لحم طازج مع الخضروات'
        },
        {
            id: 'P002',
            name: 'بيتزا مارغريتا',
            category: 'meals',
            price: 20000,
            image: null,
            description: 'بيتزا بالجبن والطماطم'
        },
        {
            id: 'P003',
            name: 'كوكاكولا',
            category: 'drinks',
            price: 2000,
            image: null,
            description: 'مشروب غازي'
        },
        {
            id: 'P004',
            name: 'عصير برتقال',
            category: 'drinks',
            price: 3000,
            image: null,
            description: 'عصير برتقال طازج'
        },
        {
            id: 'P005',
            name: 'كيك شوكولاتة',
            category: 'desserts',
            price: 8000,
            image: null,
            description: 'كيك شوكولاتة لذيذ'
        }
    ],
    
    // Default Users
    DEFAULT_USERS: [
        {
            username: 'admin',
            password: 'admin123',
            role: 'مدير',
            fullName: 'المدير العام',
            permissions: ['all']
        }
    ],
    
    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000,
        AUTO_SAVE_INTERVAL: 30000, // 30 seconds
        CHART_COLORS: {
            primary: '#6366f1',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6'
        }
    },
    
    // Sound Configuration
    SOUNDS: {
        SUCCESS_FREQUENCY: 880,
        ERROR_FREQUENCY: 220,
        CLICK_FREQUENCY: 800,
        ADD_TO_CART_FREQUENCIES: [523, 659, 784],
        CHECKOUT_FREQUENCIES: [523, 659, 784, 1047]
    },
    
    // Validation Rules
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PRODUCT_NAME_LENGTH: 100,
        MIN_PRICE: 0,
        MAX_PRICE: 100000000,
        MAX_DISCOUNT: 100
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
