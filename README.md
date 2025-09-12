# PARTDB

A simple parts lookup system: store part numbers in a database so employees can search by number or name and instantly see the location.

---

## Table of Contents
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Development Notes](#development-notes)
- [API & Health Check](#api--health-check)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Screenshots
_Add screenshots or a short GIF here (e.g., the splash screen and a search)._

---

## Features
- 🔎 Fast part search (by name or number) with pagination  
- 🧭 Shows location info for each part  
- 📱 Responsive UI (Vite + React + Tailwind)  
- 🚀 Splash screen on startup  
- 🧩 Clean component structure  
- 🧰 Express backend (default port **3001**)  

---

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express  
**(Optional) Desktop:** Electron (files present for packaging)  
**Package Manager:** npm  

---

## Project Structure
  partdb/
  ├─ client/ # Frontend (Vite + React)
  │ ├─ public/ # Static assets (e.g., logo images)
  │ └─ src/
  │ ├─ assets/ # Image assets used by components
  │ ├─ components/
  │ │ └─ SplashScreen.jsx
  │ ├─ App.jsx # Main application component
  │ ├─ index.css # Tailwind base + app styles
  │ └─ main.jsx # Vite entry
  ├─ server/ # (If present) Express server source
  ├─ index.html # Frontend HTML template
  ├─ main.js # Electron main (optional)
  ├─ preload.js # Electron preload (optional)
  ├─ package.json
  └─ README.md

> The dev server typically runs at **http://localhost:5173** for the client and **http://localhost:3001** for the backend.

---

## Quick Start
```
 1) Clone
  git clone https://github.com/Vien-Trieu/partdb.git
  cd partdb
 2) Install dependencies
  npm install
 3) Configure env
  Create a .env file (see Environment Variables).
 4) Start backend (first)
  # from project root (or /server if you split it later)
  node index.js
 5) Start frontend
  # in project root or /client
  npm run dev
  # Vite will print the local URL, usually:
  # http://localhost:5173
```
## Environment Variables
```
  Create a .env in the project root (or client/.env if you prefer). The client reads:
  VITE_API_BASE=http://localhost:3001
  VITE_API_BASE – Base URL the frontend uses to talk to the backend.
  If you deploy the backend elsewhere, update this value accordingly.
```
Available Scripts
```
  From the project root:

  # Start the frontend dev server
  npm run dev

#   Build the frontend for production
  npm run build

  # Preview the built frontend locally
  npm run preview

  # (Optional) Start backend (simple)
  node index.js


  If you later split client/server into separate packages, document those scripts under each directory.
```
## Development Notes
```
  Start the backend first, then the Vite dev server, so the frontend can reach the API.
  
  Tailwind utility classes live in client/src/index.css and are configured via tailwind.config.js.
  
  If you add a custom logo for the splash, place it in client/public/ and import accordingly in your SplashScreen or App component.
  
  API & Health Check
  
  Health check: Visit the backend root in your browser or add a simple route like:
  
  // index.js (Express)
  app.get('/health', (_req, res) => res.json({ ok: true }));
  
  
  Then test: http://localhost:3001/health → { "ok": true }
  
  CORS: Ensure CORS is enabled for local dev so http://localhost:5173 can call http://localhost:3001.
  
  Troubleshooting
  
  Frontend can’t reach backend
  
  Verify VITE_API_BASE matches your backend URL.
  
  Confirm backend is running on :3001 and there are no port conflicts.
  
  Check CORS is enabled on the backend.
  
  Search state resets after switching tabs/windows
  
  (Known UX behavior) Consider persisting the query in the URL (e.g., ?q=...) or localStorage in a future update. See Roadmap
  .
  
  Tailwind styles not applying
  
  Ensure index.css is imported in main.jsx.
  
  Verify Tailwind config and content paths include your JSX/TSX files.
  ```
## Electron Packaging Guide
  ```
  This section explains how to run PARTDB as a desktop app using Electron, with options to bundle your Express backend so it works on machines without Node.js installed.
```
  ## A) Dev workflow with Electron
```
    1. Install Electron tooling
      npm install --save-dev electron electron-builder concurrently wait-on
    2. Add scripts (in package.json)
      {
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "dev:server": "node index.js",
        "dev:electron": "concurrently -k -n SERVER,FRONTEND,ELECTRON -c yellow,cyan,magenta \
          \"npm:dev:server\" \
          \"npm:dev\" \
          \"wait-on http://localhost:5173 && electron .\"",
        "dist": "vite build && electron-builder"
      }
    }
    3. Point Electron to Vite dev server (in main.js, dev mode)
      const { app, BrowserWindow } = require('electron');
      const path = require('path');
      
      function createWindow() {
        const win = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: { preload: path.join(__dirname, 'preload.js') }
        });
      
        const isDev = !app.isPackaged;
        if (isDev) {
          win.loadURL('http://localhost:5173');
          win.webContents.openDevTools({ mode: 'detach' });
        } else {
          // In production, load built index.html
          win.loadFile(path.join(__dirname, 'dist', 'index.html'));
        }
      }
      
      app.whenReady().then(createWindow);
      app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
      app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
Run dev desktop app:
  npm run dev:electron
```
  ## B) Production packaging (frontend only)
```
    1. Configure electron-builder (in package.json)
      {
      "name": "partdb",
      "version": "1.0.0",
      "main": "main.js",
      "build": {
        "appId": "com.yourcompany.partdb",
        "productName": "PartDB",
        "directories": { "output": "release" },
        "files": [
          "dist/**",
          "main.js",
          "preload.js",
          "index.js",
          "package.json"
        ],
        "asar": true,
        "win": { "target": ["nsis"] },
        "extraResources": []
      }
    }
    2. Build and package
      npm run dist
      # Output installer/exe in ./release
```
## In production, main.js uses win.loadFile(path.join(__dirname, 'dist', 'index.html')). Make sure npm run build has generated dist/.

  ## C) Bundle the Express backend (portable, no Node.js required)
    You have two options:

## Option C1 — Spawn Node to run index.js (requires Node on the target machine)
  Pros: simplest.
  Cons: target PCs must have Node.js installed.
  ```
  // In main.js
  const { spawn } = require('child_process');
  const path = require('path');
  let serverProcess;
  
  function startBackend() {
    const serverPath = path.join(__dirname, 'index.js');
    serverProcess = spawn(process.platform === 'win32' ? 'node.exe' : 'node', [serverPath], {
      cwd: __dirname,
      env: { ...process.env },
      stdio: 'inherit',
      shell: false
    });
  }
  app.whenReady().then(() => {
    startBackend();
    createWindow();
  });
  app.on('before-quit', () => { if (serverProcess) serverProcess.kill(); });
```
## Option C2 — Package backend to a single EXE with pkg (recommended)
  Pros: no Node.js needed on target; a single backend binary.
  Cons: slightly more setup; add binary to build artifacts.
```
    1. Install pkg and build backend binary
      npm install --save-dev pkg
      # Make sure index.js uses only supported pkg features.
      # Then create a Windows binary (example):
      npx pkg index.js --targets node18-win-x64 --output backend.exe
    2. Add the binary to your app build
      Place backend.exe in a folder, e.g., ./backend-bin/.
      Update electron-builder extraResources so it’s copied next to the app at runtime:
        {
          "build": {
            "extraResources": [
              { "from": "backend-bin/backend.exe", "to": "backend/backend.exe" },
              { "from": ".env", "to": "backend/.env", "filter": ["**/*"] }
            ]
          }
        }
    3. Spawn the packaged backend in production
      // In main.js
      const { app, BrowserWindow } = require('electron');
      const { spawn } = require('child_process');
      const path = require('path');
      
      let backendProc;
      
      function getBackendPath() {
        // When packaged, files in extraResources live under app.getAppPath()'s parent / resources
        const base = process.resourcesPath || path.join(__dirname);
        const exe = process.platform === 'win32' ? 'backend.exe' : 'backend'; // adjust if building mac/linux
        return path.join(base, 'backend', exe);
      }
      
      function startBackend() {
        const exePath = getBackendPath();
      
        backendProc = spawn(exePath, [], {
          cwd: path.dirname(exePath),
          env: { ...process.env }, // picks up backend/.env we copied
          stdio: 'inherit',
          shell: false
        });
      
        backendProc.on('exit', (code) => {
          console.log('Backend exited with code', code);
        });
      }
      
      function createWindow() {
        const win = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: { preload: path.join(__dirname, 'preload.js') }
        });
        const indexHtml = path.join(__dirname, 'dist', 'index.html');
        win.loadFile(indexHtml);
      }
      
      app.whenReady().then(() => {
        startBackend();      // start API first
        createWindow();      // load UI
      });
      app.on('before-quit', () => { if (backendProc) backendProc.kill(); });
    4. Point the client at the packaged API

    In production, your API will still listen on http://localhost:3001. Ensure your frontend uses:
      VITE_API_BASE=http://localhost:3001
      For dev/prod switching, keep VITE_API_BASE in .env files and build with the correct env.
```
## D) Notes & Tips
```
  Port conflicts: If another app already uses 3001, the backend won’t start. Consider making the port configurable via env (e.g., PORT=0 to auto-pick, then communicate the chosen port to the renderer via ipcMain or a config file).
  
  CORS: In production, CORS is typically not needed because the renderer and backend are local. You can still leave it enabled safely.
  
  Logging: In packaged apps, stdout/stderr go to system logs. You can also append logs to a file inside app.getPath('userData').
  
  Code signing (Windows/macOS): Recommended for smoother installs and fewer SmartScreen prompts (configure in electron-builder).
  
  Auto-update: If desired later, add electron-updater and a release feed.
```

 ## Roadmap
  ```
  Persist search query across navigations/windows
  
  Part detail view with back-to-list navigation
  
  Electron packaging instructions and backend bundling notes
  
  Optional auth / PIN-protected actions with server-side enforcement
  
  CI for lint/build/test
```
