import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  hostId: text("host_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  buzzerEnabled: boolean("buzzer_enabled").notNull().default(false),
  currentRound: integer("current_round").notNull().default(1),
  firstToBuzzPlayerId: text("first_to_buzz_player_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  roomCode: text("room_code").notNull(),
  color: text("color").notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  hasBuzzed: boolean("has_buzzed").notNull().default(false),
  buzzTime: timestamp("buzz_time"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).pick({
  code: true,
  hostId: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  id: true,
  name: true,
  roomCode: true,
  color: true,
});

export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// WebSocket message types
export interface WebSocketMessage {
  type: 'player_joined' | 'player_left' | 'buzzer_pressed' | 'buzzer_enabled' | 'buzzer_disabled' | 'buzzer_reset' | 'room_updated' | 'join_room';
  data?: any;
  roomCode: string;
  playerId?: string;
}

export interface BuzzerPressData {
  playerId: string;
  playerName: string;
  timestamp: number;
  buzzTime: string;
}
