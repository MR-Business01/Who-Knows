import React, { useState } from 'react';
import { multiplayerService, type RoomSession } from '../services/multiplayerService';
import { Users, X, PlusCircle, LogIn, Sparkles } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [activeRoom, setActiveRoom] = useState<RoomSession | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const created = multiplayerService.createRoom(roomName || "Cars Speed Room", "Driver 1");
    setActiveRoom(created);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const joined = multiplayerService.joinRoom(joinCode || "CAR-9999", "Player 2");
    setActiveRoom(joined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Friends Room Lobby</h2>
            <p className="text-xs text-slate-400">Multiplayer Session Feature</p>
          </div>
        </div>

        {activeRoom ? (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-800/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">ROOM CODE</span>
                <div className="text-xl font-black text-indigo-200 font-mono">{activeRoom.roomId}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                ● LOBBY READY
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>PLAYERS IN ROOM</span>
                <span className="text-slate-400 font-mono">{activeRoom.players.length} / {activeRoom.maxPlayers}</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {activeRoom.players.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-bold text-slate-200">{p.name}</span>
                    </div>
                    {p.isHost && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-indigo-300/80 font-medium">
              💡 Friends session game logic ready for Socket.io / Firebase sync.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleCreateRoom} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Create Friends Room</label>
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
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </form>

            <div className="w-full h-px bg-slate-800 my-2" />

            <form onSubmit={handleJoinRoom} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Join via Room Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. CAR-1234)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join</span>
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-left text-xs text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Invite your friends for real-time multiplayer logo racing sessions!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
