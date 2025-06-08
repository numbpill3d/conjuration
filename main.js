const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

// Keep a global reference of the window object
let mainWindow

// Custom file format
const VOID_FILE_EXTENSION = '.void'

function createWindow () {
  // Create the browser window with a dark background to avoid white flash
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    show: false, // Don't show until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    // Remove default frame for custom UI
    frame: false,
    // Set default icon
    icon: path.join(__dirname, 'src/assets/images/ui/icon.png')
  })

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'))

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // Window events
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App ready event
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for file operations
ipcMain.handle('save-project', async (event, projectData) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save VOIDSKETCH Project',
    defaultPath: 'untitled' + VOID_FILE_EXTENSION,
    filters: [{ name: 'VOIDSKETCH Files', extensions: ['void'] }]
  })

  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(projectData))
      return { success: true, filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: false }
})

ipcMain.handle('open-project', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open VOIDSKETCH Project',
    filters: [{ name: 'VOIDSKETCH Files', extensions: ['void'] }],
    properties: ['openFile']
  })

  if (filePaths && filePaths.length > 0) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf8')
      return { success: true, data: JSON.parse(data), filePath: filePaths[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: false }
})

ipcMain.handle('export-gif', async (event, gifData) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Animation as GIF',
    defaultPath: 'voidsketch-animation.gif',
    filters: [{ name: 'GIF Images', extensions: ['gif'] }]
  })

  if (filePath) {
    try {
      // Handle binary data from renderer
      const buffer = Buffer.from(gifData)
      fs.writeFileSync(filePath, buffer)
      return { success: true, filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: false }
})

ipcMain.handle('export-png', async (event, pngDataUrl) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Canvas as PNG',
    defaultPath: 'voidsketch-frame.png',
    filters: [{ name: 'PNG Images', extensions: ['png'] }]
  })

  if (filePath) {
    try {
      // Convert data URL to buffer
      const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      fs.writeFileSync(filePath, buffer)
      return { success: true, filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: false }
})

// Window control handlers
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize()
  return { success: true }
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
  return { success: true, isMaximized: mainWindow.isMaximized() }
})

ipcMain.handle('close-window', () => {
  mainWindow.close()
  return { success: true }
})
