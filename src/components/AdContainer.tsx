import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdContainerProps {
  type?: 'banner' | 'interstitial';
}

export const AdContainer: React.FC<AdContainerProps> = ({ type = 'banner' }) => {
  if (type === 'banner') {
    return (
      <div className="w-full max-w-md mx-auto my-2 px-4">
        <div className="w-full py-2 px-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs text-slate-500 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400">AD</span>
            <span className="text-[11px] text-slate-400 font-medium">Sponsored Banner Container</span>
          </div>
          <Megaphone className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-3 px-4">
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col items-center text-center shadow-lg">
        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
          SPONSORED ADVERTISEMENT
        </span>
        <p className="text-xs text-slate-300 font-medium my-1">
          🏎️ Upgrade to Premium for Ad-Free Unlimited Logo Quiz Rounds!
        </p>
      </div>
    </div>
  );
};
