/**
 * VoidAPI - Interface for Electron IPC communication
 */
const { ipcRenderer } = require('electron');

const voidAPI = {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  
  maximizeWindow: () => new Promise((resolve) => {
    ipcRenderer.send('maximize-window');
    ipcRenderer.once('maximize-reply', (_, result) => resolve(result));
  }),
  
  closeWindow: () => ipcRenderer.send('close-window'),
  
  openProject: () => new Promise((resolve) => {
    ipcRenderer.send('open-project');
    ipcRenderer.once('open-project-reply', (_, result) => resolve(result));
  }),
  
  saveProject: (projectData) => new Promise((resolve) => {
    ipcRenderer.send('save-project', projectData);
    ipcRenderer.once('save-project-reply', (_, result) => resolve(result));
  }),
  
  exportPng: (dataUrl) => new Promise((resolve) => {
    ipcRenderer.send('export-png', dataUrl);
    ipcRenderer.once('export-png-reply', (_, result) => resolve(result));
  }),
  
  exportGif: (gifData) => new Promise((resolve) => {
    ipcRenderer.send('export-gif', gifData);
    ipcRenderer.once('export-gif-reply', (_, result) => resolve(result));
  })
};

module.exports = voidAPI;