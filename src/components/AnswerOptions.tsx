import React from 'react';
import type { FeedbackState } from '../types/quiz';

interface AnswerOptionsProps {
  options: string[];
  correctBrand: string | undefined;
  selectedOption: string | null;
  feedback: FeedbackState;
  onSelectOption: (brand: string) => void;
  disabled?: boolean;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  correctBrand,
  selectedOption,
  feedback,
  onSelectOption,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-3 mt-2 mb-1 grid grid-cols-2 gap-2">
      {options.map((option, idx) => {
        const isSelected = selectedOption === option;
        const isCorrectOption = option === correctBrand;

        let stateStyles = 'glass-button text-slate-100 hover:border-cyan-500/50 hover:bg-slate-800/80';

        if (feedback !== 'none') {
          if (isSelected) {
            if (isCorrectOption) {
              stateStyles = 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-600/40 animate-pop-correct';
            } else {
              stateStyles = 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/50 shadow-lg shadow-rose-600/40 animate-shake';
            }
          } else if (isCorrectOption && feedback === 'wrong') {
            stateStyles = 'bg-emerald-900/60 text-emerald-200 border-emerald-500/60';
          } else {
            stateStyles = 'opacity-40 glass-button text-slate-400';
          }
        }

        return (
          <button
            key={`${option}-${idx}`}
            onClick={() => onSelectOption(option)}
            disabled={disabled || feedback !== 'none'}
            className={`w-full min-h-[58px] py-3 px-3 rounded-2xl text-center font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center border shadow-md active:scale-95 disabled:cursor-default ${stateStyles}`}
          >
            <span className="line-clamp-2 leading-tight">{option}</span>
          </button>
        );
      })}
    </div>
  );
};
