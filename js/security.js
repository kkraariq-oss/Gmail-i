// نظام الحماية والصلاحيات
function loadSecurityPage(container) {
    if (currentUser.role !== 'admin') {
        showNotification('ليس لديك صلاحية للوصول لهذا القسم', 'error');
        showHomePage();
        return;
    }
    
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-shield-alt"></i> نظام الحماية والصلاحيات</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="showAddUserModal()">
                        <i class="fas fa-user-plus"></i> إضافة مستخدم
                    </button>
                    <button class="btn btn-secondary" onclick="showHomePage()">
                        <i class="fas fa-home"></i> العودة
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" id="usersTableContainer"></div>
            </div>
        </div>
    `;
    
    renderUsersTable();
}

function renderUsersTable() {
    const users = getAllUsers();
    const container = document.getElementById('usersTableContainer');
    
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-center">لا يوجد مستخدمين</p>';
        return;
    }
    
    const rows = users.map(user => ({
        username: user.username,
        fullName: user.fullName,
        role: user.role === 'admin' ? 'مدير' : 'مستخدم',
        data: user
    }));
    
    const table = createTable(
        ['اسم المستخدم', 'الاسم الكامل', 'الدور'],
        rows,
        [
            {
                label: 'تعديل',
                class: 'btn-warning',
                icon: 'fas fa-edit',
                handler: (row) => showEditUserModal(row.data)
            },
            {
                label: 'حذف',
                class: 'btn-danger',
                icon: 'fas fa-trash',
                handler: (row) => {
                    const result = deleteUser(row.data.id);
                    if (result.success) {
                        showNotification(result.message, 'success');
                        renderUsersTable();
                    } else {
                        showNotification(result.message, 'error');
                    }
                }
            }
        ]
    );
    
    container.innerHTML = '';
    container.appendChild(table);
}

function showAddUserModal() {
    const content = `
        <form id="addUserForm">
            <div class="form-group">
                <label>اسم المستخدم</label>
                <input type="text" id="newUsername" class="form-control" required>
            </div>
            <div class="form-group">
                <label>الاسم الكامل</label>
                <input type="text" id="newFullName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور</label>
                <input type="password" id="newPassword" class="form-control" required>
            </div>
            <div class="form-group">
                <label>الدور</label>
                <select id="newRole" class="form-control" required>
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                </select>
            </div>
        </form>
    `;
    
    createModal('إضافة مستخدم', content, [
        { label: 'إلغاء', class: 'btn-secondary' },
        {
            label: 'إضافة',
            class: 'btn-success',
            handler: () => {
                const result = addUser({
                    username: document.getElementById('newUsername').value,
                    fullName: document.getElementById('newFullName').value,
                    password: document.getElementById('newPassword').value,
                    role: document.getElementById('newRole').value,
                    permissions: {
                        pos: true,
                        products: true,
                        employees: true,
                        expenses: true,
                        reports: true,
                        invoices: true,
                        backup: true,
                        security: false,
                        settings: true
                    }
                });
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    renderUsersTable();
                    const modal = document.getElementById('dynamicModal');
                    if (modal) modal.remove();
                } else {
                    showNotification(result.message, 'error');
                }
            },
            closeOnClick: false
        }
    ]);
}

function showEditUserModal(user) {
    const content = `
        <form id="editUserForm">
            <div class="form-group">
                <label>الاسم الكامل</label>
                <input type="text" id="editFullName" class="form-control" value="${user.fullName}" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</label>
                <input type="password" id="editPassword" class="form-control">
            </div>
            <div class="form-group">
                <label>الدور</label>
                <select id="editRole" class="form-control" required>
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير</option>
                </select>
            </div>
        </form>
    `;
    
    createModal('تعديل مستخدم', content, [
        { label: 'إلغاء', class: 'btn-secondary' },
        {
            label: 'حفظ',
            class: 'btn-success',
            handler: () => {
                const updateData = {
                    fullName: document.getElementById('editFullName').value,
                    role: document.getElementById('editRole').value
                };
                
                const newPassword = document.getElementById('editPassword').value;
                if (newPassword) {
                    updateData.password = newPassword;
                }
                
                const result = updateUser(user.id, updateData);
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    renderUsersTable();
                    const modal = document.getElementById('dynamicModal');
                    if (modal) modal.remove();
                } else {
                    showNotification(result.message, 'error');
                }
            },
            closeOnClick: false
        }
    ]);
}
