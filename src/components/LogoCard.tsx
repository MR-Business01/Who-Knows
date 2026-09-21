import React, { useState, useEffect } from 'react';
import type { CarLogo } from '../data/carLogos';
import type { FeedbackState } from '../hooks/useGameEngine';
import { Maximize2, ShieldAlert } from 'lucide-react';

interface LogoCardProps {
  logo: CarLogo | null;
  feedback: FeedbackState;
  onToggleFullscreen: () => void;
}

export const LogoCard: React.FC<LogoCardProps> = ({ logo, feedback, onToggleFullscreen }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [logo?.id]);

  let borderClasses = 'border-slate-300/60 shadow-2xl shadow-blue-950/40';
  if (feedback === 'correct') {
    borderClasses = 'border-emerald-500 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pop-correct';
  } else if (feedback === 'wrong') {
    borderClasses = 'border-rose-500 shadow-2xl shadow-rose-500/40 ring-4 ring-rose-500/30 animate-shake';
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 flex-1 flex flex-col items-center justify-center min-h-[260px] max-h-[42vh] relative">
      <div
        className={`w-full h-full rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border ${borderClasses}`}
        style={{ backgroundColor: 'rgba(235, 238, 243, 0.88)', backdropFilter: 'blur(16px)' }}
      >
        {/* Fullscreen Focus Floating Icon */}
        <button
          onClick={onToggleFullscreen}
          title="Fullscreen Focus"
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700/50 z-10 transition-transform active:scale-95 shadow-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm z-0">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Logo Image */}
        {logo && !hasError ? (
          <img
            src={logo.image_url}
            alt="Guess this Car Logo"
            className={`max-w-full max-h-[220px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition-all duration-300 ${
              isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          /* Error / Fallback Card */
          <div className="flex flex-col items-center justify-center text-center p-4">
            <ShieldAlert className="w-12 h-12 text-amber-500 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-slate-800">Logo Image Preview</p>
            <p className="text-xs text-slate-600 mt-1 font-mono">{logo?.brand || 'Car Company Logo'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
