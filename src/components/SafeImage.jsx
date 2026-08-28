import React, { useState } from 'react';
import { Dumbbell, UserCheck, QrCode, Image as ImageIcon } from 'lucide-react';

export const SafeImage = ({ src, alt, className = "", fallbackType = "gym" }) => {
  const [hasError, setHasError] = useState(false);

  // If no source provided or error occurred, render styled fallback card
  if (!src || hasError) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 overflow-hidden ${className}`}>
        {/* Glow Ambient Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-electricBlue/10 via-transparent to-vibrantOrange/10 pointer-events-none" />

        {fallbackType === 'gym' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white font-outfit line-clamp-1">{alt || 'Partner Gym'}</span>
            <span className="text-[10px] text-electricBlue font-mono uppercase tracking-wider mt-0.5">FITUP Certified Arena</span>
          </div>
        )}

        {fallbackType === 'trainer' && (
          <div className="flex flex-col items-center justify-center p-3 text-center z-10">
            <div className="w-10 h-10 rounded-xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(255,85,0,0.2)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white font-outfit line-clamp-1">{alt || 'Certified Trainer'}</span>
          </div>
        )}

        {fallbackType === 'qr' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white font-outfit">UPI Payment QR</span>
          </div>
        )}

        {fallbackType === 'default' && (
          <div className="flex flex-col items-center justify-center p-3 text-center z-10">
            <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-400">{alt || 'FITUP Visual'}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "FITUP Visual"}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
