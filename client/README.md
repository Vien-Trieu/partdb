PartsDB - React + Vite Application

Welcome to PartsDB, a modern, responsive React application powered by Vite for ultra-fast development and builds.

This project is designed as a scalable frontend for part lookup operations. It includes a custom splash screen animation, responsive layout, and componentized structure optimized for performance and usability.

🔧 Tech Stack
	•	React — UI library for building fast, dynamic user interfaces
	•	Vite — Lightning-fast dev server and build tool
	•	Tailwind CSS — Utility-first styling framework
	•	ESLint — Code linting and style enforcement

🚀 Features
	•	Smooth splash screen animation on load
	•	Responsive and accessible UI for part lookup
	•	Pagination support and search filters
	•	Clean component structure and modular design

📦 Setup & Development
# Install dependencies
npm install

# Start development server
npm run dev
🧹 Linting & Formatting

To lint the project:
npm run lint

🔍 Advanced Usage

For production-ready setups or integration with TypeScript and type-aware linting, consider checking out:
	•	Vite React TS Template
	•	typescript-eslint

⸻

Built with ❤️ using modern frontend tools.


🖥️ Deployment with Electron

This project can be bundled into a cross-platform desktop application using Electron.

Steps:
	1.	Build the frontend
        npm run build
	2.	Package with Electron
	    •	Set up an Electron main.js file to load the dist/index.html
	    •	Use a tool like electron-builder to generate platform-specific executables
	3.	Run Electron locally (for testing)
        npm run electron:dev
    4.	Create distribution packages
        npm run electron:build
Ensure your Vite build output (dist) is referenced correctly in Electron’s main.js file.

Refer to the Electron and Electron Builder documentation for setup details and platform-specific requirements (e.g., signing for macOS).
