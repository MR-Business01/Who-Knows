import React, { useState, useEffect } from 'react';
import type { CarLogo } from '../data/carLogos';
import type { CountryFlag } from '../data/flagLogos';
import type { FeedbackState, GameMode } from '../types/quiz';
import { Maximize2, ShieldAlert } from 'lucide-react';

interface LogoCardProps {
  logo: CarLogo | CountryFlag | null;
  countryName?: string;
  gameMode?: GameMode;
  feedback: FeedbackState;
  onToggleFullscreen: () => void;
}

export const LogoCard: React.FC<LogoCardProps> = ({
  logo,
  countryName,
  gameMode = 'cars',
  feedback,
  onToggleFullscreen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [logo?.id, gameMode]);

  let borderClasses = 'border-slate-300/60 shadow-2xl shadow-blue-950/40';
  if (feedback === 'correct') {
    borderClasses = 'border-emerald-500 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pop-correct';
  } else if (feedback === 'wrong') {
    borderClasses = 'border-rose-500 shadow-2xl shadow-rose-500/40 ring-4 ring-rose-500/30 animate-shake';
  }

  return (
    <div className="w-full max-w-md mx-auto px-3 flex-1 flex flex-col items-center justify-center min-h-[200px] max-h-[38vh] my-1 relative">
      {/* Big Bold Country Name Header for Capitals Quiz */}
      {gameMode === 'capitals' && countryName && (
        <div className="mb-1 text-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">GUESS THE CAPITAL OF</span>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 tracking-tight font-sans drop-shadow-md">
            {countryName.toUpperCase()}
          </h2>
        </div>
      )}

      <div
        className={`w-full h-full rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border ${borderClasses}`}
        style={{ backgroundColor: 'rgba(235, 238, 243, 0.92)', backdropFilter: 'blur(16px)' }}
      >
        {/* Fullscreen Focus Floating Icon */}
        <button
          onClick={onToggleFullscreen}
          title="Fullscreen Focus"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/70 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700/50 z-10 transition-transform active:scale-95 shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm z-0">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Logo / Flag Image Only */}
        {logo && !hasError ? (
          <img
            src={logo.image_url}
            alt={gameMode === 'cars' ? 'Guess Car Logo' : 'Country Flag'}
            className={`max-w-full max-h-[170px] sm:max-h-[200px] object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] transition-all duration-300 ${
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
            <p className="text-sm font-semibold text-slate-800">
              {gameMode === 'cars' ? 'Car Logo Image' : 'Country Flag Image'}
            </p>
            <p className="text-xs text-slate-600 mt-1 font-mono">{logo?.brand || 'Quiz Image'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
