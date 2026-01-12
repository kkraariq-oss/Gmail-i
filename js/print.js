// نظام الطباعة
function printInvoice(invoice) {
    const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (!printWindow) {
        showNotification('فشل فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة', 'error');
        return;
    }
    
    const itemsHtml = invoice.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatCurrency(item.price * item.quantity)}</td>
        </tr>
    `).join('');
    
    const fontSize = settings.fontSize === 'small' ? '10px' : 
                    settings.fontSize === 'large' ? '14px' : '12px';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة رقم ${invoice.invoiceNumber}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    padding: 10px;
                    font-size: ${fontSize};
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .header h1 {
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .header p {
                    margin: 3px 0;
                    font-size: 11px;
                }
                .invoice-info {
                    margin: 15px 0;
                    padding: 10px;
                    border-top: 2px dashed #000;
                    border-bottom: 2px dashed #000;
                }
                .invoice-info p {
                    margin: 3px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                th, td {
                    text-align: right;
                    padding: 5px 2px;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    font-weight: bold;
                }
                .total {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #000;
                    text-align: left;
                    font-size: 16px;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                }
                @media print {
                    body {
                        width: 80mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${settings.restaurantName || 'مطعم الوجبات السريعة'}</h1>
                <p>${settings.restaurantPhone || ''}</p>
                <p>${settings.restaurantAddress || ''}</p>
                ${settings.invoiceHeader ? `<p><strong>${settings.invoiceHeader}</strong></p>` : ''}
            </div>
            
            <div class="invoice-info">
                <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>التاريخ:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>الوقت:</strong> ${formatTime(invoice.date)}</p>
                <p><strong>الكاشير:</strong> ${invoice.user || 'النظام'}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>الصنف</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total">
                الإجمالي: ${formatCurrency(invoice.total)}
            </div>
            
            <div class="footer">
                <p>${settings.invoiceFooter || 'شكراً لزيارتكم'}</p>
                <p>${settings.restaurantName || ''}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // الطباعة التلقائية
    if (settings.printAutomatically) {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
}
