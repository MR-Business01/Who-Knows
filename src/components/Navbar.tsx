import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Users, Trophy, Settings } from 'lucide-react';
import type { TimerSetting, DifficultySetting } from '../hooks/useGameEngine';

interface NavbarProps {
  score: number;
  highScore: number;
  timerSetting: TimerSetting;
  difficultySetting: DifficultySetting;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenMultiplayer: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  score,
  highScore,
  timerSetting,
  difficultySetting,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenMultiplayer,
  onOpenSettings,
}) => {
  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between glass-panel rounded-2xl border border-slate-700/50 shadow-xl mb-3">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-xl">🏎️</span>
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
            CARS <span className="text-cyan-400">QUIZ</span>
          </h1>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <strong className="text-amber-300 font-bold">{highScore}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-bold uppercase">{timerSetting}s | {difficultySetting}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Score Pill */}
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-1 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400">PTS</span>
          <span className="text-sm font-black text-cyan-400 font-mono">{score}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Game Settings (Timer & Difficulty)"
          className="p-2 rounded-xl glass-button text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>

        {/* Multiplayer Button */}
        <button
          onClick={onOpenMultiplayer}
          title="Friends Group Session"
          className="p-2 rounded-xl glass-button text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-all"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="p-2 rounded-xl glass-button text-slate-300 hover:text-white transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Focus'}
          className="p-2 rounded-xl glass-button text-slate-300 hover:text-white transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};
