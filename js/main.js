// main.js - النسخة الويب
// إدارة التطبيق الرئيسية والتفاعلات

(function() {
    'use strict';

    // إخفاء شاشة التحميل عند تحميل الصفحة
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
        }, 1500);
    });

    // إدارة القائمة الجانبية (Sidebar) للموبايل
    class SidebarManager {
        constructor() {
            this.sidebar = document.getElementById('sidebar');
            this.overlay = document.getElementById('overlay');
            this.menuToggle = document.getElementById('menuToggle');
            this.sidebarClose = document.getElementById('sidebarClose');
            
            this.init();
        }

        init() {
            // فتح القائمة
            if (this.menuToggle) {
                this.menuToggle.addEventListener('click', () => this.open());
            }

            // إغلاق القائمة
            if (this.sidebarClose) {
                this.sidebarClose.addEventListener('click', () => this.close());
            }

            // إغلاق عند الضغط على الـ overlay
            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.close());
            }

            // إغلاق عند اختيار صفحة (للموبايل فقط)
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth < 1024) {
                        this.close();
                    }
                });
            });
        }

        open() {
            this.sidebar?.classList.add('active');
            this.overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        close() {
            this.sidebar?.classList.remove('active');
            this.overlay?.classList.remove('active');
            document.body.style.overflow = '';
        }

        toggle() {
            if (this.sidebar?.classList.contains('active')) {
                this.close();
            } else {
                this.open();
            }
        }
    }

    // إدارة نظام الثيمات (الوضع الليلي/النهاري)
    class ThemeManager {
        constructor() {
            this.currentTheme = localStorage.getItem('app-theme') || 'light';
            this.buttons = [
                document.getElementById('themeToggleMobile'),
                document.getElementById('themeToggleSidebar')
            ];
            
            this.init();
        }

        init() {
            this.applyTheme(this.currentTheme);
            
            this.buttons.forEach(button => {
                if (button) {
                    button.addEventListener('click', () => this.toggle());
                }
            });
        }

        applyTheme(theme) {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(`${theme}-theme`);
            this.currentTheme = theme;
            localStorage.setItem('app-theme', theme);
            this.updateIcons();
        }

        toggle() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        }

        updateIcons() {
            this.buttons.forEach(button => {
                if (!button) return;
                
                const icon = button.querySelector('i');
                const text = button.querySelector('span');
                
                if (this.currentTheme === 'dark') {
                    if (icon) icon.className = 'fas fa-sun';
                    if (text) text.textContent = 'الوضع النهاري';
                } else {
                    if (icon) icon.className = 'fas fa-moon';
                    if (text) text.textContent = 'الوضع الليلي';
                }
            });
        }
    }

    // إدارة زر واتساب
    function initWhatsApp() {
        const buttons = [
            document.getElementById('whatsappMobile'),
            document.getElementById('whatsappLogin'),
            document.getElementById('whatsappSidebar')
        ];

        const openWhatsApp = () => {
            const phone = '9647818798636';
            const message = 'مرحباً، أريد الاستفسار عن أنظمة الكاشير';
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        };

        buttons.forEach(button => {
            if (button) {
                button.addEventListener('click', openWhatsApp);
            }
        });
    }

    // إدارة إظهار/إخفاء كلمة المرور
    function initPasswordToggle() {
        const toggleBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }

    // تحديث الوقت الحالي
    function updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (!timeElement) return;

        const updateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };

            const dateString = now.toLocaleDateString('ar-IQ', options);
            timeElement.innerHTML = `<i class="fas fa-clock"></i> ${dateString}`;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    // إدارة التنقل بين الصفحات
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sectionCards = document.querySelectorAll('.section-card');

        const navigateToPage = (pageName) => {
            // إزالة active من جميع العناصر
            navItems.forEach(item => item.classList.remove('active'));
            
            // إضافة active للعنصر المختار
            const activeItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }

            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });

            // إظهار الصفحة المختارة
            const targetPage = document.getElementById(`${pageName}Page`);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.display = 'block';
            }
        };

        // التنقل من القائمة الجانبية
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.dataset.page;
                navigateToPage(pageName);
            });
        });

        // التنقل من بطاقات الأقسام
        sectionCards.forEach(card => {
            card.addEventListener('click', () => {
                const section = card.dataset.section;
                navigateToPage(section);
            });
        });
    }

    // التعامل مع تغيير حجم الشاشة
    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                // Desktop mode
                sidebar?.classList.remove('active');
                overlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // منع Zoom بالضغط المزدوج على الموبايل
    function preventZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // التهيئة الأولية
    document.addEventListener('DOMContentLoaded', () => {
        // تهيئة المكونات
        new SidebarManager();
        new ThemeManager();
        initWhatsApp();
        initPasswordToggle();
        updateCurrentTime();
        initNavigation();
        handleResize();
        preventZoom();

        // التحقق من حالة تسجيل الدخول
        const currentUser = localStorage.getItem('restaurant_current_user');
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        const mobileHeader = document.getElementById('mobileHeader');

        if (currentUser) {
            // المستخدم مسجل دخول
            if (loginScreen) loginScreen.style.display = 'none';
            if (dashboard) dashboard.style.display = 'flex';
            if (mobileHeader) mobileHeader.style.display = 'block';
            
            // تحديث اسم المستخدم
            const user = JSON.parse(currentUser);
            const userNameElements = document.querySelectorAll('#currentUser');
            userNameElements.forEach(el => {
                if (el) el.textContent = user.username;
            });

            // إخفاء أقسام Admin إذا لم يكن admin
            if (user.role !== 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
            }
        } else {
            // المستخدم غير مسجل
            if (loginScreen) loginScreen.style.display = 'flex';
            if (dashboard) dashboard.style.display = 'none';
            if (mobileHeader) mobileHeader.style.display = 'none';
        }
    });

    // تصدير الكائنات للاستخدام العام
    window.restaurantApp = {
        SidebarManager,
        ThemeManager
    };

})();
