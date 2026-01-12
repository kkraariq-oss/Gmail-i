// نظام التحكم في الثيم (الوضع الليلي/النهاري)

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('app-theme') || 'light';
        this.init();
    }

    init() {
        // تطبيق الثيم المحفوظ
        this.applyTheme(this.currentTheme);
        
        // ربط زر التبديل
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateToggleIcon();
        }
    }

    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        this.currentTheme = theme;
        localStorage.setItem('app-theme', theme);
        this.updateToggleIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // إضافة تأثير انتقالي
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    updateToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'تبديل إلى الوضع النهاري';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'تبديل إلى الوضع الليلي';
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// تهيئة نظام الثيمات عند تحميل الصفحة
let themeManager;
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});
