import React, { useEffect, useState } from 'react';
import { LogoImage } from './Logo';
import { Dumbbell, Flame, Zap } from 'lucide-react';

export const IntroSplash = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Quick, high-impact 1.2-second intro loader
    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 200);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div 
      onClick={() => onFinish()}
      className={`fixed inset-0 z-[9999] bg-[#070b19] flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      
      {/* Background Floating Fitness Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/6 text-electricBlue animate-pulse-glow">
          <Dumbbell className="w-16 h-16 transform -rotate-12" />
        </div>
        <div className="absolute bottom-1/4 right-1/6 text-vibrantOrange animate-pulse-glow">
          <Flame className="w-20 h-20 transform rotate-12" />
        </div>
        <div className="absolute top-1/3 right-1/4 text-electricBlue animate-spin-slow">
          <Zap className="w-12 h-12" />
        </div>
      </div>

      {/* Intro Logo Container */}
      <div className="relative flex flex-col items-center z-10 px-4">
        <div className="relative w-32 h-32 mb-5 flex items-center justify-center">
          {/* Orbital Neon Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-electricBlue animate-spin-slow opacity-80 shadow-[0_0_25px_#00f0ff]"></div>
          <div className="absolute inset-2 rounded-full border border-vibrantOrange animate-pulse-glow opacity-60"></div>

          {/* Logo Image */}
          <LogoImage className="w-20 h-20 object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" />
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-white mb-2 font-outfit">
          FIT<span className="text-[#00f0ff] drop-shadow-[0_0_15px_#00f0ff]">UP</span>
        </h1>

        {/* Tagline */}
        <p className="text-vibrantOrange tracking-[0.3em] text-xs md:text-sm font-semibold mb-6 uppercase drop-shadow-[0_0_10px_#ff5500]">
          BOOK. LIFT. REPEAT.
        </p>

        {/* Loader Bar */}
        <div className="w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-electricBlue via-blue-400 to-vibrantOrange rounded-full transition-all duration-75 shadow-[0_0_12px_#00f0ff]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-slate-500 font-mono mt-2">
          TAP TO SKIP • LOADING ({progress}%)
        </span>
      </div>
    </div>
  );
};
