import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500); // trigger fade at 1.5s
    const removeTimer = setTimeout(onFinish, 2000); // unmount at 2s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed w-screen h-screen bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'fade-out' : ''}`}>
      <div className="w-full max-w-sm px-4 flex flex-col items-center text-center">
        <img src="/logo.png" alt="Logo" className="fall-fade w-32 h-auto mx-auto" />
        <p className="mt-4 text-base md:text-lg lg:text-xl font-medium text-gray-700">
          Loading PartsDB...
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;