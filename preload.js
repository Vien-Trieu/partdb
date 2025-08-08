// preload.js
const { contextBridge } = require('electron');

// Only expose safe Electron APIs if needed
contextBridge.exposeInMainWorld('api', {
  // You can expose custom secure APIs here later if needed
});
