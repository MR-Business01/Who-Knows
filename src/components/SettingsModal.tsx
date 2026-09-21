import React from 'react';
import type { TimerSetting, DifficultySetting } from '../hooks/useGameEngine';
import { Settings, X, Timer, Gauge, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerSetting: TimerSetting;
  difficultySetting: DifficultySetting;
  onSelectTimer: (timer: TimerSetting) => void;
  onSelectDifficulty: (difficulty: DifficultySetting) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  timerSetting,
  difficultySetting,
  onSelectTimer,
  onSelectDifficulty,
}) => {
  if (!isOpen) return null;

  const timerOptions: { value: TimerSetting; label: string }[] = [
    { value: 15, label: '15s (Sprint)' },
    { value: 30, label: '30s (Standard)' },
    { value: 60, label: '60s (Endurance)' },
    { value: 90, label: '90s (Marathon)' },
  ];

  const difficultyOptions: { value: DifficultySetting; label: string; desc: string }[] = [
    { value: 'random', label: 'Random (Default)', desc: 'Shuffled logos across the full 210 dataset' },
    { value: 'easy', label: 'Easy', desc: 'Focuses on top 65 famous brands (unlocks 65-100 on streak)' },
    { value: 'medium', label: 'Medium', desc: 'Rotates 1 logo from each quarter of dataset sequentially' },
    { value: 'hard', label: 'Hard', desc: 'Combines top 50 with challenging logos (100+)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Game Settings</h2>
            <p className="text-xs text-slate-400">Customize Timer & Difficulty</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Timer Section */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>ROUND DURATION</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {timerOptions.map((opt) => {
                const isSelected = timerSetting === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelectTimer(opt.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                        : 'glass-button text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-slate-800/80 my-2" />

          {/* Difficulty Section */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>DIFFICULTY MODE</span>
            </label>

            <div className="space-y-2">
              {difficultyOptions.map((opt) => {
                const isSelected = difficultySetting === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelectDifficulty(opt.value)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-blue-500 text-white shadow-md'
                        : 'glass-button text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 active:scale-95 transition-all"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
