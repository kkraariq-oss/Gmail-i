// التقارير
function loadReportsPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> التقارير والإحصائيات</h2>
                <button class="btn btn-secondary" onclick="showHomePage()">
                    <i class="fas fa-home"></i> العودة
                </button>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-dollar-sign"></i> تقرير المبيعات</h3>
                    </div>
                    <div class="card-body" id="salesReport"></div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill"></i> تقرير المصاريف</h3>
                    </div>
                    <div class="card-body" id="expensesReport"></div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> تقرير الموظفين</h3>
                    </div>
                    <div class="card-body" id="employeesReport"></div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-box"></i> تقرير المنتجات</h3>
                    </div>
                    <div class="card-body" id="productsReport"></div>
                </div>
            </div>
        </div>
    `;
    
    generateReports();
}

function generateReports() {
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    const expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    
    // تقرير المبيعات
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const salesReportEl = document.getElementById('salesReport');
    if (salesReportEl) {
        salesReportEl.innerHTML = `
            <p><strong>إجمالي الفواتير:</strong> ${invoices.length}</p>
            <p><strong>إجمالي المبيعات:</strong> ${formatCurrency(totalSales)}</p>
        `;
    }
    
    // تقرير المصاريف
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesReportEl = document.getElementById('expensesReport');
    if (expensesReportEl) {
        expensesReportEl.innerHTML = `
            <p><strong>عدد المصاريف:</strong> ${expenses.length}</p>
            <p><strong>إجمالي المصاريف:</strong> ${formatCurrency(totalExpenses)}</p>
        `;
    }
    
    // تقرير الموظفين
    const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const employeesReportEl = document.getElementById('employeesReport');
    if (employeesReportEl) {
        employeesReportEl.innerHTML = `
            <p><strong>عدد الموظفين:</strong> ${employees.length}</p>
            <p><strong>إجمالي الرواتب:</strong> ${formatCurrency(totalSalaries)}</p>
        `;
    }
    
    // تقرير المنتجات
    const productsReportEl = document.getElementById('productsReport');
    if (productsReportEl) {
        productsReportEl.innerHTML = `
            <p><strong>عدد المنتجات:</strong> ${products.length}</p>
        `;
    }
}
