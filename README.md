# partdb
This system deals with creating a system to have the part numbers in the database and employees are able to look it up by part number or name, and it tell them what the location is.



# PARTDB – Client (Frontend)

This is the frontend portion of the PARTDB project built with **React**, **Vite**, and **Tailwind CSS**.

---

## 📁 Project Structure

```
client/
├── public/               # Static assets (e.g., logo.png)
├── src/
│   ├── assets/           # Image assets used in components
│   ├── components/       # Reusable React components
│   │   └── SplashScreen.jsx
│   ├── App.jsx           # Main application component
│   ├── index.css         # Tailwind CSS and base styles
│   └── main.jsx          # App entry point
├── index.html            # HTML template used by Vite
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS config for Tailwind
└── vite.config.js        # Vite project config
```

---

## 🚀 Features

- Tailwind CSS styling
- Splash screen on startup
- Part search with pagination
- Responsive layout
- Express + PostgreSQL backend integration

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173)

---

## 📦 Build

```bash
npm run build
```

---

## 📂 Deployment Note

Make sure your logo image is placed in `client/public/logo.png` for the splash screen to render correctly.

---