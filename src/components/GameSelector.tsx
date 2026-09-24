import React from 'react';
import type { GameMode } from '../types/quiz';
import { Flag, Car, Landmark, Sparkles } from 'lucide-react';

interface GameSelectorProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ gameMode, onSelectGameMode }) => {
  return (
    <div className="w-full max-w-xs mx-auto mb-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2 flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>SELECT QUIZ CATEGORY</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        {/* Cars Logo Quiz Option */}
        <button
          onClick={() => onSelectGameMode('cars')}
          className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1 border ${
            gameMode === 'cars'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cars</span>
        </button>

        {/* World Flags Quiz Option */}
        <button
          onClick={() => onSelectGameMode('flags')}
          className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1 border ${
            gameMode === 'flags'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Flags</span>
        </button>

        {/* Country Capitals Quiz Option */}
        <button
          onClick={() => onSelectGameMode('capitals')}
          className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1 border ${
            gameMode === 'capitals'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Capitals</span>
        </button>
      </div>
    </div>
  );
};
