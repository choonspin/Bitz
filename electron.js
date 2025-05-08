const { app, BrowserWindow } = require('electron');
const path = require('path');

// const isDev = require('electron-is-dev'); // Replaced with app.isPackaged
// const isDev = false; // Temporarily hardcoded for packaged app testing

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Bitz", // Set window title
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Be cautious with this in production
    },
  });

  // Load the Next.js app.
  let startUrl;
  if (!app.isPackaged) { // Development mode
    startUrl = 'http://localhost:3000'; // Default Next.js dev server URL
    mainWindow.webContents.openDevTools();
  } else { // Packaged mode
    startUrl = `file://${path.join(__dirname, 'out/index.html')}`; // Path to Next.js static export
    // mainWindow.webContents.openDevTools(); // Removed for production
  }

  mainWindow.loadURL(startUrl);

  // Open the DevTools - handled above based on mode
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
