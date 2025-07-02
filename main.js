// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let win;

function createWindow() {
  if (win) return;

  console.log('🛠 Launching Electron app...');

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    console.log('⚙️ Development mode: loading Vite server');
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    console.log('🚀 Production mode: bootstrapping backend…');

    // 1️⃣ Load your production env
    require('dotenv').config({
      path: path.join(__dirname, 'server', 'env.production'),
    });

    // 2️⃣ Start your Express app _in-process_
    require(path.join(__dirname, 'server', 'index.js'));

    // 3️⃣ Finally load the built frontend
    win.loadFile(path.join(__dirname, 'client/dist/index.html'));
  }
}

app.whenReady().then(createWindow).catch(console.error);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});