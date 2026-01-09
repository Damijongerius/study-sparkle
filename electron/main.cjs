// File: `electron/main.js`
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const startUrl = isDev
        ? process.env.ELECTRON_START_URL || 'http://localhost:5173'
        : `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;

    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
