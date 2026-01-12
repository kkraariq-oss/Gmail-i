// نظام إدارة المنتجات - محدث v3.0

function loadProductsPage(container) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-hamburger"></i> إدارة المنتجات</h2>
                <div class="page-actions">
                    <button class="btn btn-success" onclick="showAddProductModal()">
                        <i class="fas fa-plus"></i> إضافة منتج
                    </button>
                    <button class="btn btn-primary" onclick="showManageCategoriesModal()">
                        <i class="fas fa-tags"></i> إدارة التصنيفات
                    </button>
                </div>
            </div>

            <!-- البحث والفلترة -->
            <div class="filters-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchProducts" placeholder="ابحث عن منتج...">
                </div>
                <select id="filterCategory" class="filter-select">
                    <option value="">جميع التصنيفات</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                </select>
            </div>

            <!-- جدول المنتجات -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>اسم المنتج</th>
                            <th>التصنيف</th>
                            <th>السعر</th>
                            <th>أضيف بواسطة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody"></tbody>
                </table>
            </div>
        </div>
    `;
    
    renderProductsTable();
    
    // البحث
    document.getElementById('searchProducts').addEventListener('input', renderProductsTable);
    document.getElementById('filterCategory').addEventListener('change', renderProductsTable);
}

function renderProductsTable() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const tbody = document.getElementById('productsTableBody');
    
    if (!tbody) return;
    
    const searchTerm = document.getElementById('searchProducts')?.value || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    
    let filtered = products;
    
    if (searchTerm) {
        filtered = searchArray(filtered, searchTerm, ['name', 'category']);
    }
    
    if (filterCategory) {
        filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-box-open" style="font-size: 48px; display: block; margin-bottom: 16px;"></i>
                    لا توجد منتجات
                </td>
            </tr>
        `;
        return;
    }
    
    filtered.forEach(product => {
        const category = categories.find(c => c.id === product.category);
        const addedBy = product.addedBy || 'admin';
        const addedByDisplay = addedBy === (window.currentUser ? window.currentUser.username : 'admin') ? 
            `<span class="badge badge-success"><i class="fas fa-user-shield"></i> أنت</span>` : 
            `<span class="badge badge-secondary"><i class="fas fa-user"></i> ${addedBy}</span>`;
        
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">` 
                    : `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f5f7fa, #c3cfe2); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><i class="fas fa-utensils" style="font-size: 24px; color: #bdc3c7;"></i></div>`
                }
            </td>
            <td style="font-weight: 700; font-size: 15px;">${product.name}</td>
            <td>
                <span class="badge badge-info">
                    ${category ? category.icon + ' ' + category.name : 'غير محدد'}
                </span>
            </td>
            <td style="font-weight: 800; color: var(--primary-color); font-size: 16px;">${formatCurrency(product.price)}</td>
            <td>
                ${addedByDisplay}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-info" onclick="viewProductDetails('${product.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-warning" onclick="editProduct('${product.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${window.currentUser && window.currentUser.role === 'admin' ? `
                    <button class="btn-icon btn-danger" onclick="deleteProduct('${product.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// عرض تفاصيل المنتج
function viewProductDetails(productId) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }
    
    const category = categories.find(c => c.id === product.category);
    
    const content = document.createElement('div');
    content.className = 'product-details-view';
    content.innerHTML = `
        <div class="product-detail-card">
            <div class="product-detail-image">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}">` 
                    : `<div class="no-image"><i class="fas fa-utensils"></i></div>`
                }
            </div>
            <div class="product-detail-info">
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-tag"></i> اسم المنتج:</span>
                    <span class="detail-value">${product.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-list"></i> التصنيف:</span>
                    <span class="detail-value">${category ? category.icon + ' ' + category.name : 'غير محدد'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-dollar-sign"></i> السعر:</span>
                    <span class="detail-value price">${formatCurrency(product.price)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-user"></i> أضيف بواسطة:</span>
                    <span class="detail-value">${product.addedBy || 'admin'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-clock"></i> تاريخ الإضافة:</span>
                    <span class="detail-value">${product.createdAt ? new Date(product.createdAt).toLocaleString('ar-IQ') : 'غير محدد'}</span>
                </div>
                ${product.description ? `
                <div class="detail-row full-width">
                    <span class="detail-label"><i class="fas fa-info-circle"></i> الوصف:</span>
                    <span class="detail-value">${product.description}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    createModal('تفاصيل المنتج', content, [
        { label: 'تعديل', class: 'btn-warning', callback: () => { document.getElementById('dynamicModal').remove(); editProduct(productId); } },
        { label: 'إغلاق', class: 'btn-secondary' }
    ]);
}

// إضافة منتج
function showAddProductModal() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    const content = document.createElement('div');
    content.innerHTML = `
        <form id="addProductForm" class="modal-form">
            <div class="form-group">
                <label>اسم المنتج</label>
                <input type="text" id="productName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>التصنيف</label>
                <select id="productCategory" class="form-control" required>
                    <option value="">اختر التصنيف</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>السعر (IQD)</label>
                <input type="number" id="productPrice" class="form-control" required min="0" step="100">
            </div>
            <div class="form-group">
                <label>الوصف (اختياري)</label>
                <textarea id="productDescription" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>صورة المنتج (اختياري)</label>
                <input type="file" id="productImage" class="form-control" accept="image/*">
            </div>
        </form>
    `;
    
    createModal('إضافة منتج جديد', content, [
        { 
            label: 'إضافة', 
            class: 'btn-success',
            callback: () => {
                const form = document.getElementById('addProductForm');
                if (form.checkValidity()) {
                    addProduct();
                } else {
                    form.reportValidity();
                }
            }
        },
        { label: 'إلغاء', class: 'btn-secondary' }
    ]);
}

function addProduct() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const imageInput = document.getElementById('productImage');
    
    const product = {
        id: generateId(),
        name,
        category,
        price,
        description,
        image: '',
        addedBy: window.currentUser ? window.currentUser.username : 'admin',
        createdAt: new Date().toISOString()
    };
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            product.image = e.target.result;
            products.push(product);
            LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
            renderProductsTable();
            document.getElementById('dynamicModal').remove();
            showNotification('تم إضافة المنتج بنجاح', 'success');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        products.push(product);
        LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
        renderProductsTable();
        document.getElementById('dynamicModal').remove();
        showNotification('تم إضافة المنتج بنجاح', 'success');
    }
}

// تعديل منتج
function editProduct(productId) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const content = document.createElement('div');
    content.innerHTML = `
        <form id="editProductForm" class="modal-form">
            <div class="form-group">
                <label>اسم المنتج</label>
                <input type="text" id="editProductName" class="form-control" value="${product.name}" required>
            </div>
            <div class="form-group">
                <label>التصنيف</label>
                <select id="editProductCategory" class="form-control" required>
                    <option value="">اختر التصنيف</option>
                    ${categories.map(cat => `
                        <option value="${cat.id}" ${cat.id === product.category ? 'selected' : ''}>
                            ${cat.icon} ${cat.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>السعر (IQD)</label>
                <input type="number" id="editProductPrice" class="form-control" value="${product.price}" required min="0" step="100">
            </div>
            <div class="form-group">
                <label>الوصف (اختياري)</label>
                <textarea id="editProductDescription" class="form-control" rows="3">${product.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>تغيير الصورة (اختياري)</label>
                <input type="file" id="editProductImage" class="form-control" accept="image/*">
            </div>
            ${product.image ? `<img src="${product.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">` : ''}
        </form>
    `;
    
    createModal('تعديل المنتج', content, [
        { 
            label: 'حفظ', 
            class: 'btn-success',
            callback: () => {
                const form = document.getElementById('editProductForm');
                if (form.checkValidity()) {
                    saveProductEdit(productId);
                } else {
                    form.reportValidity();
                }
            }
        },
        { label: 'إلغاء', class: 'btn-secondary' }
    ]);
}

function saveProductEdit(productId) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) return;
    
    const product = products[index];
    product.name = document.getElementById('editProductName').value;
    product.category = document.getElementById('editProductCategory').value;
    product.price = parseFloat(document.getElementById('editProductPrice').value);
    product.description = document.getElementById('editProductDescription').value;
    
    const imageInput = document.getElementById('editProductImage');
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            product.image = e.target.result;
            LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
            renderProductsTable();
            document.getElementById('dynamicModal').remove();
            showNotification('تم تحديث المنتج بنجاح', 'success');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
        renderProductsTable();
        document.getElementById('dynamicModal').remove();
        showNotification('تم تحديث المنتج بنجاح', 'success');
    }
}

// حذف منتج
function deleteProduct(productId) {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const filtered = products.filter(p => p.id !== productId);
    
    LocalDB.save(LocalDB.KEYS.PRODUCTS, filtered);
    renderProductsTable();
    showNotification('تم حذف المنتج بنجاح', 'success');
}

// إدارة التصنيفات
function showManageCategoriesModal() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    const content = document.createElement('div');
    content.innerHTML = `
        <div class="categories-manager">
            <div class="categories-list" id="categoriesList"></div>
            <div class="add-category-form">
                <h4>إضافة تصنيف جديد</h4>
                <div class="form-group">
                    <input type="text" id="newCategoryName" class="form-control" placeholder="اسم التصنيف">
                </div>
                <div class="form-group">
                    <input type="text" id="newCategoryIcon" class="form-control" placeholder="الأيقونة (emoji)">
                </div>
                <button class="btn btn-success" onclick="addCategory()">
                    <i class="fas fa-plus"></i> إضافة
                </button>
            </div>
        </div>
    `;
    
    createModal('إدارة التصنيفات', content, [
        { label: 'إغلاق', class: 'btn-secondary' }
    ]);
    
    renderCategoriesList();
}

function renderCategoriesList() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const list = document.getElementById('categoriesList');
    
    if (!list) return;
    
    list.innerHTML = '';
    
    categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
            <button class="btn-icon btn-danger" onclick="deleteCategory('${category.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(div);
    });
}

function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const icon = document.getElementById('newCategoryIcon').value.trim();
    
    if (!name || !icon) {
        showNotification('يرجى إدخال اسم التصنيف والأيقونة', 'warning');
        return;
    }
    
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    categories.push({
        id: generateId(),
        name,
        icon
    });
    
    LocalDB.save(LocalDB.KEYS.CATEGORIES, categories);
    renderCategoriesList();
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryIcon').value = '';
    showNotification('تم إضافة التصنيف بنجاح', 'success');
}

function deleteCategory(categoryId) {
    if (!confirm('هل تريد حذف هذا التصنيف؟')) return;
    
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const filtered = categories.filter(c => c.id !== categoryId);
    
    LocalDB.save(LocalDB.KEYS.CATEGORIES, filtered);
    renderCategoriesList();
    showNotification('تم حذف التصنيف بنجاح', 'success');
}

window.viewProductDetails = viewProductDetails;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showAddProductModal = showAddProductModal;
window.showManageCategoriesModal = showManageCategoriesModal;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
