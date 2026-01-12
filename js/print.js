// نظام الطباعة المتقدم - إصدار 3.0
// يدعم الطباعة المزدوجة (مطبخ + كاشير)

window.isElectron = window.isElectron || (typeof require !== 'undefined' && typeof require('electron') !== 'undefined');
window.ipcRenderer = window.ipcRenderer || undefined;

if (window.isElectron) {
    try {
        window.ipcRenderer = window.ipcRenderer || require('electron').ipcRenderer;
    } catch (error) {
        console.log('Running in browser mode');
    }
}

async function printInvoice(invoice, printerType = 'both') {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    
    // في بيئة Electron: استخدام الطباعة الحرارية الصامتة تلقائياً
    if (window.isElectron && window.ipcRenderer) {
        return await thermalPrint(invoice, printerType);
    }
    
    // في المتصفح: طباعة عادية
    return await browserPrint(invoice, printerType);
}

async function thermalPrint(invoice, printerType) {
    try {
        const types = printerType === 'both' ? ['kitchen', 'cashier'] : [printerType];
        
        for (const type of types) {
            const content = generateReceiptHTML(invoice, type);
            
            const result = await window.ipcRenderer.invoke('thermal-print', {
                type: type,
                content: content
            });
            
            if (!result.success) {
                console.error(`طباعة ${type} فشلت:`, result.error);
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Thermal print error:', error);
        return { success: false, error: error.message };
    }
}

async function browserPrint(invoice, printerType) {
    try {
        const types = printerType === 'both' ? ['cashier', 'kitchen'] : [printerType];
        
        for (const type of types) {
            const content = generateReceiptHTML(invoice, type);
            const printWindow = window.open('', '', 'height=600,width=400');
            
            printWindow.document.write(content);
            printWindow.document.close();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            printWindow.print();
            
            setTimeout(() => printWindow.close(), 1000);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Browser print error:', error);
        return { success: false, error: error.message };
    }
}

function generateReceiptHTML(invoice, type) {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    const isKitchen = type === 'kitchen';
    const title = isKitchen ? 'إيصال المطبخ' : 'إيصال الكاشير';
    
    let html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial; width: 80mm; padding: 10mm; font-size: 12pt; }
        .receipt-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
        .restaurant-name { font-size: 20pt; font-weight: bold; }
        .receipt-type { font-size: 16pt; font-weight: bold; padding: 8px; text-align: center; background: ${isKitchen ? '#f39c12' : '#2ecc71'}; color: white; margin: 10px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th { background: #f5f5f5; padding: 8px 5px; border-bottom: 2px solid #000; }
        .items-table td { padding: 8px 5px; border-bottom: 1px dashed #ccc; }
        .item-qty { font-size: ${isKitchen ? '20pt' : '16pt'}; font-weight: bold; background: ${isKitchen ? '#e74c3c' : '#f39c12'}; color: white; padding: 2px 8px; border-radius: 3px; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .receipt-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #000; }
    </style>
</head>
<body>
    <div class="receipt-header">
        <div class="restaurant-name">${settings.restaurantName || 'مطعم الوجبات السريعة'}</div>
        <div>${settings.restaurantPhone || '07XXXXXXXXX'}</div>
    </div>
    <div class="receipt-type">${title}</div>
    <div style="margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>رقم الفاتورة:</span><strong>#${invoice.invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>التاريخ:</span><strong>${formatDate(invoice.date)} ${formatTime(invoice.date)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>الكاشير:</span><strong>${invoice.user}</strong>
        </div>
    </div>
    <table class="items-table">
        <thead><tr>
            <th>الصنف</th>
            <th style="width: 60px; text-align: center;">العدد</th>
            ${!isKitchen ? '<th style="width: 80px; text-align: left;">السعر</th>' : ''}
        </tr></thead>
        <tbody>`;
    
    invoice.items.forEach(item => {
        html += `<tr>
            <td style="font-weight: bold;">${item.name}</td>
            <td style="text-align: center;"><span class="item-qty">${item.quantity}</span></td>
            ${!isKitchen ? `<td style="text-align: left;">${formatCurrency(item.price * item.quantity)}</td>` : ''}
        </tr>`;
    });
    
    html += `</tbody></table>`;
    
    if (!isKitchen) {
        html += `<div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 15px;">
            <div class="total-row"><span>المجموع الفرعي:</span><strong>${formatCurrency(invoice.subtotal)}</strong></div>
            <div class="total-row" style="font-size: 16pt; font-weight: bold; border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px;">
                <span>الإجمالي:</span><strong>${formatCurrency(invoice.total)}</strong>
            </div>
        </div>`;
    }
    
    html += `<div class="receipt-footer">
        <div style="font-weight: bold; margin: 10px 0;">${isKitchen ? 'طلب جديد - يرجى التحضير' : (settings.invoiceFooter || 'شكراً لزيارتكم')}</div>
        <div style="font-size: 10pt; color: #777;">${new Date().toLocaleString('ar-IQ')}</div>
    </div>
</body>
</html>`;
    
    return html;
}
