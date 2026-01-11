// الإعدادات
function loadSettingsPage(container) {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    
    container.innerHTML = `
        <div class="page active">
            <div class="page-header">
                <h2><i class="fas fa-cog"></i> الإعدادات</h2>
                <button class="btn btn-secondary" onclick="showHomePage()">
                    <i class="fas fa-home"></i> العودة
                </button>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-store"></i> معلومات المطعم</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>اسم المطعم</label>
                            <input type="text" id="restaurantName" class="form-control" value="${settings.restaurantName || ''}">
                        </div>
                        <div class="form-group">
                            <label>رقم الهاتف</label>
                            <input type="tel" id="restaurantPhone" class="form-control" value="${settings.restaurantPhone || ''}">
                        </div>
                        <div class="form-group">
                            <label>العنوان</label>
                            <input type="text" id="restaurantAddress" class="form-control" value="${settings.restaurantAddress || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-language"></i> اللغة والعملة</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>اللغة</label>
                            <select id="language" class="form-control">
                                <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="ku" ${settings.language === 'ku' ? 'selected' : ''}>کوردی</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>العملة</label>
                            <select id="currency" class="form-control">
                                <option value="IQD" ${settings.currency === 'IQD' ? 'selected' : ''}>دينار عراقي (IQD)</option>
                                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>دولار (USD)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-print"></i> إعدادات الطباعة</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>نوع الطابعة</label>
                            <select id="printerType" class="form-control">
                                <option value="thermal" ${settings.printerType === 'thermal' ? 'selected' : ''}>حرارية</option>
                                <option value="regular" ${settings.printerType === 'regular' ? 'selected' : ''}>عادية</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="printAutomatically" ${settings.printAutomatically ? 'checked' : ''} style="width: 20px; height: 20px;">
                                <span>الطباعة التلقائية</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="printKitchenCopy" ${settings.printKitchenCopy ? 'checked' : ''} style="width: 20px; height: 20px;">
                                <span>طباعة نسخة المطبخ</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="printCashierCopy" ${settings.printCashierCopy ? 'checked' : ''} style="width: 20px; height: 20px;">
                                <span>طباعة نسخة الكاشير</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-receipt"></i> تخصيص الفاتورة</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>عنوان رأس الفاتورة</label>
                            <input type="text" id="invoiceHeader" class="form-control" value="${settings.invoiceHeader || ''}">
                        </div>
                        <div class="form-group">
                            <label>رسالة تذييل الفاتورة</label>
                            <input type="text" id="invoiceFooter" class="form-control" value="${settings.invoiceFooter || ''}">
                        </div>
                        <div class="form-group">
                            <label>حجم الخط</label>
                            <select id="fontSize" class="form-control">
                                <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>صغير</option>
                                <option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>متوسط</option>
                                <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>كبير</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <button class="btn btn-success btn-lg" onclick="saveSettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
            </div>
        </div>
    `;
}

function saveSettings() {
    const settings = {
        restaurantName: document.getElementById('restaurantName').value,
        restaurantPhone: document.getElementById('restaurantPhone').value,
        restaurantAddress: document.getElementById('restaurantAddress').value,
        language: document.getElementById('language').value,
        currency: document.getElementById('currency').value,
        printerType: document.getElementById('printerType').value,
        printAutomatically: document.getElementById('printAutomatically').checked,
        printKitchenCopy: document.getElementById('printKitchenCopy').checked,
        printCashierCopy: document.getElementById('printCashierCopy').checked,
        invoiceHeader: document.getElementById('invoiceHeader').value,
        invoiceFooter: document.getElementById('invoiceFooter').value,
        fontSize: document.getElementById('fontSize').value
    };
    
    // الحفاظ على الإعدادات الأخرى
    const currentSettings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    const mergedSettings = { ...currentSettings, ...settings };
    
    LocalDB.save(LocalDB.KEYS.SETTINGS, mergedSettings);
    showNotification('تم حفظ الإعدادات بنجاح', 'success');
}
