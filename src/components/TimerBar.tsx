import React from 'react';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';

interface TimerBarProps {
  timeLeft: number;
  maxTime?: number;
  correctCount: number;
  wrongCount: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  timeLeft,
  maxTime = 30,
  correctCount,
  wrongCount,
}) => {
  const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  // Color change logic: Green -> Yellow -> Red
  let barColorClass = 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400';
  let isPulsing = false;

  if (timeLeft <= 10 && timeLeft > 5) {
    barColorClass = 'bg-gradient-to-r from-amber-500 to-orange-500';
  } else if (timeLeft <= 5) {
    barColorClass = 'bg-gradient-to-r from-red-600 to-rose-500';
    isPulsing = true;
  }

  return (
    <div className="w-full max-w-md mx-auto mb-1.5 px-3">
      {/* Top metrics row */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
          <span className="font-mono text-sm tracking-wider font-extrabold text-white">
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>

        {/* Tallies */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{correctCount}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>{wrongCount}</span>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner relative">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColorClass} ${
            isPulsing ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
