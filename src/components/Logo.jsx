import React, { useState } from 'react';
import { fitupLogo } from '../assets/logoData';

export const LogoImage = ({ className = "w-8 h-8 object-contain" }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#00f0ff]">
          {/* Stopwatch Ring */}
          <circle cx="50" cy="54" r="36" stroke="#00f0ff" strokeWidth="6" fill="#070b19" />
          <circle cx="50" cy="54" r="36" stroke="#ff5500" strokeWidth="6" strokeDasharray="40 180" fill="none" />
          {/* Top Knob */}
          <path d="M50 14 V 22 M40 14 H 60" stroke="#00f0ff" strokeWidth="5" strokeLinecap="round" />
          {/* Stopwatch Hand */}
          <path d="M50 54 L 68 36" stroke="#ff5500" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="54" r="6" fill="#00f0ff" />
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={fitupLogo} 
      alt="FITUP Logo" 
      className={className} 
      onError={() => setImgError(true)} 
    />
  );
};
