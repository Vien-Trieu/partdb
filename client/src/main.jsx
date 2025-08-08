/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Entry point for the React application; bootstraps the App component into the DOM using StrictMode.
*/

/* === Imports ============================================================ */
/* React StrictMode for highlighting potential problems */
import { StrictMode } from 'react';
/* createRoot to initialize React root in React 18+ */
import { createRoot } from 'react-dom/client';
/* Global CSS styles */
import './index.css';
/* Main App component */
import App from './App.jsx';

/* === Initialization & Render =========================================== */
/* Locate the root DOM element for React */
const rootElement = document.getElementById('root');
/* Create React root */
const root = createRoot(rootElement);

/* Render the App component wrapped in StrictMode */
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
/* Note: StrictMode is a development tool that helps identify potential problems in an application. It does not affect production builds. */