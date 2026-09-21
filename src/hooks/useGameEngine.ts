import { useCallback, useEffect, useRef, useState } from 'react';
import { CAR_LOGOS, type CarLogo } from '../data/carLogos';

export type TimerSetting = 15 | 30 | 60 | 90;
export type DifficultySetting = 'easy' | 'medium' | 'hard' | 'random';

export interface GameStats {
  score: number;
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  avgSpeedSeconds: number;
  accuracyPercentage: number;
  highScore: number;
  isNewHighScore: boolean;
  timerSetting: TimerSetting;
  difficultySetting: DifficultySetting;
}

export interface QuestionItem {
  logo: CarLogo;
  options: string[];
}

export type FeedbackState = 'none' | 'correct' | 'wrong';

const CORRECT_DELAY_MS = 250;
const WRONG_DELAY_MS = 1000; // 1.0s delay on wrong answer so user can review the correct choice

export function useGameEngine(onPlayCorrect?: () => void, onPlayWrong?: () => void, onPlayGameOver?: () => void) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timerSetting, setTimerSetting] = useState<TimerSetting>(() => {
    const saved = localStorage.getItem('cars_quiz_timer');
    return saved ? (parseInt(saved, 10) as TimerSetting) : 30;
  });
  const [difficultySetting, setDifficultySetting] = useState<DifficultySetting>(() => {
    const saved = localStorage.getItem('cars_quiz_difficulty');
    return (saved as DifficultySetting) || 'random';
  });

  const [timeLeft, setTimeLeft] = useState<number>(timerSetting);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('cars_quiz_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const patternStepRef = useRef<number>(0);
  const usedLogoIdsRef = useRef<Set<number>>(new Set());

  // Save settings helpers
  const updateTimerSetting = useCallback((t: TimerSetting) => {
    setTimerSetting(t);
    localStorage.setItem('cars_quiz_timer', t.toString());
  }, []);

  const updateDifficultySetting = useCallback((d: DifficultySetting) => {
    setDifficultySetting(d);
    localStorage.setItem('cars_quiz_difficulty', d);
  }, []);

  // Pick candidate logo pool based on difficulty setting and step
  const getCandidatePool = useCallback(
    (step: number, currentCorrect: number, startTime: number): CarLogo[] => {
      if (difficultySetting === 'hard') {
        // Hard Pattern: 1 from 0..49, 2 from 100+, 1 from 50..99, 2 from 100+ (loop mod 6)
        const mode = step % 6;
        if (mode === 0) {
          return CAR_LOGOS.slice(0, 50);
        } else if (mode === 1 || mode === 2 || mode === 4 || mode === 5) {
          return CAR_LOGOS.slice(100);
        } else {
          return CAR_LOGOS.slice(50, 100);
        }
      } else if (difficultySetting === 'medium') {
        // Medium Pattern: Q2 (50-99) -> Q3 (100-149) -> Q1 (0-49) -> Q4 (150-199) (loop mod 4)
        const mode = step % 4;
        if (mode === 0) {
          return CAR_LOGOS.slice(50, 100);
        } else if (mode === 1) {
          return CAR_LOGOS.slice(100, 150);
        } else if (mode === 2) {
          return CAR_LOGOS.slice(0, 50);
        } else {
          return CAR_LOGOS.slice(150, 200);
        }
      } else if (difficultySetting === 'easy') {
        // Easy: 0..64 unless 8+ correct within 10 seconds from round start -> 65..99
        const elapsedSec = (Date.now() - startTime) / 1000;
        if (currentCorrect >= 8 && elapsedSec <= 10) {
          return CAR_LOGOS.slice(65, 100);
        }
        return CAR_LOGOS.slice(0, 65);
      }

      // Default / Random: all logos
      return CAR_LOGOS;
    },
    [difficultySetting]
  );

  // Generate 4 options (1 correct, 3 distractors)
  const generateQuestion = useCallback(
    (step: number, currentCorrect: number, startTime: number): QuestionItem => {
      let pool = getCandidatePool(step, currentCorrect, startTime);
      let unusedPool = pool.filter((logo) => !usedLogoIdsRef.current.has(logo.id));

      if (unusedPool.length < 1) {
        unusedPool = pool.length > 0 ? pool : [...CAR_LOGOS];
      }

      const targetLogo = unusedPool[Math.floor(Math.random() * unusedPool.length)];
      usedLogoIdsRef.current.add(targetLogo.id);

      const distractors: string[] = [];
      const optionPool = CAR_LOGOS.filter((l) => l.brand !== targetLogo.brand);

      while (distractors.length < 3 && optionPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * optionPool.length);
        const selected = optionPool.splice(randomIndex, 1)[0];
        if (!distractors.includes(selected.brand)) {
          distractors.push(selected.brand);
        }
      }

      const options = [targetLogo.brand, ...distractors].sort(() => Math.random() - 0.5);

      return {
        logo: targetLogo,
        options,
      };
    },
    [getCandidatePool]
  );

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState('ended');
    if (onPlayGameOver) onPlayGameOver();

    setCorrectCount((finalCorrect) => {
      setWrongCount((finalWrong) => {
        setScore((finalScore) => {
          const totalAnswered = finalCorrect + finalWrong;
          const totalTimeUsed = timerSetting;
          const avgSpeedSeconds = totalAnswered > 0 ? parseFloat((totalTimeUsed / totalAnswered).toFixed(2)) : 0;
          const accuracyPercentage = totalAnswered > 0 ? Math.round((finalCorrect / totalAnswered) * 100) : 0;

          let isNewHighScore = false;
          let currentHigh = parseInt(localStorage.getItem('cars_quiz_highscore') || '0', 10);

          if (finalScore > currentHigh) {
            currentHigh = finalScore;
            localStorage.setItem('cars_quiz_highscore', finalScore.toString());
            setHighScore(finalScore);
            isNewHighScore = true;
          }

          setFinalStats({
            score: finalScore,
            totalAnswered,
            correctCount: finalCorrect,
            wrongCount: finalWrong,
            avgSpeedSeconds,
            accuracyPercentage,
            highScore: currentHigh,
            isNewHighScore,
            timerSetting,
            difficultySetting,
          });

          return finalScore;
        });
        return finalWrong;
      });
      return finalCorrect;
    });
  }, [onPlayGameOver, timerSetting, difficultySetting]);

  const startGame = useCallback(() => {
    usedLogoIdsRef.current.clear();
    patternStepRef.current = 0;
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(timerSetting);
    setFeedback('none');
    setSelectedOption(null);
    setFinalStats(null);
    setGameState('playing');

    const now = Date.now();
    roundStartTimeRef.current = now;

    const firstQuestion = generateQuestion(0, 0, now);
    setCurrentQuestion(firstQuestion);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerSetting, generateQuestion, endGame]);

  const resetToHome = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState('idle');
    setFinalStats(null);
    setFeedback('none');
    setSelectedOption(null);
  }, []);

  const handleAnswer = useCallback(
    (chosenBrand: string) => {
      if (gameState !== 'playing' || !currentQuestion || feedback !== 'none') return;

      setSelectedOption(chosenBrand);
      const isCorrect = chosenBrand === currentQuestion.logo.brand;

      let nextCorrect = correctCount;
      if (isCorrect) {
        setFeedback('correct');
        setScore((s) => s + 10);
        setCorrectCount((c) => {
          nextCorrect = c + 1;
          return nextCorrect;
        });
        if (onPlayCorrect) onPlayCorrect();
      } else {
        setFeedback('wrong');
        setWrongCount((w) => w + 1);
        if (onPlayWrong) onPlayWrong();
      }

      patternStepRef.current += 1;
      const nextStep = patternStepRef.current;
      const startTime = roundStartTimeRef.current;
      const delayMs = isCorrect ? CORRECT_DELAY_MS : WRONG_DELAY_MS;

      setTimeout(() => {
        setFeedback('none');
        setSelectedOption(null);
        if (gameState === 'playing') {
          setCurrentQuestion(generateQuestion(nextStep, nextCorrect, startTime));
        }
      }, delayMs);
    },
    [gameState, currentQuestion, feedback, correctCount, generateQuestion, onPlayCorrect, onPlayWrong]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    timeLeft,
    timerSetting,
    difficultySetting,
    updateTimerSetting,
    updateDifficultySetting,
    currentQuestion,
    score,
    correctCount,
    wrongCount,
    feedback,
    selectedOption,
    highScore,
    finalStats,
    startGame,
    resetToHome,
    handleAnswer,
  };
}
