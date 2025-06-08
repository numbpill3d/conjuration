const { contextBridge, ipcRenderer } = require('electron')

// Expose IPC functionality to renderer process
contextBridge.exposeInMainWorld('voidAPI', {
  // File operations
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  openProject: () => ipcRenderer.invoke('open-project'),
  exportGif: (gifData) => ipcRenderer.invoke('export-gif', gifData),
  exportPng: (pngDataUrl) => ipcRenderer.invoke('export-png', pngDataUrl),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // System information
  getPlatform: () => process.platform

  // Add more API methods as needed
})
