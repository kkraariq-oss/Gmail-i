// النسخ الاحتياطي
function loadBackupPage(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-database"></i> النسخ الاحتياطي</h2>
                <button class="btn btn-secondary" onclick="showHomePage()">
                    <i class="fas fa-home"></i> العودة
                </button>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-download"></i> تصدير النسخة الاحتياطية</h3>
                    </div>
                    <div class="card-body">
                        <p>قم بتصدير جميع بيانات النظام إلى ملف احتياطي</p>
                        <button class="btn btn-success btn-block" onclick="exportBackup('json')">
                            <i class="fas fa-file-code"></i> تصدير JSON
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-upload"></i> استيراد النسخة الاحتياطية</h3>
                    </div>
                    <div class="card-body">
                        <p>استعادة البيانات من ملف احتياطي</p>
                        <input type="file" id="backupFile" accept=".json" style="display: none;">
                        <button class="btn btn-info btn-block" onclick="document.getElementById('backupFile').click()">
                            <i class="fas fa-file-import"></i> اختيار ملف
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-cloud"></i> النسخ الاحتياطي التلقائي</h3>
                    </div>
                    <div class="card-body">
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="autoBackup" style="width: 20px; height: 20px;">
                            <span>تفعيل النسخ الاحتياطي التلقائي إلى Firebase</span>
                        </label>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-trash-restore"></i> إعادة ضبط المصنع</h3>
                    </div>
                    <div class="card-body">
                        <p style="color: var(--danger-color);">تحذير: سيتم حذف جميع البيانات!</p>
                        <button class="btn btn-danger btn-block" onclick="factoryReset()">
                            <i class="fas fa-exclamation-triangle"></i> إعادة ضبط المصنع
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // تحميل حالة النسخ الاحتياطي التلقائي
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    const autoBackupCheckbox = document.getElementById('autoBackup');
    if (autoBackupCheckbox) {
        autoBackupCheckbox.checked = settings.autoBackupToCloud || false;
        autoBackupCheckbox.addEventListener('change', toggleAutoBackup);
    }
    
    // معالجة استيراد النسخة الاحتياطية
    const backupFileInput = document.getElementById('backupFile');
    if (backupFileInput) {
        backupFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await importBackup(file);
                    if (result.success) {
                        showNotification(result.message, 'success');
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        showNotification(result.error, 'error');
                    }
                } catch (error) {
                    showNotification('خطأ في استيراد النسخة الاحتياطية', 'error');
                }
            }
        });
    }
}

function toggleAutoBackup() {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    const autoBackupCheckbox = document.getElementById('autoBackup');
    
    settings.autoBackupToCloud = autoBackupCheckbox.checked;
    LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
    
    showNotification(
        settings.autoBackupToCloud ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إيقاف النسخ الاحتياطي التلقائي',
        'success'
    );
}

function factoryReset() {
    if (confirm('هل أنت متأكد من إعادة ضبط المصنع؟ سيتم حذف جميع البيانات!')) {
        if (confirm('تحذير أخير: لا يمكن التراجع عن هذه العملية!')) {
            LocalDB.clear();
            LocalDB.initializeDefaults();
            showNotification('تم إعادة ضبط المصنع بنجاح', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    }
}
