import React, { useState, useEffect } from 'react';
import {
  multiplayerService,
  getStoredPlayerProfile,
  AVATAR_OPTIONS,
} from '../services/multiplayerService';
import type { TimerSetting, DifficultySetting, GameMode, RoomSession } from '../types/quiz';
import { generateQuestionPool } from '../utils/questionGenerator';
import {
  Users,
  X,
  PlusCircle,
  LogIn,
  Copy,
  Check,
  UserCheck,
  Trash2,
  Hourglass,
  ShieldAlert,
  Play,
  ArrowLeft,
} from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (room: RoomSession) => void;
  currentTimerSetting: TimerSetting;
  currentDifficultySetting: DifficultySetting;
  currentGameMode: GameMode;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  currentTimerSetting,
  currentDifficultySetting,
  currentGameMode,
}) => {
  const [profile] = useState(() => getStoredPlayerProfile());
  const [playerName, setPlayerName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const [modeView, setModeView] = useState<'choice' | 'create' | 'join'>('choice');
  const [roomName, setRoomName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [maxPlayersSetting, setMaxPlayersSetting] = useState<2 | 4 | 6 | 8>(8);

  const [activeRoom, setActiveRoom] = useState<RoomSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Subscribe to Realtime Firebase updates when activeRoom is active
  useEffect(() => {
    const roomId = activeRoom?.roomId;
    if (!roomId) return;

    const unsubscribe = multiplayerService.subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setActiveRoom(updatedRoom);
        // If Host started the game, trigger match start on all connected devices
        if (updatedRoom.status === 'playing') {
          onStartMatch(updatedRoom);
          onClose();
        }
      } else {
        setActiveRoom(null);
        setErrorMessage('You left or room was closed.');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoom?.roomId]);

  if (!isOpen) return null;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const created = await multiplayerService.createRoom(
        roomName || 'Speed Room',
        playerName,
        selectedAvatar,
        maxPlayersSetting,
        currentTimerSetting,
        currentDifficultySetting,
        currentGameMode
      );
      setActiveRoom(created);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await multiplayerService.joinRoom(joinCode, playerName, selectedAvatar);
      if (res.success && res.room) {
        setActiveRoom(res.room);
      } else {
        setErrorMessage(res.error || 'Failed to join room.');
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Error joining room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostStartGame = async () => {
    if (activeRoom && activeRoom.hostId === profile.id) {
      setIsLoading(true);
      const seed = Math.floor(Math.random() * 1000000);
      const startTime = Date.now();
      const pool = generateQuestionPool(
        activeRoom.gameMode || currentGameMode,
        activeRoom.difficultySetting || currentDifficultySetting,
        100,
        seed
      );
      const firstQ = pool[0];
      await multiplayerService.startGame(activeRoom.roomId, firstQ, seed, startTime);
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (activeRoom?.roomId) {
      navigator.clipboard.writeText(activeRoom.roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleLeave = async () => {
    if (activeRoom) {
      await multiplayerService.leaveRoom(activeRoom.roomId, profile.id);
      setActiveRoom(null);
      setModeView('choice');
    }
  };

  const handleKick = async (targetPlayerId: string) => {
    if (activeRoom) {
      await multiplayerService.kickPlayer(activeRoom.roomId, targetPlayerId);
    }
  };

  const handleHostUpdateMaxPlayers = async (limit: 2 | 4 | 6 | 8) => {
    if (activeRoom) {
      await multiplayerService.updateMaxPlayers(activeRoom.roomId, limit);
      setMaxPlayersSetting(limit);
    }
  };

  // Host ALWAYS appears at the top of the players list
  const playersList = activeRoom?.players
    ? Object.values(activeRoom.players).sort((a, b) => {
        if (a.isHost) return -1;
        if (b.isHost) return 1;
        return a.joinedAt - b.joinedAt;
      })
    : [];

  const isHost = activeRoom ? activeRoom.hostId === profile.id : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Back Button */}
        <div className="flex items-center gap-2 mb-4">
          {!activeRoom && modeView !== 'choice' && (
            <button
              onClick={() => setModeView('choice')}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Friends Room Lobby</h2>
            <p className="text-xs text-slate-400">Multiplayer Session</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Player Name & Avatar Customizer (Clean 6x2 Grid, No Overflow) */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            PLAYER PROFILE
          </label>
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              placeholder="Your Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xl p-1 bg-slate-800 rounded-xl">{selectedAvatar}</span>
          </div>

          {/* Clean 6-Column Avatar Grid without scrollbars */}
          <div className="grid grid-cols-6 gap-1.5">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`py-1 rounded-xl text-center text-sm transition-all border ${
                  selectedAvatar === av
                    ? 'bg-cyan-600/40 border-cyan-400 scale-105 shadow'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {activeRoom ? (
          /* ACTIVE LOBBY ROOM VIEW */
          <div className="space-y-4">
            {/* Room Code Box */}
            <div className="p-3.5 bg-indigo-950/50 rounded-2xl border border-indigo-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">ROOM CODE</span>
                <div className="text-2xl font-black text-indigo-100 font-mono tracking-widest">
                  {activeRoom.roomId}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="py-2 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'COPIED!' : 'COPY'}</span>
              </button>
            </div>

            {/* Players In Room */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>PLAYERS IN ROOM</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {playersList.length} / {activeRoom.maxPlayers}
                </span>
              </div>

              {/* Host Preset Max Players Selector */}
              {isHost && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-[11px] font-medium">Max Limit:</span>
                  {([2, 4, 6, 8] as const).map((limit) => (
                    <button
                      key={limit}
                      onClick={() => handleHostUpdateMaxPlayers(limit)}
                      className={`px-2 py-1 rounded-lg font-mono text-xs font-bold transition-all border ${
                        activeRoom.maxPlayers === limit
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {limit}P
                    </button>
                  ))}
                </div>
              )}

              {/* Realtime Players List (HOST ALWAYS ON TOP) */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {playersList.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      p.isHost
                        ? 'bg-indigo-950/40 border-indigo-700/60 shadow-inner'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-bold text-slate-100">{p.name}</span>
                      {p.id === profile.id && <span className="text-[10px] text-cyan-400 font-semibold">(YOU)</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.isHost && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          HOST
                        </span>
                      )}
                      {isHost && p.id !== profile.id && (
                        <button
                          onClick={() => handleKick(p.id)}
                          title="Kick Player"
                          className="p-1 rounded bg-rose-950/60 text-rose-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host START GAME Button vs Guest Waiting Indicator */}
            {isHost ? (
              <button
                onClick={handleHostStartGame}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white font-black text-base tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START GAME NOW</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 text-center text-xs text-indigo-200 font-medium flex items-center justify-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Wait other players or host starts the game</span>
              </div>
            )}

            {/* Leave Room Button */}
            <button
              onClick={handleLeave}
              className="w-full py-2.5 rounded-2xl glass-button text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              LEAVE ROOM
            </button>
          </div>
        ) : modeView === 'choice' ? (
          /* INITIAL CHOICE STEP (Create vs Join) */
          <div className="space-y-3 py-2">
            <button
              onClick={() => setModeView('create')}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-cyan-300" />
                <div className="text-left">
                  <div className="text-sm font-black">CREATE A ROOM</div>
                  <div className="text-[11px] text-indigo-200 font-normal">Host a game for your friends</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setModeView('join')}
              className="w-full py-4 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center justify-between shadow-md active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <div className="text-sm font-black">JOIN A ROOM</div>
                  <div className="text-[11px] text-slate-400 font-normal">Enter code to join friends</div>
                </div>
              </div>
            </button>

            <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Realtime cross-device session active</span>
            </div>
          </div>
        ) : modeView === 'create' ? (
          /* CREATE ROOM FORM ONLY */
          <div className="space-y-4">
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Create Room Settings
              </label>

              {/* Max Players Selector (2, 4, 6, 8) */}
              <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Max Players:</span>
                <div className="flex gap-1">
                  {([2, 4, 6, 8] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayersSetting(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                        maxPlayersSetting === num
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num}P
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Room Name (e.g. Speed Kings)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>CREATE ROOM NOW</span>
              </button>
            </form>
          </div>
        ) : (
          /* JOIN ROOM FORM ONLY */
          <div className="space-y-4">
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Enter Private Room Code
              </label>

              <input
                type="text"
                placeholder="Enter Code (e.g. X7K9P2)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono tracking-widest text-center font-black"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>JOIN ROOM NOW</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
