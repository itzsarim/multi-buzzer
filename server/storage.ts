import { gameRooms, players, type GameRoom, type InsertGameRoom, type Player, type InsertPlayer } from "@shared/schema";

export interface IStorage {
  // Game Room methods
  createRoom(room: InsertGameRoom): Promise<GameRoom>;
  getRoom(code: string): Promise<GameRoom | undefined>;
  updateRoom(code: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  deleteRoom(code: string): Promise<boolean>;

  // Player methods
  addPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByRoom(roomCode: string): Promise<Player[]>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  removePlayer(id: string): Promise<boolean>;
  removePlayersByRoom(roomCode: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, GameRoom>;
  private playersMap: Map<string, Player>;
  private roomIdCounter: number;

  constructor() {
    this.rooms = new Map();
    this.playersMap = new Map();
    this.roomIdCounter = 1;
  }

  async createRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const id = this.roomIdCounter++;
    const room: GameRoom = {
      id,
      ...insertRoom,
      isActive: true,
      buzzerEnabled: false,
      currentRound: 1,
      firstToBuzzPlayerId: null,
      createdAt: new Date(),
    };
    this.rooms.set(insertRoom.code, room);
    return room;
  }

  async getRoom(code: string): Promise<GameRoom | undefined> {
    return this.rooms.get(code);
  }

  async updateRoom(code: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(code: string): Promise<boolean> {
    return this.rooms.delete(code);
  }

  async addPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const player: Player = {
      ...insertPlayer,
      isConnected: true,
      hasBuzzed: false,
      buzzTime: null,
      joinedAt: new Date(),
    };
    this.playersMap.set(insertPlayer.id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.playersMap.get(id);
  }

  async getPlayersByRoom(roomCode: string): Promise<Player[]> {
    return Array.from(this.playersMap.values()).filter(
      (player) => player.roomCode === roomCode,
    );
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.playersMap.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.playersMap.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removePlayer(id: string): Promise<boolean> {
    return this.playersMap.delete(id);
  }

  async removePlayersByRoom(roomCode: string): Promise<boolean> {
    const players = await this.getPlayersByRoom(roomCode);
    let removed = false;
    for (const player of players) {
      if (this.playersMap.delete(player.id)) {
        removed = true;
      }
    }
    return removed;
  }
}

export const storage = new MemStorage();
