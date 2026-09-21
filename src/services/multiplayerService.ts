import { db } from './firebase';
import { ref, set, get, update, remove, onValue, off, type Unsubscribe } from 'firebase/database';
import type { TimerSetting, DifficultySetting, GameMode, QuestionItem } from '../hooks/useGameEngine';

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

export const AVATAR_OPTIONS = ['🏎️', '⚡', '🚀', '🏆', '👑', '🦁', '🐯', '🎯', '🏁', '🔥', '💎', '🌟'];

// Clean 6-character random alphanumeric room code
export function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getStoredPlayerProfile(): { name: string; avatar: string; id: string } {
  const name = localStorage.getItem('cars_quiz_player_name') || 'Racer ' + Math.floor(10 + Math.random() * 90);
  const avatar = localStorage.getItem('cars_quiz_player_avatar') || AVATAR_OPTIONS[0];
  let id = localStorage.getItem('cars_quiz_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('cars_quiz_player_id', id);
  }
  return { name, avatar, id };
}

export function saveStoredPlayerProfile(name: string, avatar: string): void {
  localStorage.setItem('cars_quiz_player_name', name);
  localStorage.setItem('cars_quiz_player_avatar', avatar);
}

class MultiplayerService {
  private activeSubscriptions = new Map<string, Unsubscribe>();

  // Real-time listener subscription (Isolated per roomId)
  public subscribeToRoom(roomId: string, callback: (room: RoomSession | null) => void): () => void {
    const existing = this.activeSubscriptions.get(roomId);
    if (existing) {
      existing();
      this.activeSubscriptions.delete(roomId);
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val() as RoomSession;
          if (!rawData.players) rawData.players = {};
          callback(rawData);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`[Firebase] Subscription error on room ${roomId}:`, error);
        callback(null);
      }
    );

    this.activeSubscriptions.set(roomId, unsubscribe);

    return () => {
      off(roomRef);
      this.activeSubscriptions.delete(roomId);
    };
  }

  // Create Room in Firebase DB
  public async createRoom(
    roomName: string,
    playerName: string,
    avatar: string,
    maxPlayers: 2 | 4 | 6 | 8 = 8,
    timerSetting: TimerSetting = 30,
    difficultySetting: DifficultySetting = 'random',
    gameMode: GameMode = 'cars'
  ): Promise<RoomSession> {
    const profile = getStoredPlayerProfile();
    const finalName = playerName.trim() || profile.name;
    const finalAvatar = avatar || profile.avatar;
    saveStoredPlayerProfile(finalName, finalAvatar);

    const roomId = generateRandomRoomCode();
    const hostPlayer: PlayerProfile = {
      id: profile.id,
      name: finalName,
      avatar: finalAvatar,
      score: 0,
      isHost: true,
      joinedAt: Date.now(),
    };

    const roomData: RoomSession = {
      roomId,
      roomName: roomName.trim() || 'Speed Room',
      status: 'lobby',
      maxPlayers,
      timerSetting,
      difficultySetting,
      gameMode,
      hostId: profile.id,
      players: {
        [profile.id]: hostPlayer,
      },
      currentQuestionIndex: 0,
      createdAt: Date.now(),
    };

    const roomRef = ref(db, `rooms/${roomId}`);
    await set(roomRef, roomData);
    return roomData;
  }

  // Join Room in Firebase DB
  public async joinRoom(
    roomIdInput: string,
    playerName: string,
    avatar: string
  ): Promise<{ success: boolean; room?: RoomSession; error?: string }> {
    const cleanRoomId = roomIdInput.trim().toUpperCase();
    if (!cleanRoomId) {
      return { success: false, error: 'Please enter a valid room code.' };
    }

    const roomRef = ref(db, `rooms/${cleanRoomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Room code not found. Please check code.' };
    }

    const roomData = snapshot.val() as RoomSession;
    const currentPlayers = roomData.players ? Object.values(roomData.players) : [];

    if (currentPlayers.length >= roomData.maxPlayers) {
      return { success: false, error: `Room is full (${currentPlayers.length}/${roomData.maxPlayers} players).` };
    }

    if (roomData.status !== 'lobby') {
      return { success: false, error: 'Game is already in progress in this room.' };
    }

    const profile = getStoredPlayerProfile();
    const finalName = playerName.trim() || profile.name;
    const finalAvatar = avatar || profile.avatar;
    saveStoredPlayerProfile(finalName, finalAvatar);

    const newPlayer: PlayerProfile = {
      id: profile.id,
      name: finalName,
      avatar: finalAvatar,
      score: 0,
      isHost: profile.id === roomData.hostId,
      joinedAt: Date.now(),
    };

    const playerRef = ref(db, `rooms/${cleanRoomId}/players/${profile.id}`);
    await set(playerRef, newPlayer);

    roomData.players[profile.id] = newPlayer;
    return { success: true, room: roomData };
  }

  // Update Max Players capacity
  public async updateMaxPlayers(roomId: string, maxPlayers: 2 | 4 | 6 | 8): Promise<void> {
    const roomRef = ref(db, `rooms/${roomId}`);
    await update(roomRef, { maxPlayers });
  }

  // Kick Player (Host action)
  public async kickPlayer(roomId: string, playerId: string): Promise<void> {
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    await remove(playerRef);
  }

  // Leave Room
  public async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const unsub = this.activeSubscriptions.get(roomId);
    if (unsub) {
      unsub();
      this.activeSubscriptions.delete(roomId);
    }
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    await remove(playerRef);
  }

  // Start Game (Host action)
  public async startGame(roomId: string, initialQuestion?: QuestionItem): Promise<void> {
    const roomRef = ref(db, `rooms/${roomId}`);
    const updatePayload: Partial<RoomSession> = {
      status: 'playing',
      currentQuestionIndex: 0,
    };
    if (initialQuestion) {
      updatePayload.currentQuestion = initialQuestion;
    }
    await update(roomRef, updatePayload);
  }

  // Host-Authoritative: Advance Question
  public async syncNextQuestion(roomId: string, questionIndex: number, nextQuestion: QuestionItem): Promise<void> {
    const roomRef = ref(db, `rooms/${roomId}`);
    await update(roomRef, {
      currentQuestionIndex: questionIndex,
      currentQuestion: nextQuestion,
    });
  }

  // Sync Player Score
  public async updatePlayerScore(roomId: string, playerId: string, newScore: number): Promise<void> {
    const scoreRef = ref(db, `rooms/${roomId}/players/${playerId}/score`);
    await set(scoreRef, newScore);
  }
}

export const multiplayerService = new MultiplayerService();
