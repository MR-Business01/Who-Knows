import React, { useEffect } from 'react';
import type { GameStats } from '../hooks/useGameEngine';
import confetti from 'canvas-confetti';
import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, Share2, Award, Home } from 'lucide-react';

interface StatsModalProps {
  stats: GameStats | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onPlayAgain, onGoHome }) => {
  if (!stats) return null;

  useEffect(() => {
    if (stats.isNewHighScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24'],
      });
    }
  }, [stats.isNewHighScore]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cars Logo Quiz Score',
        text: `🏎️ I scored ${stats.score} PTS in the ${stats.timerSetting}s Cars Logo Quiz (${stats.difficultySetting.toUpperCase()} mode)! Can you beat my record?`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `🏎️ I scored ${stats.score} PTS in the ${stats.timerSetting}s Cars Logo Quiz (${stats.difficultySetting.toUpperCase()} mode)!`
      );
      alert('Score copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {stats.isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3 animate-pulse">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW HIGH SCORE RECORD!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-3">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIME'S UP! ROUND COMPLETE</span>
          </div>
        )}

        <div className="my-2">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400">FINAL SCORE</div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 font-mono my-1">
            {stats.score}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-4 text-left">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">TOTAL DISPLAYED</div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{stats.totalAnswered} Logos</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">ACCURACY RATE</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{stats.accuracyPercentage}%</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">ANSWERS</div>
              <div className="flex items-center gap-2 text-sm font-bold font-mono mt-0.5">
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> {stats.correctCount}
                </span>
                <span className="text-rose-400 flex items-center gap-0.5">
                  <XCircle className="w-3 h-3" /> {stats.wrongCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>AVG SPEED</span>
            </div>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {stats.avgSpeedSeconds} <span className="text-xs text-slate-400 font-sans">s/logo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-base shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onGoHome}
              className="py-2.5 px-3 rounded-2xl glass-button text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4 text-indigo-400" />
              <span>HOMEPAGE</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-2xl glass-button text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>SHARE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
