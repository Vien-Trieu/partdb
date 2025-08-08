/*
Author: Vien Trieu (Date: 6-27-2025)
Description: Displays a splash screen with animated logo and triggers callback when animation finishes.
*/

/* === Imports ============================================================ */
import React, { useEffect, useState } from 'react';
import logoImage from '../assets/testlogo.png';

/* === Component Definition =============================================== */
const SplashScreen = ({ onFinish }) => {
  /* === State: fadeOut toggle ============================================ */
  // Tracks whether the logo should fade out
  const [fadeOut, setFadeOut] = useState(false);

  /* === Effects: preload image & timers ================================= */
  useEffect(() => {
    console.log('SplashScreen mounted');

    // Preload logo to log dimensions
    const img = new Image();
    img.src = logoImage;
    img.onload = () => console.log('Image dimensions:', img.width, 'x', img.height);

    // Start fade-out after 1.5 seconds
    const timer1 = setTimeout(() => setFadeOut(true), 1500);
    // Trigger onFinish callback after 2 seconds
    const timer2 = setTimeout(() => onFinish(), 2000);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []); // Empty dependency array: run once on mount

  /* === Render =========================================================== */
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}
    >
      {/* Logo container with fixed size */}
      <div className="relative w-64 h-64">
        <img
          src={logoImage}
          alt="Logo"
          className={`w-full h-full object-contain ${fadeOut ? 'fade-out' : 'fall-fade'}`}
          style={{ visibility: 'visible' }} // Ensure visibility until fade-out
        />
      </div>
    </div>
  );
};

/* === Export ============================================================= */
export default SplashScreen;
// Note: Ensure you have the necessary CSS for fade-out and fall-fade animations