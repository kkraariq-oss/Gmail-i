// إدارة الموظفين
function loadEmployeesPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header" style="display: flex; justify-content: space-between;">
                <h2><i class="fas fa-user-tie"></i> إدارة الموظفين</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="showAddEmployeeModal()">
                        <i class="fas fa-plus"></i> إضافة موظف
                    </button>
                    <button class="btn btn-secondary" onclick="showHomePage()">
                        <i class="fas fa-home"></i> العودة
                    </button>
                </div>
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <label>البحث</label>
                    <input type="text" id="searchEmployees" class="form-control" placeholder="ابحث بالاسم...">
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" id="employeesTableContainer"></div>
            </div>
        </div>
    `;
    
    renderEmployeesTable();
    document.getElementById('searchEmployees').addEventListener('input', renderEmployeesTable);
}

function renderEmployeesTable() {
    let employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    const container = document.getElementById('employeesTableContainer');
    
    const searchTerm = document.getElementById('searchEmployees')?.value || '';
    if (searchTerm) {
        employees = searchArray(employees, searchTerm, ['name', 'phone']);
    }
    
    if (employees.length === 0) {
        container.innerHTML = '<p class="text-center">لا يوجد موظفين</p>';
        return;
    }
    
    const rows = employees.map(emp => ({
        name: emp.name,
        phone: emp.phone,
        salary: formatCurrency(emp.salary),
        hireDate: formatDate(emp.hireDate),
        data: emp
    }));
    
    const table = createTable(
        ['الاسم', 'الهاتف', 'الراتب', 'تاريخ التوظيف'],
        rows,
        [
            {
                label: 'عرض',
                class: 'btn-info',
                icon: 'fas fa-eye',
                handler: (row) => showEmployeeDetails(row.data)
            },
            {
                label: 'تعديل',
                class: 'btn-warning',
                icon: 'fas fa-edit',
                handler: (row) => showEditEmployeeModal(row.data)
            },
            {
                label: 'حذف',
                class: 'btn-danger',
                icon: 'fas fa-trash',
                handler: (row) => deleteEmployee(row.data.id)
            }
        ]
    );
    
    container.innerHTML = '';
    container.appendChild(table);
}

function showAddEmployeeModal() {
    const content = `
        <form id="addEmployeeForm">
            <div class="form-group">
                <label>اسم الموظف</label>
                <input type="text" id="empName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>الهاتف</label>
                <input type="tel" id="empPhone" class="form-control" required>
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" id="empAddress" class="form-control" required>
            </div>
            <div class="form-group">
                <label>الراتب</label>
                <input type="number" id="empSalary" class="form-control" min="0" required>
            </div>
            <div class="form-group">
                <label>تاريخ التوظيف</label>
                <input type="date" id="empHireDate" class="form-control" required>
            </div>
        </form>
    `;
    
    createModal('إضافة موظف', content, [
        { label: 'إلغاء', class: 'btn-secondary' },
        { 
            label: 'إضافة', 
            class: 'btn-success', 
            handler: addEmployee,
            closeOnClick: false
        }
    ]);
}

function addEmployee() {
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    
    const newEmployee = {
        id: generateId(),
        name: document.getElementById('empName').value,
        phone: document.getElementById('empPhone').value,
        address: document.getElementById('empAddress').value,
        salary: parseFloat(document.getElementById('empSalary').value),
        hireDate: document.getElementById('empHireDate').value,
        createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    LocalDB.save(LocalDB.KEYS.EMPLOYEES, employees);
    
    showNotification('تم إضافة الموظف بنجاح', 'success');
    renderEmployeesTable();
    updateDashboardStats();
    
    const modal = document.getElementById('dynamicModal');
    if (modal) modal.remove();
}

function showEmployeeDetails(employee) {
    const content = `
        <div style="padding: 20px;">
            <p><strong>الاسم:</strong> ${employee.name}</p>
            <p><strong>الهاتف:</strong> ${employee.phone}</p>
            <p><strong>العنوان:</strong> ${employee.address}</p>
            <p><strong>الراتب:</strong> ${formatCurrency(employee.salary)}</p>
            <p><strong>تاريخ التوظيف:</strong> ${formatDate(employee.hireDate)}</p>
        </div>
    `;
    
    createModal('تفاصيل الموظف', content, [
        { label: 'إغلاق', class: 'btn-secondary' }
    ]);
}

function showEditEmployeeModal(employee) {
    const content = `
        <form id="editEmployeeForm">
            <div class="form-group">
                <label>اسم الموظف</label>
                <input type="text" id="empName" class="form-control" value="${employee.name}" required>
            </div>
            <div class="form-group">
                <label>الهاتف</label>
                <input type="tel" id="empPhone" class="form-control" value="${employee.phone}" required>
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" id="empAddress" class="form-control" value="${employee.address}" required>
            </div>
            <div class="form-group">
                <label>الراتب</label>
                <input type="number" id="empSalary" class="form-control" value="${employee.salary}" min="0" required>
            </div>
            <div class="form-group">
                <label>تاريخ التوظيف</label>
                <input type="date" id="empHireDate" class="form-control" value="${employee.hireDate}" required>
            </div>
        </form>
    `;
    
    createModal('تعديل موظف', content, [
        { label: 'إلغاء', class: 'btn-secondary' },
        { 
            label: 'حفظ', 
            class: 'btn-success', 
            handler: () => updateEmployee(employee.id),
            closeOnClick: false
        }
    ]);
}

function updateEmployee(employeeId) {
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index !== -1) {
        employees[index] = {
            ...employees[index],
            name: document.getElementById('empName').value,
            phone: document.getElementById('empPhone').value,
            address: document.getElementById('empAddress').value,
            salary: parseFloat(document.getElementById('empSalary').value),
            hireDate: document.getElementById('empHireDate').value,
            updatedAt: new Date().toISOString()
        };
        
        LocalDB.save(LocalDB.KEYS.EMPLOYEES, employees);
        showNotification('تم تحديث الموظف بنجاح', 'success');
        renderEmployeesTable();
        
        const modal = document.getElementById('dynamicModal');
        if (modal) modal.remove();
    }
}

function deleteEmployee(employeeId) {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
        const filtered = employees.filter(e => e.id !== employeeId);
        
        LocalDB.save(LocalDB.KEYS.EMPLOYEES, filtered);
        showNotification('تم حذف الموظف بنجاح', 'success');
        renderEmployeesTable();
        updateDashboardStats();
    }
}
