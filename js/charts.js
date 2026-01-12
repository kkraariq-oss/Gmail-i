// نظام إدارة الرسوم البيانية
const ChartManager = {
    charts: {},
    
    // الألوان
    colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        gradient1: ['#667eea', '#764ba2'],
        gradient2: ['#f093fb', '#f5576c'],
        gradient3: ['#4facfe', '#00f2fe'],
        gradient4: ['#43e97b', '#38f9d7']
    },
    
    // إنشاء تدرج لوني
    createGradient(ctx, colors, direction = 'vertical') {
        const gradient = direction === 'vertical' 
            ? ctx.createLinearGradient(0, 0, 0, 400)
            : ctx.createLinearGradient(0, 0, 400, 0);
        
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        return gradient;
    },
    
    // رسم بياني صغير للبطاقات
    createMiniChart(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // تدمير الرسم القديم إن وجد
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || ['', '', '', '', '', '', ''],
                datasets: [{
                    data: data.values || [0, 0, 0, 0, 0, 0, 0],
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    },
    
    // رسم بياني أسبوعي
    createWeeklySalesChart() {
        const canvas = document.getElementById('weeklySalesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        
        // حساب المبيعات الأسبوعية
        const weekDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const weeklySales = new Array(7).fill(0);
        
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        
        invoices.forEach(inv => {
            const invDate = new Date(inv.date);
            if (invDate >= weekStart && invDate <= today) {
                const dayIndex = invDate.getDay();
                weeklySales[dayIndex] += inv.total;
            }
        });
        
        // تدمير الرسم القديم
        if (this.charts.weeklySales) {
            this.charts.weeklySales.destroy();
        }
        
        this.charts.weeklySales = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekDays,
                datasets: [{
                    label: 'المبيعات',
                    data: weeklySales,
                    backgroundColor: this.createGradient(ctx, this.colors.gradient1),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return 'المبيعات: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { family: 'Cairo', size: 12 } }
                    },
                    y: {
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { 
                            color: '#64748b',
                            font: { family: 'Cairo', size: 12 },
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    // رسم بياني دائري للتصنيفات
    createCategoriesChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
        
        // حساب المبيعات حسب التصنيف
        const categorySales = {};
        categories.forEach(cat => {
            categorySales[cat.id] = { name: cat.name, total: 0 };
        });
        
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (categorySales[item.category]) {
                    categorySales[item.category].total += item.price * item.quantity;
                }
            });
        });
        
        const data = Object.values(categorySales).filter(cat => cat.total > 0);
        
        // تدمير الرسم القديم
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(cat => cat.name),
                datasets: [{
                    data: data.map(cat => cat.total),
                    backgroundColor: [
                        '#667eea',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b',
                        '#fa709a',
                        '#30cfd0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Cairo', size: 12 },
                            color: '#64748b',
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    },
    
    // رسم بياني خطي شهري
    createMonthlySalesChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        
        // حساب المبيعات الشهرية
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const monthlySales = new Array(12).fill(0);
        const monthlyExpenses = new Array(12).fill(0);
        
        const currentYear = new Date().getFullYear();
        
        invoices.forEach(inv => {
            const invDate = new Date(inv.date);
            if (invDate.getFullYear() === currentYear) {
                monthlySales[invDate.getMonth()] += inv.total;
            }
        });
        
        const expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            if (expDate.getFullYear() === currentYear) {
                monthlyExpenses[expDate.getMonth()] += exp.amount;
            }
        });
        
        // تدمير الرسم القديم
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthNames,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: monthlySales,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'المصاريف',
                        data: monthlyExpenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            font: { family: 'Cairo', size: 13 },
                            color: '#64748b',
                            padding: 15,
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { family: 'Cairo', size: 14 },
                        bodyFont: { family: 'Cairo', size: 13 },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: '#64748b',
                            font: { family: 'Cairo', size: 12 }
                        }
                    },
                    y: {
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { 
                            color: '#64748b',
                            font: { family: 'Cairo', size: 12 },
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    // تحديث جميع الرسوم البيانية
    updateAllCharts() {
        // رسوم بيانية صغيرة للبطاقات
        this.updateMiniCharts();
        
        // رسم المبيعات الأسبوعية
        this.createWeeklySalesChart();
        
        // رسم التصنيفات
        this.createCategoriesChart('categoriesChart');
        
        // رسم المبيعات الشهرية
        this.createMonthlySalesChart('monthlySalesChart');
    },
    
    // تحديث الرسوم الصغيرة
    updateMiniCharts() {
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        
        // بيانات آخر 7 أيام للمبيعات
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.date);
                return invDate.toDateString() === date.toDateString();
            });
            last7Days.push(dayInvoices.reduce((sum, inv) => sum + inv.total, 0));
        }
        
        // رسم بياني صغير للمبيعات
        this.createMiniChart('salesChart', {
            values: last7Days
        }, '#667eea');
        
        // رسم بياني صغير للفواتير
        const invoicesCount = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.date);
                return invDate.toDateString() === date.toDateString();
            });
            invoicesCount.push(dayInvoices.length);
        }
        
        this.createMiniChart('invoicesChart', {
            values: invoicesCount
        }, '#f093fb');
        
        // رسم بياني صغير للمنتجات (ثابت)
        const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
        this.createMiniChart('productsChart', {
            values: [products.length, products.length, products.length, products.length, products.length, products.length, products.length]
        }, '#4facfe');
        
        // رسم بياني صغير للموظفين (ثابت)
        const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
        this.createMiniChart('employeesChart', {
            values: [employees.length, employees.length, employees.length, employees.length, employees.length, employees.length, employees.length]
        }, '#43e97b');
    },
    
    // تنظيف الرسوم البيانية
    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }
};

// تحديث الرسوم البيانية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        ChartManager.updateAllCharts();
    }, 500);
});
