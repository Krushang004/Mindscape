const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  onNewEntry: (callback) => ipcRenderer.on('new-entry', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
}); 