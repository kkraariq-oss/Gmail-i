const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'src/assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    autoHideMenuBar: false,
    frame: true
  });

  mainWindow.loadFile('index.html');
  
  // فتح أدوات المطور في وضع التطوير
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// معالجة الطباعة
ipcMain.on('print-receipt', (event, printData) => {
  const printerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  printerWindow.loadFile('pages/print template.html');
  
  printerWindow.webContents.on('did-finish-load', () => {
    printerWindow.webContents.send('print-data', printData);
    
    setTimeout(() => {
      printerWindow.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: printData.printerName || ''
      }, (success, errorType) => {
        if (!success) {
          console.log('Print failed:', errorType);
        }
        printerWindow.close();
      });
    }, 500);
  });
});

// حفظ الملفات
ipcMain.on('save-file', (event, { filePath, data }) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    event.reply('file-saved', { success: true });
  } catch (error) {
    event.reply('file-saved', { success: false, error: error.message });
  }
});

// قراءة الملفات
ipcMain.on('read-file', (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    event.reply('file-read', { success: true, data: JSON.parse(data) });
  } catch (error) {
    event.reply('file-read', { success: false, error: error.message });
  }
});
