import React from 'react';
import type { GameMode } from '../hooks/useGameEngine';
import { Flag, Car, Sparkles } from 'lucide-react';

interface GameSelectorProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ gameMode, onSelectGameMode }) => {
  return (
    <div className="w-full max-w-xs mx-auto mb-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2 flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>SELECT GAME CATEGORY</span>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        {/* Cars Logo Quiz Option */}
        <button
          onClick={() => onSelectGameMode('cars')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
            gameMode === 'cars'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
          }`}
        >
          <Car className="w-4 h-4 text-cyan-400" />
          <span>Cars Logos</span>
        </button>

        {/* World Flags Quiz Option */}
        <button
          onClick={() => onSelectGameMode('flags')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
            gameMode === 'flags'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
          }`}
        >
          <Flag className="w-4 h-4 text-emerald-400" />
          <span>World Flags</span>
        </button>
      </div>
    </div>
  );
};
