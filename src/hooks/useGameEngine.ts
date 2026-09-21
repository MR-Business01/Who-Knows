import { useCallback, useEffect, useRef, useState } from 'react';
import { CAR_LOGOS, type CarLogo } from '../data/carLogos';
import { FLAG_LOGOS, type CountryFlag } from '../data/flagLogos';
import { multiplayerService, getStoredPlayerProfile, type RoomSession } from '../services/multiplayerService';

export type GameMode = 'cars' | 'flags' | 'capitals';
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
  gameMode: GameMode;
}

export interface QuestionItem {
  logo: CarLogo | CountryFlag;
  targetAnswer: string;
  countryName?: string;
  options: string[];
}

export type FeedbackState = 'none' | 'correct' | 'wrong';

const CORRECT_DELAY_MS = 250;
const WRONG_DELAY_MS = 1000;

export function useGameEngine(onPlayCorrect?: () => void, onPlayWrong?: () => void, onPlayGameOver?: () => void) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const saved = localStorage.getItem('cars_quiz_gamemode');
    return (saved as GameMode) || 'cars';
  });

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
    const key = `quiz_highscore_${gameMode}`;
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const patternStepRef = useRef<number>(0);
  const usedLogoIdsRef = useRef<Set<number>>(new Set());
  const isTransitioningRef = useRef<boolean>(false);
  const gameStateRef = useRef<'idle' | 'playing' | 'ended'>('idle');
  const correctCountRef = useRef<number>(0);

  const [activeMultiplayerRoom, setActiveMultiplayerRoom] = useState<RoomSession | null>(null);
  const activeRoomRef = useRef<RoomSession | null>(null);
  const myPlayerIdRef = useRef<string>(getStoredPlayerProfile().id);

  // Sync activeRoomRef
  useEffect(() => {
    activeRoomRef.current = activeMultiplayerRoom;
  }, [activeMultiplayerRoom]);

  // Sync gameStateRef & correctCountRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update Game Mode helper
  const updateGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    localStorage.setItem('cars_quiz_gamemode', mode);
    const key = `quiz_highscore_${mode}`;
    const saved = localStorage.getItem(key);
    setHighScore(saved ? parseInt(saved, 10) : 0);
  }, []);

  const updateTimerSetting = useCallback((t: TimerSetting) => {
    setTimerSetting(t);
    localStorage.setItem('cars_quiz_timer', t.toString());
  }, []);

  const updateDifficultySetting = useCallback((d: DifficultySetting) => {
    setDifficultySetting(d);
    localStorage.setItem('cars_quiz_difficulty', d);
  }, []);

  // Pick candidate dataset (CAR_LOGOS vs FLAG_LOGOS)
  const getActiveDataset = useCallback((): (CarLogo | CountryFlag)[] => {
    return gameMode === 'cars' ? CAR_LOGOS : FLAG_LOGOS;
  }, [gameMode]);

  // Candidate pool based on difficulty setting
  const getCandidatePool = useCallback(
    (step: number, currentCorrect: number, startTime: number): (CarLogo | CountryFlag)[] => {
      const dataset = getActiveDataset();
      const total = dataset.length;

      if (difficultySetting === 'hard') {
        const mode = step % 6;
        if (mode === 0) {
          return dataset.slice(0, Math.min(50, total));
        } else if (mode === 1 || mode === 2 || mode === 4 || mode === 5) {
          return dataset.slice(Math.min(100, total - 1));
        } else {
          return dataset.slice(Math.min(50, total), Math.min(100, total));
        }
      } else if (difficultySetting === 'medium') {
        const mode = step % 4;
        const q1 = Math.floor(total * 0.25);
        const q2 = Math.floor(total * 0.50);
        const q3 = Math.floor(total * 0.75);

        if (mode === 0) return dataset.slice(q1, q2);
        if (mode === 1) return dataset.slice(q2, q3);
        if (mode === 2) return dataset.slice(0, q1);
        return dataset.slice(q3);
      } else if (difficultySetting === 'easy') {
        const elapsedSec = (Date.now() - startTime) / 1000;
        if (currentCorrect >= 8 && elapsedSec <= 10) {
          return dataset.slice(Math.min(65, total), Math.min(100, total));
        }
        return dataset.slice(0, Math.min(65, total));
      }

      return dataset;
    },
    [difficultySetting, getActiveDataset]
  );

  // Generate question
  const generateQuestion = useCallback(
    (step: number, currentCorrect: number, startTime: number): QuestionItem => {
      const fullDataset = getActiveDataset();
      let pool = getCandidatePool(step, currentCorrect, startTime);
      if (!pool || pool.length === 0) {
        pool = fullDataset;
      }
      let unusedPool = pool.filter((logo) => !usedLogoIdsRef.current.has(logo.id));

      if (unusedPool.length < 1) {
        unusedPool = [...fullDataset];
      }

      const targetLogo = unusedPool[Math.floor(Math.random() * unusedPool.length)] || fullDataset[0];
      usedLogoIdsRef.current.add(targetLogo.id);

      if (gameMode === 'capitals') {
        const countryItem = targetLogo as CountryFlag;
        const targetAnswer = countryItem.capital;

        // Distractors are other country capitals
        const distractors: string[] = [];
        const optionPool = FLAG_LOGOS.filter((c) => c.capital !== targetAnswer);

        while (distractors.length < 3 && optionPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * optionPool.length);
          const selected = optionPool.splice(randomIndex, 1)[0];
          if (!distractors.includes(selected.capital)) {
            distractors.push(selected.capital);
          }
        }

        const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);

        return {
          logo: countryItem,
          targetAnswer,
          countryName: countryItem.brand,
          options,
        };
      } else {
        // Cars or Flags Mode
        const targetAnswer = targetLogo.brand;
        const distractors: string[] = [];
        const optionPool = fullDataset.filter((l) => l.brand !== targetAnswer);

        while (distractors.length < 3 && optionPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * optionPool.length);
          const selected = optionPool.splice(randomIndex, 1)[0];
          if (!distractors.includes(selected.brand)) {
            distractors.push(selected.brand);
          }
        }

        const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);

        return {
          logo: targetLogo,
          targetAnswer,
          options,
        };
      }
    },
    [getCandidatePool, getActiveDataset, gameMode]
  );

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState('ended');
    gameStateRef.current = 'ended';
    if (onPlayGameOver) onPlayGameOver();

    setCorrectCount((finalCorrect) => {
      setWrongCount((finalWrong) => {
        setScore((finalScore) => {
          const totalAnswered = finalCorrect + finalWrong;
          const totalTimeUsed = timerSetting;
          const avgSpeedSeconds = totalAnswered > 0 ? parseFloat((totalTimeUsed / totalAnswered).toFixed(2)) : 0;
          const accuracyPercentage = totalAnswered > 0 ? Math.round((finalCorrect / totalAnswered) * 100) : 0;

          let isNewHighScore = false;
          const key = `quiz_highscore_${gameMode}`;
          let currentHigh = parseInt(localStorage.getItem(key) || '0', 10);

          if (finalScore > currentHigh) {
            currentHigh = finalScore;
            localStorage.setItem(key, finalScore.toString());
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
            gameMode,
          });

          return finalScore;
        });
        return finalWrong;
      });
      return finalCorrect;
    });
  }, [onPlayGameOver, timerSetting, difficultySetting, gameMode]);

  // Listener for synchronized multiplayer room questions and state
  useEffect(() => {
    if (!activeMultiplayerRoom?.roomId || gameState !== 'playing') return;

    const myProfile = getStoredPlayerProfile();
    const isHost = activeMultiplayerRoom.hostId === myProfile.id;

    const unsubscribe = multiplayerService.subscribeToRoom(activeMultiplayerRoom.roomId, (updatedRoom) => {
      if (!updatedRoom) return;
      setActiveMultiplayerRoom(updatedRoom);

      // Synchronize question from Host
      if (!isHost && updatedRoom.currentQuestion) {
        setCurrentQuestion(updatedRoom.currentQuestion);
        setFeedback('none');
        setSelectedOption(null);
        isTransitioningRef.current = false;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeMultiplayerRoom?.roomId, gameState]);

  // Start single-player game or multiplayer game
  const startGame = useCallback((multiplayerRoom?: RoomSession) => {
    usedLogoIdsRef.current.clear();
    patternStepRef.current = 0;
    correctCountRef.current = 0;
    isTransitioningRef.current = false;

    const roundTimer = multiplayerRoom ? multiplayerRoom.timerSetting : timerSetting;
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(roundTimer);
    setFeedback('none');
    setSelectedOption(null);
    setFinalStats(null);

    const now = Date.now();
    roundStartTimeRef.current = now;

    if (multiplayerRoom) {
      setActiveMultiplayerRoom(multiplayerRoom);
      activeRoomRef.current = multiplayerRoom;
      const myProfile = getStoredPlayerProfile();
      const isHost = multiplayerRoom.hostId === myProfile.id;

      if (isHost) {
        const firstQuestion = generateQuestion(0, 0, now);
        setCurrentQuestion(firstQuestion);
        // Sync initial question to Firebase
        multiplayerService.startGame(multiplayerRoom.roomId, firstQuestion);
      } else if (multiplayerRoom.currentQuestion) {
        setCurrentQuestion(multiplayerRoom.currentQuestion);
      }
    } else {
      setActiveMultiplayerRoom(null);
      activeRoomRef.current = null;
      const firstQuestion = generateQuestion(0, 0, now);
      setCurrentQuestion(firstQuestion);
    }

    setGameState('playing');
    gameStateRef.current = 'playing';

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
    gameStateRef.current = 'idle';
    setActiveMultiplayerRoom(null);
    activeRoomRef.current = null;
    setFinalStats(null);
    setFeedback('none');
    setSelectedOption(null);
  }, []);

  const handleAnswer = useCallback(
    (chosenAnswer: string) => {
      if (gameStateRef.current !== 'playing' || isTransitioningRef.current || !currentQuestion) return;

      isTransitioningRef.current = true;
      setSelectedOption(chosenAnswer);
      const isCorrect = chosenAnswer === currentQuestion.targetAnswer;

      if (isCorrect) {
        setFeedback('correct');
        setScore((s) => {
          const newScore = s + 10;
          if (activeRoomRef.current) {
            multiplayerService.updatePlayerScore(
              activeRoomRef.current.roomId,
              myPlayerIdRef.current,
              newScore
            );
          }
          return newScore;
        });
        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);
        if (onPlayCorrect) onPlayCorrect();
      } else {
        setFeedback('wrong');
        setWrongCount((w) => w + 1);
        if (onPlayWrong) onPlayWrong();
      }

      patternStepRef.current += 1;
      const nextStep = patternStepRef.current;
      const nextCorrect = correctCountRef.current;
      const startTime = roundStartTimeRef.current;
      const delayMs = isCorrect ? CORRECT_DELAY_MS : WRONG_DELAY_MS;

      setTimeout(() => {
        if (gameStateRef.current === 'playing') {
          const room = activeRoomRef.current;
          const myProfile = getStoredPlayerProfile();
          const isHost = !room || room.hostId === myProfile.id;

          if (isHost) {
            const nextQuestion = generateQuestion(nextStep, nextCorrect, startTime);
            setFeedback('none');
            setSelectedOption(null);
            setCurrentQuestion(nextQuestion);

            if (room) {
              // Sync to Firebase for all players in room
              multiplayerService.syncNextQuestion(room.roomId, nextStep, nextQuestion);
            }
            isTransitioningRef.current = false;
          }
        } else {
          isTransitioningRef.current = false;
        }
      }, delayMs);
    },
    [currentQuestion, generateQuestion, onPlayCorrect, onPlayWrong]
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
    gameMode,
    updateGameMode,
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
    generateQuestion,
  };
}
