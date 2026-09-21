export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
}

export interface RoomSession {
  roomId: string;
  roomName: string;
  players: PlayerProfile[];
  status: 'lobby' | 'playing' | 'ended';
  maxPlayers: number;
}

// Service Stub ready for Socket.io or Firebase Realtime DB integration
class MultiplayerService {
  private currentRoom: RoomSession | null = null;

  public createRoom(roomName: string, hostName: string): RoomSession {
    const roomId = 'CAR-' + Math.floor(1000 + Math.random() * 9000);
    this.currentRoom = {
      roomId,
      roomName,
      status: 'lobby',
      maxPlayers: 8,
      players: [
        {
          id: 'player_1',
          name: hostName || 'Driver 1',
          avatar: '🏎️',
          score: 0,
          isHost: true,
        },
      ],
    };
    return this.currentRoom;
  }

  public joinRoom(roomId: string, playerName: string): RoomSession | null {
    if (!this.currentRoom || this.currentRoom.roomId !== roomId) {
      // Mock joining a demo room
      this.currentRoom = {
        roomId,
        roomName: "Friends Fast Track",
        status: 'lobby',
        maxPlayers: 8,
        players: [
          { id: 'player_host', name: 'Race Master', avatar: '🏁', score: 0, isHost: true },
          { id: 'player_2', name: playerName || 'Guest Driver', avatar: '🚗', score: 0, isHost: false },
        ],
      };
    }
    return this.currentRoom;
  }

  public getRoom(): RoomSession | null {
    return this.currentRoom;
  }
}

export const multiplayerService = new MultiplayerService();
