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
- [License](#license)

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
## 1) Clone
  git clone https://github.com/Vien-Trieu/partdb.git
  cd partdb
## 2) Install dependencies
  npm install
## 3) Configure env
  Create a .env file (see Environment Variables).
## 4) Start backend (first)
  # from project root (or /server if you split it later)
  node index.js
## 5) Start frontend
  # in project root or /client
  npm run dev
  # Vite will print the local URL, usually:
  # http://localhost:5173
```
## Environment Variables
  Create a .env in the project root (or client/.env if you prefer). The client reads:
  VITE_API_BASE=http://localhost:3001
  VITE_API_BASE – Base URL the frontend uses to talk to the backend.
  If you deploy the backend elsewhere, update this value accordingly.
Available Scripts
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
## Development Notes

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
  
 ## Roadmap
  
  Persist search query across navigations/windows
  
  Part detail view with back-to-list navigation
  
  Electron packaging instructions and backend bundling notes
  
  Optional auth / PIN-protected actions with server-side enforcement
  
  CI for lint/build/test
