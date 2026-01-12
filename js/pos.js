// نظام نقطة البيع (POS)
let cart = [];
let selectedCategory = 'all';

// تحميل صفحة نقطة البيع
function loadPOSPage(container) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-cash-register"></i> نقطة البيع</h2>
                <button class="btn btn-secondary" onclick="showHomePage()">
                    <i class="fas fa-home"></i> العودة للرئيسية
                </button>
            </div>
            
            <div class="pos-container">
                <div class="products-section">
                    <div class="categories-tabs" id="categoriesTabs"></div>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <label>البحث عن منتج</label>
                            <input type="text" id="searchProduct" class="form-control" placeholder="ابحث بالاسم...">
                        </div>
                    </div>
                    
                    <div class="products-grid" id="productsGrid"></div>
                </div>
                
                <div class="cart-section">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> السلة</h3>
                    </div>
                    
                    <div class="cart-items" id="cartItems"></div>
                    
                    <div class="cart-total">
                        <div class="total-row">
                            <span>المجموع الفرعي:</span>
                            <span id="subtotal">0 IQD</span>
                        </div>
                        <div class="total-row final">
                            <span>الإجمالي:</span>
                            <span id="total">0 IQD</span>
                        </div>
                    </div>
                    
                    <div class="cart-actions">
                        <button class="btn btn-warning" onclick="suspendSale()">
                            <i class="fas fa-pause"></i> تعليق
                        </button>
                        <button class="btn btn-danger" onclick="clearCart()">
                            <i class="fas fa-trash"></i> مسح
                        </button>
                        <button class="btn btn-success" onclick="processSale()">
                            <i class="fas fa-print"></i> بيع
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderCategories();
    renderProducts();
    renderCart();
    
    // البحث عن المنتجات
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }
}

// عرض التصنيفات
function renderCategories() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const categoriesContainer = document.getElementById('categoriesTabs');
    
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = `
        <div class="category-tab ${selectedCategory === 'all' ? 'active' : ''}" 
             onclick="selectCategory('all')">
            <i class="fas fa-list"></i> الكل
        </div>
    `;
    
    categories.forEach(category => {
        const tab = createElement('div', {
            class: `category-tab ${selectedCategory === category.id ? 'active' : ''}`
        }, `${category.icon} ${category.name}`);
        
        tab.addEventListener('click', () => selectCategory(category.id));
        categoriesContainer.appendChild(tab);
    });
}

// اختيار تصنيف
function selectCategory(categoryId) {
    selectedCategory = categoryId;
    renderCategories();
    renderProducts();
}

// عرض المنتجات
function renderProducts(searchTerm = '') {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    // تصفية المنتجات
    let filteredProducts = products;
    
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
        filteredProducts = searchArray(filteredProducts, searchTerm, ['name', 'category']);
    }
    
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; color: #7f8c8d;">لا توجد منتجات</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createElement('div', { class: 'product-item' });
        
        productCard.innerHTML = `
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : '<div class="product-image" style="background: #ecf0f1; display: flex; align-items: center; justify-content: center;"><i class="fas fa-utensils" style="font-size: 40px; color: #bdc3c7;"></i></div>'}
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price)}</div>
        `;
        
        productCard.addEventListener('click', () => showQuantityModal(product));
        productsGrid.appendChild(productCard);
    });
}

// إظهار نافذة الكمية
function showQuantityModal(product) {
    const content = `
        <div class="form-group">
            <label>الكمية</label>
            <input type="number" id="quantity" class="form-control" value="1" min="1">
        </div>
        <div class="form-group">
            <label>السعر</label>
            <p style="font-size: 20px; font-weight: bold; color: var(--primary-color);">${formatCurrency(product.price)}</p>
        </div>
    `;
    
    createModal(`إضافة: ${product.name}`, content, [
        {
            label: 'إلغاء',
            class: 'btn-secondary'
        },
        {
            label: 'إضافة للسلة',
            class: 'btn-success',
            handler: () => {
                const quantity = parseInt(document.getElementById('quantity').value) || 1;
                addToCart(product, quantity);
            }
        }
    ]);
}

// إضافة للسلة
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    renderCart();
    showNotification(`تم إضافة ${product.name} للسلة`, 'success');
}

// عرض السلة
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">السلة فارغة</p>';
        if (subtotalEl) subtotalEl.textContent = '0 IQD';
        if (totalEl) totalEl.textContent = '0 IQD';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = createElement('div', { class: 'cart-item' });
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">${formatCurrency(item.price)} × ${item.quantity}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div style="font-weight: bold; color: var(--primary-color);">${formatCurrency(itemTotal)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalEl) totalEl.textContent = formatCurrency(subtotal);
}

// تحديث الكمية
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        renderCart();
    }
}

// إزالة من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    showNotification('تم إزالة المنتج من السلة', 'info');
}

// مسح السلة
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('هل أنت متأكد من مسح السلة؟')) {
        cart = [];
        renderCart();
        showNotification('تم مسح السلة', 'info');
    }
}

// تعليق البيع
function suspendSale() {
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'warning');
        return;
    }
    
    const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
    
    const suspended = {
        id: generateId(),
        items: [...cart],
        date: new Date().toISOString(),
        user: currentUser.username
    };
    
    suspendedSales.push(suspended);
    LocalDB.save(LocalDB.KEYS.SUSPENDED_SALES, suspendedSales);
    
    cart = [];
    renderCart();
    showNotification('تم تعليق البيع', 'success');
}

// معالجة البيع
function processSale() {
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'warning');
        return;
    }
    
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const invoice = {
        id: generateId(),
        invoiceNumber: invoices.length + 1,
        items: [...cart],
        subtotal: subtotal,
        total: subtotal,
        date: new Date().toISOString(),
        user: currentUser.username,
        status: 'completed'
    };
    
    invoices.unshift(invoice);
    LocalDB.save(LocalDB.KEYS.INVOICES, invoices);
    
    // طباعة الفاتورة
    printInvoice(invoice);
    
    // مسح السلة
    cart = [];
    renderCart();
    updateDashboardStats();
    
    showNotification('تم إتمام البيع بنجاح', 'success');
}
