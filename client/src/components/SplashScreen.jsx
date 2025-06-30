import React, { useEffect, useState } from 'react';
import logoImage from '../assets/testlogo.png';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    console.log('SplashScreen mounted');
    const img = new Image();
    img.src = logoImage;
    img.onload = () => console.log('Image dimensions:', img.width, 'x', img.height);

    const timer1 = setTimeout(() => setFadeOut(true), 1500);
    const timer2 = setTimeout(() => onFinish(), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-white" 
      style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000}}
    >
      <div className="relative w-64 h-64">
        <img 
          src={logoImage} 
          alt="Logo"
          className={`w-full h-full object-contain ${fadeOut ? 'fade-out' : 'fall-fade'}`}
          style={{visibility: 'visible'}}
        />
      </div>
    </div>
  );
};

export default SplashScreen;