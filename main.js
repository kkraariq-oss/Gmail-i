const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// الطابعات الحرارية
const thermalPrinters = {
    kitchen: null,
    cashier: null
};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1280,
        minHeight: 720,
        title: 'نظام إدارة المطعم',
        icon: path.join(__dirname, 'assets/icon.png'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        backgroundColor: '#f5f7fa',
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.maximize();
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ===== تحكم النافذة من الواجهة المخصصة =====
ipcMain.on('window-control', (event, { action }) => {
    if (!mainWindow) return;
    
    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
        case 'close':
            mainWindow.close();
            break;
    }
});

// ===== تحكم النافذة =====
ipcMain.on('window-control', (event, { action }) => {
    if (!mainWindow) return;
    
    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
        case 'close':
            mainWindow.close();
            break;
    }
});

// ===== نظام الطباعة الحرارية =====

ipcMain.handle('get-printers', async () => {
    try {
        const printers = await mainWindow.webContents.getPrintersAsync();
        return { success: true, printers };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-printers', async (event, config) => {
    try {
        thermalPrinters.kitchen = config.kitchen;
        thermalPrinters.cashier = config.cashier;
        
        const settingsPath = path.join(app.getPath('userData'), 'printer-settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify(thermalPrinters, null, 2));
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-printers', async () => {
    try {
        const settingsPath = path.join(app.getPath('userData'), 'printer-settings.json');
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            const config = JSON.parse(data);
            thermalPrinters.kitchen = config.kitchen;
            thermalPrinters.cashier = config.cashier;
        }
        return { success: true, printers: thermalPrinters };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// طباعة حرارية صامتة
ipcMain.handle('thermal-print', async (event, data) => {
    try {
        const { type, content } = data;
        const printerName = thermalPrinters[type];
        
        if (!printerName) {
            return { success: false, error: `طابعة ${type} غير محددة` };
        }

        const printWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

        const printOptions = {
            silent: true,
            printBackground: false,
            deviceName: printerName,
            margins: {
                marginType: 'none'
            }
        };

        await printWindow.webContents.print(printOptions);
        printWindow.close();

        return { success: true };
    } catch (error) {
        console.error('Print error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('print-preview', async (event, content) => {
    try {
        const printWindow = new BrowserWindow({
            width: 800,
            height: 1000,
            title: 'معاينة الطباعة',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);
        printWindow.webContents.print();

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ===== إدارة الملفات =====

ipcMain.handle('export-data', async (event, data) => {
    try {
        const { defaultPath, filters, content } = data;
        
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath,
            filters: filters || [
                { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePath) {
            fs.writeFileSync(result.filePath, content);
            return { success: true, path: result.filePath };
        }

        return { success: false, error: 'تم الإلغاء' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-data', async (event, filters) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: filters || [
                { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const content = fs.readFileSync(result.filePaths[0], 'utf8');
            return { success: true, content, path: result.filePaths[0] };
        }

        return { success: false, error: 'تم الإلغاء' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ===== قاعدة البيانات =====

ipcMain.handle('save-database', async (event, data) => {
    try {
        const dbPath = path.join(app.getPath('userData'), 'restaurant-db.json');
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return { success: true, path: dbPath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-database', async () => {
    try {
        const dbPath = path.join(app.getPath('userData'), 'restaurant-db.json');
        if (fs.existsSync(dbPath)) {
            const content = fs.readFileSync(dbPath, 'utf8');
            return { success: true, data: JSON.parse(content) };
        }
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-info', async () => {
    return {
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        userDataPath: app.getPath('userData')
    };
});
