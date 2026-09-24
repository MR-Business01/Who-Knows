import type { CarLogo } from '../data/carLogos';
import type { CountryFlag } from '../data/flagLogos';

export type GameMode = 'cars' | 'flags' | 'capitals';
export type TimerSetting = 15 | 30 | 60 | 90;
export type DifficultySetting = 'easy' | 'medium' | 'hard' | 'random';
export type FeedbackState = 'none' | 'correct' | 'wrong';

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

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  joinedAt: number;
}

export interface RoomSession {
  roomId: string;
  roomName: string;
  status: 'lobby' | 'playing' | 'ended';
  maxPlayers: 2 | 4 | 6 | 8;
  timerSetting: TimerSetting;
  difficultySetting: DifficultySetting;
  gameMode: GameMode;
  hostId: string;
  players: Record<string, PlayerProfile>;
  currentQuestionIndex?: number;
  currentQuestion?: QuestionItem;
  createdAt: number;
}
