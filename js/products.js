// إدارة المنتجات
function loadProductsPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h2><i class="fas fa-hamburger"></i> إدارة المنتجات</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-info" onclick="showManageCategoriesModal()">
                        <i class="fas fa-tags"></i> إدارة التصنيفات
                    </button>
                    <button class="btn btn-success" onclick="showAddProductModal()">
                        <i class="fas fa-plus"></i> إضافة منتج
                    </button>
                    <button class="btn btn-secondary" onclick="showHomePage()">
                        <i class="fas fa-home"></i> العودة
                    </button>
                </div>
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <label>البحث</label>
                    <input type="text" id="searchProducts" class="form-control" placeholder="ابحث بالاسم...">
                </div>
                <div class="filter-group">
                    <label>التصنيف</label>
                    <select id="filterCategory" class="form-control">
                        <option value="">جميع التصنيفات</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>الترتيب</label>
                    <select id="sortProducts" class="form-control">
                        <option value="name_asc">الاسم (أ-ي)</option>
                        <option value="name_desc">الاسم (ي-أ)</option>
                        <option value="price_asc">السعر (من الأقل)</option>
                        <option value="price_desc">السعر (من الأعلى)</option>
                    </select>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" id="productsTableContainer"></div>
            </div>
        </div>
    `;
    
    loadCategoryFilter();
    renderProductsTable();
    
    // معالجة البحث
    document.getElementById('searchProducts').addEventListener('input', renderProductsTable);
    document.getElementById('filterCategory').addEventListener('change', renderProductsTable);
    document.getElementById('sortProducts').addEventListener('change', renderProductsTable);
}

// تحميل تصنيفات الفلتر
function loadCategoryFilter() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const filterSelect = document.getElementById('filterCategory');
    
    if (!filterSelect) return;
    
    categories.forEach(cat => {
        const option = createElement('option', { value: cat.id }, `${cat.icon} ${cat.name}`);
        filterSelect.appendChild(option);
    });
}

// عرض جدول المنتجات
function renderProductsTable() {
    let products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const container = document.getElementById('productsTableContainer');
    
    if (!container) return;
    
    // البحث
    const searchTerm = document.getElementById('searchProducts')?.value || '';
    if (searchTerm) {
        products = searchArray(products, searchTerm, ['name']);
    }
    
    // التصفية بالتصنيف
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    if (categoryFilter) {
        products = products.filter(p => p.category === categoryFilter);
    }
    
    // الترتيب
    const sortBy = document.getElementById('sortProducts')?.value || 'name_asc';
    const [field, order] = sortBy.split('_');
    products = sortArray(products, field, order);
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد منتجات</p>';
        return;
    }
    
    const rows = products.map(product => {
        const category = categories.find(c => c.id === product.category);
        return {
            image: product.image ? `<img src="${product.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : '<i class="fas fa-image"></i>',
            name: product.name,
            category: category ? `${category.icon} ${category.name}` : '-',
            price: formatCurrency(product.price),
            data: product
        };
    });
    
    const table = createTable(
        ['الصورة', 'اسم المنتج', 'التصنيف', 'السعر'],
        rows,
        [
            {
                label: 'تعديل',
                class: 'btn-warning',
                icon: 'fas fa-edit',
                handler: (row) => showEditProductModal(row.data)
            },
            {
                label: 'حذف',
                class: 'btn-danger',
                icon: 'fas fa-trash',
                handler: (row) => deleteProduct(row.data.id)
            }
        ]
    );
    
    container.innerHTML = '';
    container.appendChild(table);
}

// إضافة منتج جديد
function showAddProductModal() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    const content = `
        <form id="addProductForm">
            <div class="form-group">
                <label>صورة المنتج</label>
                <div class="product-image-upload" id="imageUpload">
                    <div class="upload-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>انقر لرفع صورة</p>
                    </div>
                </div>
                <input type="file" id="productImage" accept="image/*" style="display: none;">
            </div>
            
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
                <label>السعر</label>
                <input type="number" id="productPrice" class="form-control" min="0" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>الوصف (اختياري)</label>
                <textarea id="productDescription" class="form-control" rows="3"></textarea>
            </div>
        </form>
    `;
    
    const modal = createModal('إضافة منتج جديد', content, [
        {
            label: 'إلغاء',
            class: 'btn-secondary'
        },
        {
            label: 'إضافة',
            class: 'btn-success',
            handler: () => {
                const form = document.getElementById('addProductForm');
                if (form.checkValidity()) {
                    addProduct();
                } else {
                    form.reportValidity();
                }
            },
            closeOnClick: false
        }
    ]);
    
    // رفع الصورة
    setupImageUpload();
}

let selectedProductImage = null;

// إعداد رفع الصورة
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const imageInput = document.getElementById('productImage');
    
    if (imageUpload && imageInput) {
        imageUpload.addEventListener('click', () => imageInput.click());
        
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedProductImage = await readFileAsBase64(file);
                imageUpload.innerHTML = `<img src="${selectedProductImage}" alt="منتج">`;
            }
        });
    }
}

// إضافة المنتج
async function addProduct() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    
    const newProduct = {
        id: generateId(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value || '',
        image: selectedProductImage || '',
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
    
    selectedProductImage = null;
    
    showNotification('تم إضافة المنتج بنجاح', 'success');
    renderProductsTable();
    updateDashboardStats();
    
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

// تعديل منتج
function showEditProductModal(product) {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    selectedProductImage = product.image;
    
    const content = `
        <form id="editProductForm">
            <div class="form-group">
                <label>صورة المنتج</label>
                <div class="product-image-upload" id="imageUpload">
                    ${product.image ? `<img src="${product.image}" alt="منتج">` : `
                        <div class="upload-placeholder">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>انقر لرفع صورة</p>
                        </div>
                    `}
                </div>
                <input type="file" id="productImage" accept="image/*" style="display: none;">
            </div>
            
            <div class="form-group">
                <label>اسم المنتج</label>
                <input type="text" id="productName" class="form-control" value="${product.name}" required>
            </div>
            
            <div class="form-group">
                <label>التصنيف</label>
                <select id="productCategory" class="form-control" required>
                    ${categories.map(cat => 
                        `<option value="${cat.id}" ${cat.id === product.category ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>السعر</label>
                <input type="number" id="productPrice" class="form-control" value="${product.price}" min="0" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>الوصف (اختياري)</label>
                <textarea id="productDescription" class="form-control" rows="3">${product.description || ''}</textarea>
            </div>
        </form>
    `;
    
    createModal('تعديل منتج', content, [
        {
            label: 'إلغاء',
            class: 'btn-secondary'
        },
        {
            label: 'حفظ',
            class: 'btn-success',
            handler: () => updateProduct(product.id),
            closeOnClick: false
        }
    ]);
    
    setupImageUpload();
}

// تحديث المنتج
function updateProduct(productId) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value || '',
            image: selectedProductImage || '',
            updatedAt: new Date().toISOString()
        };
        
        LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
        showNotification('تم تحديث المنتج بنجاح', 'success');
        renderProductsTable();
        
        const modal = document.getElementById('dynamicModal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }
}

// حذف منتج
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
        const filtered = products.filter(p => p.id !== productId);
        
        LocalDB.save(LocalDB.KEYS.PRODUCTS, filtered);
        showNotification('تم حذف المنتج بنجاح', 'success');
        renderProductsTable();
        updateDashboardStats();
    }
}

// إدارة التصنيفات
function showManageCategoriesModal() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    const content = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-success" onclick="showAddCategoryForm()">
                <i class="fas fa-plus"></i> إضافة تصنيف
            </button>
        </div>
        
        <div id="categoriesList">
            ${categories.map(cat => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                    <div>
                        <span style="font-size: 24px;">${cat.icon}</span>
                        <span style="margin-right: 10px; font-weight: bold;">${cat.name}</span>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    createModal('إدارة التصنيفات', content, [
        {
            label: 'إغلاق',
            class: 'btn-secondary'
        }
    ]);
}

// نموذج إضافة تصنيف
function showAddCategoryForm() {
    const content = `
        <form id="addCategoryForm">
            <div class="form-group">
                <label>أيقونة التصنيف (Emoji)</label>
                <input type="text" id="categoryIcon" class="form-control" placeholder="مثال: 🍔" required>
            </div>
            
            <div class="form-group">
                <label>اسم التصنيف</label>
                <input type="text" id="categoryName" class="form-control" required>
            </div>
        </form>
    `;
    
    createModal('إضافة تصنيف', content, [
        {
            label: 'إلغاء',
            class: 'btn-secondary'
        },
        {
            label: 'إضافة',
            class: 'btn-success',
            handler: () => {
                const form = document.getElementById('addCategoryForm');
                if (form.checkValidity()) {
                    addCategory();
                }
            },
            closeOnClick: false
        }
    ]);
}

// إضافة تصنيف
function addCategory() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    const newCategory = {
        id: generateId(),
        name: document.getElementById('categoryName').value,
        icon: document.getElementById('categoryIcon').value
    };
    
    categories.push(newCategory);
    LocalDB.save(LocalDB.KEYS.CATEGORIES, categories);
    
    showNotification('تم إضافة التصنيف بنجاح', 'success');
    
    // إغلاق المودال وإعادة فتح إدارة التصنيفات
    const modal = document.getElementById('dynamicModal');
    if (modal) modal.remove();
    
    setTimeout(() => showManageCategoriesModal(), 100);
}

// حذف تصنيف
function deleteCategory(categoryId) {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
        const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
        const filtered = categories.filter(c => c.id !== categoryId);
        
        LocalDB.save(LocalDB.KEYS.CATEGORIES, filtered);
        showNotification('تم حذف التصنيف بنجاح', 'success');
        
        // إعادة فتح إدارة التصنيفات
        const modal = document.getElementById('dynamicModal');
        if (modal) modal.remove();
        
        setTimeout(() => showManageCategoriesModal(), 100);
    }
}
