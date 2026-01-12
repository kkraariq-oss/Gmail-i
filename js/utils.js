/* ========================================
   Utility Functions
   الدوال المساعدة
   ======================================== */

const Utils = {
    // ===== Formatting =====
    
    /**
     * تنسيق العملة
     * @param {number} amount - المبلغ
     * @param {string} currency - العملة (IQD افتراضياً)
     * @returns {string} - المبلغ المنسق
     */
    formatCurrency(amount, currency = 'IQD') {
        return `${this.formatNumber(amount)} ${currency}`;
    },
    
    /**
     * تنسيق الأرقام مع فواصل
     * @param {number} number - الرقم
     * @returns {string} - الرقم المنسق
     */
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * تنسيق التاريخ
     * @param {Date|string} date - التاريخ
     * @returns {string} - التاريخ المنسق
     */
    formatDate(date) {
        const d = new Date(date);
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    },
    
    /**
     * تنسيق الوقت
     * @param {Date|string} date - التاريخ
     * @returns {string} - الوقت المنسق
     */
    formatTime(date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },
    
    /**
     * تنسيق التاريخ والوقت معاً
     * @param {Date|string} date - التاريخ
     * @returns {string} - التاريخ والوقت المنسق
     */
    formatDateTime(date) {
        return `${this.formatDate(date)} - ${this.formatTime(date)}`;
    },
    
    // ===== ID Generation =====
    
    /**
     * توليد ID فريد
     * @param {string} prefix - البادئة
     * @returns {string} - ID فريد
     */
    generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}${timestamp}${random}`;
    },
    
    /**
     * توليد رقم فاتورة
     * @returns {string} - رقم الفاتورة
     */
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${year}${month}${day}-${random}`;
    },
    
    // ===== Storage Operations =====
    
    /**
     * حفظ البيانات في LocalStorage
     * @param {string} key - المفتاح
     * @param {any} data - البيانات
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },
    
    /**
     * استرجاع البيانات من LocalStorage
     * @param {string} key - المفتاح
     * @param {any} defaultValue - القيمة الافتراضية
     * @returns {any} - البيانات المسترجعة
     */
    getFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error getting from storage:', error);
            return defaultValue;
        }
    },
    
    /**
     * حذف بيانات من LocalStorage
     * @param {string} key - المفتاح
     */
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },
    
    /**
     * مسح جميع البيانات من LocalStorage
     */
    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },
    
    // ===== Validation =====
    
    /**
     * التحقق من البريد الإلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * التحقق من رقم الهاتف
     * @param {string} phone - رقم الهاتف
     * @returns {boolean}
     */
    validatePhone(phone) {
        const re = /^[0-9]{10,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    /**
     * التحقق من الرقم
     * @param {any} value - القيمة
     * @returns {boolean}
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    /**
     * التحقق من النص الفارغ
     * @param {string} value - النص
     * @returns {boolean}
     */
    isEmpty(value) {
        return value === null || value === undefined || value.trim() === '';
    },
    
    // ===== Array Operations =====
    
    /**
     * فلترة المصفوفة حسب نص البحث
     * @param {Array} array - المصفوفة
     * @param {string} searchText - نص البحث
     * @param {Array} keys - المفاتيح للبحث فيها
     * @returns {Array}
     */
    filterArray(array, searchText, keys) {
        if (!searchText) return array;
        
        const search = searchText.toLowerCase();
        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                return value && value.toString().toLowerCase().includes(search);
            });
        });
    },
    
    /**
     * ترتيب المصفوفة
     * @param {Array} array - المصفوفة
     * @param {string} key - المفتاح للترتيب حسبه
     * @param {string} order - اتجاه الترتيب (asc/desc)
     * @returns {Array}
     */
    sortArray(array, key, order = 'asc') {
        return array.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            
            // Handle numbers
            if (this.isNumber(valA) && this.isNumber(valB)) {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }
            
            // Handle strings
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            
            if (order === 'asc') {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            } else {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            }
        });
    },
    
    /**
     * تجميع المصفوفة حسب مفتاح
     * @param {Array} array - المصفوفة
     * @param {string} key - المفتاح
     * @returns {Object}
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },
    
    // ===== DOM Manipulation =====
    
    /**
     * إظهار عنصر
     * @param {string|HTMLElement} element - العنصر
     */
    show(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = 'block';
            el.classList.remove('hidden');
        }
    },
    
    /**
     * إخفاء عنصر
     * @param {string|HTMLElement} element - العنصر
     */
    hide(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = 'none';
            el.classList.add('hidden');
        }
    },
    
    /**
     * تبديل عرض العنصر
     * @param {string|HTMLElement} element - العنصر
     */
    toggle(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            if (el.style.display === 'none' || el.classList.contains('hidden')) {
                this.show(el);
            } else {
                this.hide(el);
            }
        }
    },
    
    /**
     * إضافة class
     * @param {string|HTMLElement} element - العنصر
     * @param {string} className - اسم الـ class
     */
    addClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.classList.add(className);
        }
    },
    
    /**
     * إزالة class
     * @param {string|HTMLElement} element - العنصر
     * @param {string} className - اسم الـ class
     */
    removeClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.classList.remove(className);
        }
    },
    
    /**
     * تبديل class
     * @param {string|HTMLElement} element - العنصر
     * @param {string} className - اسم الـ class
     */
    toggleClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.classList.toggle(className);
        }
    },
    
    // ===== Calculations =====
    
    /**
     * حساب النسبة المئوية
     * @param {number} value - القيمة
     * @param {number} total - المجموع
     * @returns {number}
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },
    
    /**
     * حساب الخصم
     * @param {number} price - السعر
     * @param {number} discount - الخصم (نسبة مئوية أو قيمة)
     * @param {string} type - نوع الخصم (percentage/amount)
     * @returns {number}
     */
    calculateDiscount(price, discount, type = 'percentage') {
        if (type === 'percentage') {
            return price * (discount / 100);
        } else {
            return discount;
        }
    },
    
    /**
     * حساب الضريبة
     * @param {number} amount - المبلغ
     * @param {number} taxRate - نسبة الضريبة
     * @returns {number}
     */
    calculateTax(amount, taxRate) {
        return amount * (taxRate / 100);
    },
    
    // ===== Debounce & Throttle =====
    
    /**
     * Debounce function
     * @param {Function} func - الدالة
     * @param {number} wait - وقت الانتظار بالميلي ثانية
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     * @param {Function} func - الدالة
     * @param {number} limit - الحد الزمني بالميلي ثانية
     * @returns {Function}
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },
    
    // ===== Copy & Export =====
    
    /**
     * نسخ نص إلى الحافظة
     * @param {string} text - النص
     * @returns {Promise}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    },
    
    /**
     * تصدير بيانات كـ JSON
     * @param {any} data - البيانات
     * @param {string} filename - اسم الملف
     */
    exportJSON(data, filename = 'data.json') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    /**
     * تصدير بيانات كـ CSV
     * @param {Array} data - البيانات
     * @param {string} filename - اسم الملف
     */
    exportCSV(data, filename = 'data.csv') {
        if (!data || !data.length) return;
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');
        
        const dataBlob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
