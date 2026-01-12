// التطبيق الرئيسي
let currentPage = 'home';

// إظهار الإشعارات
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

// التنقل بين الصفحات
function navigateToSection(sectionName) {
    const homePage = document.getElementById('homePage');
    const pageContainer = document.getElementById('pageContainer');
    
    if (!hasPermission(sectionName) && currentUser.role !== 'admin') {
        showNotification('ليس لديك صلاحية للوصول لهذا القسم', 'error');
        return;
    }
    
    currentPage = sectionName;
    
    // إخفاء الصفحة الرئيسية
    if (homePage) homePage.classList.remove('active');
    
    // تحميل الصفحة المطلوبة
    loadPage(sectionName, pageContainer);
}

// تحميل الصفحة
function loadPage(pageName, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    switch (pageName) {
        case 'pos':
            loadPOSPage(container);
            break;
        case 'products':
            loadProductsPage(container);
            break;
        case 'employees':
            loadEmployeesPage(container);
            break;
        case 'expenses':
            loadExpensesPage(container);
            break;
        case 'reports':
            loadReportsPage(container);
            break;
        case 'invoices':
            loadInvoicesPage(container);
            break;
        case 'backup':
            loadBackupPage(container);
            break;
        case 'security':
            loadSecurityPage(container);
            break;
        case 'settings':
            loadSettingsPage(container);
            break;
        default:
            showHomePage();
    }
}

// العودة للصفحة الرئيسية
function showHomePage() {
    const homePage = document.getElementById('homePage');
    const pageContainer = document.getElementById('pageContainer');
    
    if (pageContainer) pageContainer.innerHTML = '';
    if (homePage) homePage.classList.add('active');
    
    currentPage = 'home';
    updateDashboardStats();
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats() {
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    
    // مبيعات اليوم
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter(inv => new Date(inv.date).toDateString() === today);
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    const todaySalesEl = document.getElementById('todaySales');
    if (todaySalesEl) {
        todaySalesEl.textContent = formatCurrency(todaySales);
    }
    
    // عدد الفواتير
    const totalInvoicesEl = document.getElementById('totalInvoices');
    if (totalInvoicesEl) {
        totalInvoicesEl.textContent = invoices.length;
    }
    
    // عدد المنتجات
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        totalProductsEl.textContent = products.length;
    }
    
    // عدد الموظفين
    const totalEmployeesEl = document.getElementById('totalEmployees');
    if (totalEmployeesEl) {
        totalEmployeesEl.textContent = employees.length;
    }
}

// معالجة النقر على بطاقات الأقسام
document.addEventListener('DOMContentLoaded', () => {
    const sectionCards = document.querySelectorAll('.section-card[data-section]');
    
    sectionCards.forEach(card => {
        card.addEventListener('click', () => {
            const section = card.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // تحديث الإحصائيات كل 30 ثانية
    setInterval(updateDashboardStats, 30000);
});

// دالة لقراءة الملفات كـ Base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// دالة لقراءة الملفات كنص
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// دالة لإنشاء عنصر HTML
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'class') {
            element.className = attributes[key];
        } else if (key === 'style') {
            Object.assign(element.style, attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    if (content) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.appendChild(content);
        }
    }
    
    return element;
}

// دالة للبحث في المصفوفة
function searchArray(array, searchTerm, fields) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// دالة لفرز المصفوفة
function sortArray(array, field, order = 'asc') {
    return array.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// دالة لتصفية المصفوفة بالتاريخ
function filterByDate(array, dateField, startDate, endDate) {
    return array.filter(item => {
        const itemDate = new Date(item[dateField]);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        
        return true;
    });
}

// دالة لإنشاء جدول
function createTable(headers, rows, actions = []) {
    const table = createElement('table');
    
    // رأس الجدول
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    
    headers.forEach(header => {
        const th = createElement('th', {}, header);
        headerRow.appendChild(th);
    });
    
    if (actions.length > 0) {
        headerRow.appendChild(createElement('th', {}, 'الإجراءات'));
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // جسم الجدول
    const tbody = createElement('tbody');
    
    rows.forEach((row, index) => {
        const tr = createElement('tr');
        
        Object.values(row).forEach(cell => {
            const td = createElement('td', {}, cell);
            tr.appendChild(td);
        });
        
        // الإجراءات
        if (actions.length > 0) {
            const actionsTd = createElement('td');
            actionsTd.style.display = 'flex';
            actionsTd.style.gap = '5px';
            
            actions.forEach(action => {
                const btn = createElement('button', {
                    class: `btn btn-sm ${action.class || 'btn-primary'}`
                }, `<i class="${action.icon}"></i> ${action.label}`);
                
                btn.addEventListener('click', () => action.handler(row, index));
                actionsTd.appendChild(btn);
            });
            
            tr.appendChild(actionsTd);
        }
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    return table;
}

// دالة لإنشاء مودال
function createModal(title, content, buttons = []) {
    // إزالة المودال القديم إن وجد
    const oldModal = document.getElementById('dynamicModal');
    if (oldModal) oldModal.remove();
    
    const modal = createElement('div', {
        id: 'dynamicModal',
        class: 'modal'
    });
    
    const modalContent = createElement('div', { class: 'modal-content' });
    
    // رأس المودال
    const modalHeader = createElement('div', { class: 'modal-header' });
    const modalTitle = createElement('h3', {}, title);
    const closeBtn = createElement('span', { class: 'close' }, '&times;');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    modalContent.appendChild(modalHeader);
    
    // محتوى المودال
    const modalBody = createElement('div', { class: 'modal-body' });
    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else {
        modalBody.appendChild(content);
    }
    modalContent.appendChild(modalBody);
    
    // أزرار المودال
    if (buttons.length > 0) {
        const modalFooter = createElement('div', { class: 'modal-footer' });
        modalFooter.style.marginTop = '20px';
        modalFooter.style.display = 'flex';
        modalFooter.style.gap = '10px';
        modalFooter.style.justifyContent = 'flex-end';
        
        buttons.forEach(btn => {
            const button = createElement('button', {
                class: `btn ${btn.class || 'btn-primary'}`
            }, btn.label);
            
            button.addEventListener('click', () => {
                if (btn.handler) btn.handler();
                if (btn.closeOnClick !== false) {
                    modal.style.display = 'none';
                    modal.remove();
                }
            });
            
            modalFooter.appendChild(button);
        });
        
        modalContent.appendChild(modalFooter);
    }
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // إظهار المودال
    modal.style.display = 'block';
    
    // إغلاق عند النقر خارج المودال
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
    
    return modal;
}
