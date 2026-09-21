import React, { useState, useEffect } from 'react';
import {
  multiplayerService,
  getStoredPlayerProfile,
  AVATAR_OPTIONS,
  type RoomSession,
} from '../services/multiplayerService';
import type { TimerSetting, DifficultySetting, GameMode } from '../hooks/useGameEngine';
import { Users, X, PlusCircle, LogIn, Copy, Check, UserCheck, Trash2, Hourglass, ShieldAlert } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimerSetting: TimerSetting;
  currentDifficultySetting: DifficultySetting;
  currentGameMode: GameMode;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  currentTimerSetting,
  currentDifficultySetting,
  currentGameMode,
}) => {
  const [profile] = useState(() => getStoredPlayerProfile());
  const [playerName, setPlayerName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const [roomName, setRoomName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [maxPlayersSetting, setMaxPlayersSetting] = useState<2 | 4 | 6 | 8>(8);

  const [activeRoom, setActiveRoom] = useState<RoomSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Subscribe to Realtime Firebase updates when activeRoom is active
  useEffect(() => {
    if (!activeRoom?.roomId) return;

    const unsubscribe = multiplayerService.subscribeToRoom(activeRoom.roomId, (updatedRoom) => {
      if (updatedRoom) {
        setActiveRoom(updatedRoom);
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

  const playersList = activeRoom?.players ? Object.values(activeRoom.players) : [];
  const isHost = activeRoom ? activeRoom.hostId === profile.id : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
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

        {/* Player Name & Avatar Customizer */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            PLAYER PROFILE
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Your Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xl p-1 bg-slate-800 rounded-xl">{selectedAvatar}</span>
          </div>

          {/* Avatar selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`p-1.5 rounded-xl text-sm transition-all border ${
                  selectedAvatar === av
                    ? 'bg-cyan-600/40 border-cyan-400 scale-110'
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

              {/* Realtime Players List */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {playersList.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
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

            {/* Subtitle Footer Message */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 text-center text-xs text-indigo-200 font-medium flex items-center justify-center gap-2">
              <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Wait other players or host starts the game</span>
            </div>

            {/* Leave Room Button */}
            <button
              onClick={handleLeave}
              className="w-full py-2.5 rounded-2xl glass-button text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              LEAVE ROOM
            </button>
          </div>
        ) : (
          /* CREATE / JOIN TABS */
          <div className="space-y-4">
            {/* Create Room Form */}
            <form onSubmit={handleCreateRoom} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Create Friends Room</label>

              {/* Max Players Selector (2, 4, 6, 8) */}
              <div className="flex items-center justify-between gap-2 mb-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Max Players:</span>
                <div className="flex gap-1">
                  {([2, 4, 6, 8] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayersSetting(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                        maxPlayersSetting === num
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room Name (e.g. Speed Kings)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </form>

            <div className="w-full h-px bg-slate-800 my-2" />

            {/* Join Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Join via Room Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. X7K9P2)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono tracking-wider font-bold"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join</span>
                </button>
              </div>
            </form>

            <div className="mt-3 p-2.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-center text-xs text-slate-300 flex items-center justify-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Realtime cross-device sync active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
