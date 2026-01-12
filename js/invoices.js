// إدارة الفواتير
function loadInvoicesPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-file-invoice"></i> الفواتير</h2>
                <button class="btn btn-secondary" onclick="showHomePage()">
                    <i class="fas fa-home"></i> العودة
                </button>
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <label>البحث برقم الفاتورة</label>
                    <input type="text" id="searchInvoices" class="form-control">
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" id="invoicesTableContainer"></div>
            </div>
        </div>
    `;
    
    renderInvoicesTable();
    document.getElementById('searchInvoices').addEventListener('input', renderInvoicesTable);
}

function renderInvoicesTable() {
    let invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    const container = document.getElementById('invoicesTableContainer');
    
    const searchTerm = document.getElementById('searchInvoices')?.value || '';
    if (searchTerm) {
        invoices = invoices.filter(inv => 
            inv.invoiceNumber.toString().includes(searchTerm)
        );
    }
    
    if (invoices.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد فواتير</p>';
        return;
    }
    
    const rows = invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        itemsCount: inv.items.length,
        total: formatCurrency(inv.total),
        date: formatDate(inv.date),
        time: formatTime(inv.date),
        data: inv
    }));
    
    const table = createTable(
        ['رقم الفاتورة', 'عدد الأصناف', 'المجموع', 'التاريخ', 'الوقت'],
        rows,
        [
            {
                label: 'عرض',
                class: 'btn-info',
                icon: 'fas fa-eye',
                handler: (row) => showInvoiceDetails(row.data)
            },
            {
                label: 'طباعة',
                class: 'btn-success',
                icon: 'fas fa-print',
                handler: (row) => printInvoice(row.data)
            },
            {
                label: 'حذف',
                class: 'btn-danger',
                icon: 'fas fa-trash',
                handler: (row) => deleteInvoice(row.data.id)
            }
        ]
    );
    
    container.innerHTML = '';
    container.appendChild(table);
}

function showInvoiceDetails(invoice) {
    const itemsHtml = invoice.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatCurrency(item.price * item.quantity)}</td>
        </tr>
    `).join('');
    
    const content = `
        <div>
            <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>التاريخ:</strong> ${formatDate(invoice.date)} - ${formatTime(invoice.date)}</p>
            
            <table style="width: 100%; margin-top: 20px;">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: left;">
                <p style="font-size: 18px; font-weight: bold;">
                    الإجمالي: ${formatCurrency(invoice.total)}
                </p>
            </div>
        </div>
    `;
    
    createModal('تفاصيل الفاتورة', content, [
        { label: 'إغلاق', class: 'btn-secondary' }
    ]);
}

function deleteInvoice(invoiceId) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        const filtered = invoices.filter(inv => inv.id !== invoiceId);
        
        LocalDB.save(LocalDB.KEYS.INVOICES, filtered);
        showNotification('تم حذف الفاتورة بنجاح', 'success');
        renderInvoicesTable();
        updateDashboardStats();
    }
}
