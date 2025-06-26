const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;

function createWindow() {
  console.log('🛠 Launching Electron app...');

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    console.log('⚙️ Development mode: loading Vite server');
    win.loadURL('http://localhost:5173');
  } else {
    console.log('🚀 Production mode: starting backend...');

    const backend = spawn('node', ['server/index.js'], {
      cwd: path.join(__dirname),
      shell: true,
      stdio: 'inherit',
    });

    backend.on('error', (err) => {
      console.error('❌ Failed to start backend:', err);
    });

    backend.on('exit', (code) => {
      console.error(`❌ Backend exited with code ${code}`);
    });

    // Wait a moment for backend to start before loading frontend
    setTimeout(() => {
      console.log('📦 Loading built frontend...');
      win.loadFile(path.join(__dirname, 'client/dist/index.html'));

      win.webContents.on('did-fail-load', (e, code, desc) => {
        console.error('❌ FAILED TO LOAD FRONTEND:', code, desc);
      });

      win.webContents.openDevTools();
    }, 1000);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});