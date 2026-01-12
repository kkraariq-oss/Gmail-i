// إدارة المصاريف
function loadExpensesPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header" style="display: flex; justify-content: space-between;">
                <h2><i class="fas fa-money-bill-wave"></i> إدارة المصاريف</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="showAddExpenseModal()">
                        <i class="fas fa-plus"></i> إضافة مصروف
                    </button>
                    <button class="btn btn-secondary" onclick="showHomePage()">
                        <i class="fas fa-home"></i> العودة
                    </button>
                </div>
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <label>البحث</label>
                    <input type="text" id="searchExpenses" class="form-control">
                </div>
                <div class="filter-group">
                    <label>من تاريخ</label>
                    <input type="date" id="filterDateFrom" class="form-control">
                </div>
                <div class="filter-group">
                    <label>إلى تاريخ</label>
                    <input type="date" id="filterDateTo" class="form-control">
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" id="expensesTableContainer"></div>
            </div>
        </div>
    `;
    
    renderExpensesTable();
    document.getElementById('searchExpenses').addEventListener('input', renderExpensesTable);
    document.getElementById('filterDateFrom').addEventListener('change', renderExpensesTable);
    document.getElementById('filterDateTo').addEventListener('change', renderExpensesTable);
}

function renderExpensesTable() {
    let expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
    const container = document.getElementById('expensesTableContainer');
    
    const searchTerm = document.getElementById('searchExpenses')?.value || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value || '';
    const dateTo = document.getElementById('filterDateTo')?.value || '';
    
    if (searchTerm) {
        expenses = searchArray(expenses, searchTerm, ['title', 'description']);
    }
    
    if (dateFrom || dateTo) {
        expenses = filterByDate(expenses, 'date', dateFrom, dateTo);
    }
    
    if (expenses.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد مصاريف</p>';
        return;
    }
    
    const rows = expenses.map(exp => ({
        title: exp.title,
        amount: formatCurrency(exp.amount),
        date: formatDate(exp.date),
        description: exp.description || '-',
        data: exp
    }));
    
    const table = createTable(
        ['العنوان', 'المبلغ', 'التاريخ', 'الوصف'],
        rows,
        [
            {
                label: 'حذف',
                class: 'btn-danger',
                icon: 'fas fa-trash',
                handler: (row) => deleteExpense(row.data.id)
            }
        ]
    );
    
    container.innerHTML = '';
    container.appendChild(table);
}

function showAddExpenseModal() {
    const content = `
        <form id="addExpenseForm">
            <div class="form-group">
                <label>عنوان المصروف</label>
                <input type="text" id="expTitle" class="form-control" required>
            </div>
            <div class="form-group">
                <label>المبلغ</label>
                <input type="number" id="expAmount" class="form-control" min="0" required>
            </div>
            <div class="form-group">
                <label>التاريخ</label>
                <input type="date" id="expDate" class="form-control" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea id="expDescription" class="form-control" rows="3"></textarea>
            </div>
        </form>
    `;
    
    createModal('إضافة مصروف', content, [
        { label: 'إلغاء', class: 'btn-secondary' },
        {
            label: 'إضافة',
            class: 'btn-success',
            handler: addExpense,
            closeOnClick: false
        }
    ]);
}

function addExpense() {
    const expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
    
    const newExpense = {
        id: generateId(),
        title: document.getElementById('expTitle').value,
        amount: parseFloat(document.getElementById('expAmount').value),
        date: document.getElementById('expDate').value,
        description: document.getElementById('expDescription').value,
        createdAt: new Date().toISOString()
    };
    
    expenses.unshift(newExpense);
    LocalDB.save(LocalDB.KEYS.EXPENSES, expenses);
    
    showNotification('تم إضافة المصروف بنجاح', 'success');
    renderExpensesTable();
    
    const modal = document.getElementById('dynamicModal');
    if (modal) modal.remove();
}

function deleteExpense(expenseId) {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
        const expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
        const filtered = expenses.filter(e => e.id !== expenseId);
        
        LocalDB.save(LocalDB.KEYS.EXPENSES, filtered);
        showNotification('تم حذف المصروف بنجاح', 'success');
        renderExpensesTable();
    }
}
