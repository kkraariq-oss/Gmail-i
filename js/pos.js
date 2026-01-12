// نظام نقطة البيع (POS) - الإصدار 3.0 المتقدم
let cart = [];
let selectedCategory = 'all';

// تحميل صفحة نقطة البيع
function loadPOSPage(container) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
    
    container.innerHTML = `
        <div class="page active">
            <!-- حاوية نقطة البيع -->
            <div class="pos-workspace-v3">
                <!-- قسم المنتجات -->
                <div class="products-panel-v3">
                    <!-- التصنيفات -->
                    <div class="categories-bar-v3" id="categoriesTabs"></div>
                    
                    <!-- شريط البحث -->
                    <div class="search-panel-v3">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchProduct" placeholder="ابحث عن منتج بالاسم...">
                    </div>
                    
                    <!-- شبكة المنتجات -->
                    <div class="products-grid-v3" id="productsGrid"></div>
                </div>
                
                <!-- قسم السلة -->
                <div class="cart-panel-v3">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> سلة المشتريات</h3>
                        <span class="cart-badge" id="cartCount">0</span>
                    </div>
                    
                    <div class="cart-items-container" id="cartItems"></div>
                    
                    <div class="cart-footer">
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>المجموع الفرعي:</span>
                                <span id="subtotal">0 IQD</span>
                            </div>
                            <div class="summary-row total">
                                <span>الإجمالي:</span>
                                <span id="total">0 IQD</span>
                            </div>
                        </div>
                        
                        <div class="cart-buttons">
                            <button class="btn-cart btn-suspend" onclick="suspendSale()">
                                <i class="fas fa-pause"></i> تعليق
                            </button>
                            <button class="btn-cart btn-clear" onclick="clearCart()">
                                <i class="fas fa-trash"></i> مسح
                            </button>
                            <button class="btn-cart btn-checkout" onclick="processSale()">
                                <i class="fas fa-check-circle"></i> إتمام البيع
                            </button>
                        </div>
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
        <div class="category-chip ${selectedCategory === 'all' ? 'active' : ''}" 
             onclick="selectCategory('all')">
            <i class="fas fa-th"></i>
            <span>الكل</span>
        </div>
    `;
    
    categories.forEach(category => {
        const chip = document.createElement('div');
        chip.className = `category-chip ${selectedCategory === category.id ? 'active' : ''}`;
        chip.innerHTML = `
            <span class="emoji">${category.icon}</span>
            <span>${category.name}</span>
        `;
        chip.addEventListener('click', () => selectCategory(category.id));
        categoriesContainer.appendChild(chip);
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
    
    let filteredProducts = products;
    
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
        filteredProducts = searchArray(filteredProducts, searchTerm, ['name']);
    }
    
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>لا توجد منتجات</p>
                <small>جرب البحث بكلمة أخرى أو اختر تصنيف آخر</small>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.productId = product.id;
        
        productCard.innerHTML = `
            <div class="product-img">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}">` 
                    : `<div class="no-img"><i class="fas fa-utensils"></i></div>`
                }
            </div>
            <div class="product-details">
                <h4>${product.name}</h4>
                <p class="price">${formatCurrency(product.price)}</p>
            </div>
        `;
        
        // النقر على المنتج بالكامل لفتح نافذة الكمية
        productCard.addEventListener('click', () => {
            showQuantityModal(product);
        });
        
        productsGrid.appendChild(productCard);
    });
}

// نافذة إدخال الكمية
function showQuantityModal(product) {
    const modal = document.createElement('div');
    modal.className = 'quantity-modal-overlay';
    modal.innerHTML = `
        <div class="quantity-modal">
            <div class="quantity-modal-header">
                <h3>${product.name}</h3>
                <button class="close-modal" onclick="this.closest('.quantity-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="quantity-modal-body">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}" class="product-preview">` 
                    : `<div class="product-preview-placeholder"><i class="fas fa-utensils"></i></div>`
                }
                <div class="price-display">${formatCurrency(product.price)}</div>
                <div class="quantity-input-group">
                    <button class="qty-control" onclick="decreaseQuantity()">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="quantityInput" value="1" min="1" max="999" class="quantity-input">
                    <button class="qty-control" onclick="increaseQuantity()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="total-display">
                    <span>الإجمالي:</span>
                    <span id="modalTotal">${formatCurrency(product.price)}</span>
                </div>
            </div>
            <div class="quantity-modal-footer">
                <button class="btn-modal-cancel" onclick="this.closest('.quantity-modal-overlay').remove()">
                    إلغاء
                </button>
                <button class="btn-modal-add" onclick="addToCartFromModal()">
                    <i class="fas fa-shopping-cart"></i> إضافة للسلة
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // حفظ بيانات المنتج
    window.currentModalProduct = product;
    
    // تحديث الإجمالي عند تغيير الكمية
    const quantityInput = document.getElementById('quantityInput');
    quantityInput.addEventListener('input', updateModalTotal);
    
    // focus على input
    setTimeout(() => quantityInput.focus(), 100);
    
    // Enter للإضافة
    quantityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addToCartFromModal();
        }
    });
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = Math.min(999, parseInt(input.value) + 1);
    updateModalTotal();
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = Math.max(1, parseInt(input.value) - 1);
    updateModalTotal();
}

function updateModalTotal() {
    const input = document.getElementById('quantityInput');
    const quantity = parseInt(input.value) || 1;
    const totalEl = document.getElementById('modalTotal');
    const product = window.currentModalProduct;
    
    if (totalEl && product) {
        totalEl.textContent = formatCurrency(product.price * quantity);
    }
}

function addToCartFromModal() {
    const input = document.getElementById('quantityInput');
    const quantity = parseInt(input.value) || 1;
    const product = window.currentModalProduct;
    
    if (!product || quantity < 1) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: quantity,
            category: product.category || ''
        });
    }
    
    renderCart();
    
    // تشغيل الصوت
    if (typeof soundManager !== 'undefined') {
        soundManager.play('addToCart');
    }
    
    // إغلاق النافذة
    document.querySelector('.quantity-modal-overlay').remove();
    
    // رسالة نجاح
    showQuickToast(`تمت إضافة ${quantity} ${product.name} ✓`);
}

// عرض رسالة سريعة
function showQuickToast(message) {
    const toast = document.createElement('div');
    toast.className = 'quick-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// عرض السلة
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const cartCountEl = document.getElementById('cartCount');
    
    if (!cartItemsContainer) return;
    
    // تحديث عدد العناصر
    if (cartCountEl) {
        cartCountEl.textContent = cart.length;
    }
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>السلة فارغة</p>
                <small>اضغط على أي منتج لإضافته</small>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '0 IQD';
        if (totalEl) totalEl.textContent = '0 IQD';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="item-header">
                <h4>${item.name}</h4>
                <button class="remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-controls">
                <span class="item-price">${formatCurrency(item.price)}</span>
                <div class="quantity-control">
                    <button class="qty-btn minus">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty">${item.quantity}</span>
                    <button class="qty-btn plus">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <span class="item-total">${formatCurrency(itemTotal)}</span>
            </div>
        `;
        
        // أحداث الأزرار
        const removeBtn = cartItem.querySelector('.remove-btn');
        const minusBtn = cartItem.querySelector('.minus');
        const plusBtn = cartItem.querySelector('.plus');
        
        removeBtn.addEventListener('click', () => removeFromCart(index));
        minusBtn.addEventListener('click', () => updateQuantity(index, -1));
        plusBtn.addEventListener('click', () => updateQuantity(index, 1));
        
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
            if (typeof soundManager !== 'undefined') {
                soundManager.play('removeFromCart');
            }
        }
        
        renderCart();
    }
}

// إزالة من السلة
function removeFromCart(index) {
    if (cart[index]) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        renderCart();
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('removeFromCart');
        }
        
        showNotification(`تم إزالة ${itemName}`, 'info');
    }
}

// مسح السلة
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('هل تريد مسح جميع المنتجات من السلة؟')) {
        cart = [];
        renderCart();
        showNotification('تم مسح السلة', 'info');
    }
}

// تعليق البيع
function suspendSale() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!', 'warning');
        return;
    }
    
    try {
        const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
        
        const suspended = {
            id: generateId(),
            number: suspendedSales.length + 1,
            items: JSON.parse(JSON.stringify(cart)),
            total: cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0),
            date: new Date().toISOString(),
            user: currentUser ? currentUser.username : 'admin'
        };
        
        suspendedSales.push(suspended);
        LocalDB.save(LocalDB.KEYS.SUSPENDED_SALES, suspendedSales);
        
        cart = [];
        renderCart();
        showNotification('تم تعليق البيع بنجاح', 'success');
        
        setTimeout(() => navigateToSection('pos'), 500);
    } catch (error) {
        console.error('Error suspending sale:', error);
        showNotification('خطأ في تعليق البيع', 'error');
    }
}

// إظهار نافذة الإيصالات المعلقة
function showSuspendedSalesModal() {
    const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
    
    if (suspendedSales.length === 0) {
        showNotification('لا توجد إيصالات معلقة', 'info');
        return;
    }
    
    const content = document.createElement('div');
    content.className = 'suspended-list';
    
    suspendedSales.forEach((sale) => {
        const saleCard = document.createElement('div');
        saleCard.className = 'suspended-card';
        
        saleCard.innerHTML = `
            <div class="suspended-header">
                <h4><i class="fas fa-receipt"></i> إيصال #${sale.number}</h4>
                <span class="suspended-date">${formatDate(sale.date)} - ${formatTime(sale.date)}</span>
            </div>
            <div class="suspended-info">
                <p><i class="fas fa-user"></i> ${sale.user}</p>
                <p><i class="fas fa-shopping-bag"></i> ${sale.items.length} منتج</p>
                <p class="suspended-amount"><i class="fas fa-dollar-sign"></i> ${formatCurrency(sale.total)}</p>
            </div>
            <div class="suspended-actions">
                <button class="btn btn-success btn-sm load-btn">
                    <i class="fas fa-download"></i> تحميل
                </button>
                <button class="btn btn-danger btn-sm delete-btn">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        
        const loadBtn = saleCard.querySelector('.load-btn');
        const deleteBtn = saleCard.querySelector('.delete-btn');
        
        loadBtn.addEventListener('click', () => loadSuspendedSale(sale.id));
        deleteBtn.addEventListener('click', () => deleteSuspendedSale(sale.id));
        
        content.appendChild(saleCard);
    });
    
    createModal('الإيصالات المعلقة', content, [
        { label: 'إغلاق', class: 'btn-secondary' }
    ]);
}

// تحميل إيصال معلق
function loadSuspendedSale(saleId) {
    try {
        const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
        const sale = suspendedSales.find(s => s.id === saleId);
        
        if (!sale) {
            showNotification('الإيصال غير موجود', 'error');
            return;
        }
        
        cart = JSON.parse(JSON.stringify(sale.items));
        renderCart();
        
        const filteredSales = suspendedSales.filter(s => s.id !== saleId);
        LocalDB.save(LocalDB.KEYS.SUSPENDED_SALES, filteredSales);
        
        const modal = document.getElementById('dynamicModal');
        if (modal) modal.remove();
        
        showNotification('تم تحميل الإيصال', 'success');
        setTimeout(() => navigateToSection('pos'), 500);
    } catch (error) {
        console.error('Error loading suspended sale:', error);
        showNotification('خطأ في تحميل الإيصال', 'error');
    }
}

// حذف إيصال معلق
function deleteSuspendedSale(saleId) {
    if (!confirm('هل تريد حذف هذا الإيصال؟')) return;
    
    try {
        const suspendedSales = LocalDB.get(LocalDB.KEYS.SUSPENDED_SALES) || [];
        const filteredSales = suspendedSales.filter(s => s.id !== saleId);
        
        LocalDB.save(LocalDB.KEYS.SUSPENDED_SALES, filteredSales);
        showNotification('تم حذف الإيصال', 'success');
        
        const modal = document.getElementById('dynamicModal');
        if (modal) modal.remove();
        
        setTimeout(() => navigateToSection('pos'), 500);
    } catch (error) {
        console.error('Error deleting suspended sale:', error);
        showNotification('خطأ في حذف الإيصال', 'error');
    }
}

// معالجة البيع - مع طباعة مزدوجة
function processSale() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!', 'warning');
        return;
    }
    
    try {
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        
        // حساب المجموع
        const subtotal = cart.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
        
        // إنشاء نسخة آمنة من العناصر
        const invoiceItems = cart.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            category: item.category || ''
        }));
        
        // إنشاء الفاتورة
        const invoice = {
            id: generateId(),
            invoiceNumber: invoices.length + 1,
            items: invoiceItems,
            subtotal: subtotal,
            total: subtotal,
            date: new Date().toISOString(),
            user: currentUser ? currentUser.username : 'admin',
            status: 'completed'
        };
        
        // حفظ الفاتورة
        invoices.unshift(invoice);
        LocalDB.save(LocalDB.KEYS.INVOICES, invoices);
        
        // طباعة إيصالين (للمطبخ والكاشير)
        try {
            if (typeof printInvoice === 'function') {
                // طباعة للكاشير
                printInvoice(invoice, 'cashier');
                
                // طباعة للمطبخ
                setTimeout(() => {
                    printInvoice(invoice, 'kitchen');
                }, 1000);
            }
        } catch (printError) {
            console.error('Print error:', printError);
        }
        
        // تشغيل صوت النجاح
        if (typeof soundManager !== 'undefined') {
            soundManager.play('completeSale');
        }
        
        // مسح السلة
        cart = [];
        renderCart();
        
        // تحديث الإحصائيات
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
        
        showNotification('تم إتمام البيع بنجاح ✓', 'success');
        
    } catch (error) {
        console.error('Error in processSale:', error);
        showNotification('خطأ في معالجة البيع: ' + error.message, 'error');
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('error');
        }
    }
}
