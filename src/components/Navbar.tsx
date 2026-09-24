import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Users, Trophy, Settings, Menu, X } from 'lucide-react';
import type { TimerSetting, DifficultySetting, GameMode } from '../types/quiz';

interface NavbarProps {
  highScore: number;
  gameMode: GameMode;
  timerSetting: TimerSetting;
  difficultySetting: DifficultySetting;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenMultiplayer: () => void;
  onOpenSettings: () => void;
  isPlaying?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  highScore,
  gameMode,
  timerSetting,
  difficultySetting,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenMultiplayer,
  onOpenSettings,
  isPlaying = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const modeIcon = gameMode === 'cars' ? '🏎️' : gameMode === 'flags' ? '🚩' : '🏛️';
  const modeTitle = gameMode === 'cars' ? 'CARS' : gameMode === 'flags' ? 'FLAGS' : 'CAPITALS';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg px-3 py-2.5">
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <span className="text-base">{modeIcon}</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-tight flex items-center gap-1">
              {modeTitle} <span className="text-cyan-400">QUIZ</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-0.5">
                <Trophy className="w-3 h-3 text-amber-400" />
                <strong className="text-amber-300 font-bold">{highScore}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300 font-bold uppercase">{timerSetting}s | {difficultySetting}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 relative" ref={menuRef}>
          {/* Fullscreen Toggle (left as requested) */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Focus'}
            className="p-2 rounded-xl glass-button text-slate-300 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="Menu"
            className="p-2 rounded-xl glass-button text-slate-200 hover:text-white transition-all relative"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-fadeIn backdrop-blur-xl space-y-1">
              {/* Settings Item */}
              <button
                disabled={isPlaying}
                onClick={() => {
                  if (isPlaying) return;
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
                title={isPlaying ? 'Unavailable during game' : 'Game Settings'}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  isPlaying
                    ? 'opacity-40 text-slate-500 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 shrink-0 ${isPlaying ? 'text-slate-500' : 'text-cyan-400'}`} />
                  <span>Game Settings</span>
                </div>
                {isPlaying && <span className="text-[9px] text-slate-500 uppercase font-mono">In Game</span>}
              </button>

              {/* Multiplayer Item */}
              <button
                disabled={isPlaying}
                onClick={() => {
                  if (isPlaying) return;
                  setIsMenuOpen(false);
                  onOpenMultiplayer();
                }}
                title={isPlaying ? 'Unavailable during game' : 'Multiplayer Room'}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  isPlaying
                    ? 'opacity-40 text-slate-500 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 shrink-0 ${isPlaying ? 'text-slate-500' : 'text-indigo-400'}`} />
                  <span>Multiplayer Room</span>
                </div>
                {isPlaying && <span className="text-[9px] text-slate-500 uppercase font-mono">In Game</span>}
              </button>

              {/* Sound Toggle Item */}
              <button
                onClick={() => {
                  onToggleSound();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span>Game Sound</span>
                </div>
                <span className={`text-[10px] uppercase font-mono ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
