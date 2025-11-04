const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
  });

  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for data storage
const dataPath = path.join(app.getPath('userData'), 'mental-health-data.json');

ipcMain.handle('save-entry', async (event, entry) => {
  try {
    let data = [];
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    data.push(entry);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-entries', async () => {
  try {
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return { success: true, data };
    }
    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}); 