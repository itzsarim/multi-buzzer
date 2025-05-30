import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameRoomSchema, insertPlayerSchema, type WebSocketMessage, type BuzzerPressData } from "@shared/schema";
import { z } from "zod";

const roomConnections = new Map<string, Set<WebSocket>>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

function getPlayerColor(playerCount: number): string {
  const colors = ['blue', 'green', 'amber', 'purple', 'cyan', 'red'];
  return colors[playerCount % colors.length];
}

function broadcastToRoom(roomCode: string, message: WebSocketMessage) {
  const connections = roomConnections.get(roomCode);
  if (connections) {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let playerRoomCode: string | null = null;
    let playerId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage & { playerId?: string };
        
        if (message.type === 'join_room') {
          playerRoomCode = message.roomCode;
          playerId = message.playerId || null;
          
          if (!roomConnections.has(playerRoomCode)) {
            roomConnections.set(playerRoomCode, new Set());
          }
          roomConnections.get(playerRoomCode)!.add(ws);

          // Update player connection status
          if (playerId) {
            await storage.updatePlayer(playerId, { isConnected: true });
          }

          // Broadcast updated room state
          const players = await storage.getPlayersByRoom(playerRoomCode);
          broadcastToRoom(playerRoomCode, {
            type: 'room_updated',
            roomCode: playerRoomCode,
            data: { players }
          });
        }
        
        if (message.type === 'buzzer_pressed' && playerRoomCode && playerId) {
          const room = await storage.getRoom(playerRoomCode);
          if (room?.buzzerEnabled && !room.firstToBuzzPlayerId) {
            const timestamp = Date.now();
            const player = await storage.getPlayer(playerId);
            
            if (player && !player.hasBuzzed) {
              // Update room with first buzzer
              await storage.updateRoom(playerRoomCode, { 
                firstToBuzzPlayerId: playerId 
              });
              
              // Update player
              await storage.updatePlayer(playerId, { 
                hasBuzzed: true, 
                buzzTime: new Date(timestamp) 
              });

              const buzzerData: BuzzerPressData = {
                playerId,
                playerName: player.name,
                timestamp,
                buzzTime: new Date(timestamp).toISOString()
              };

              // Broadcast buzzer press
              broadcastToRoom(playerRoomCode, {
                type: 'buzzer_pressed',
                roomCode: playerRoomCode,
                data: buzzerData
              });
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (playerRoomCode) {
        const connections = roomConnections.get(playerRoomCode);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            roomConnections.delete(playerRoomCode);
          }
        }

        // Update player connection status
        if (playerId) {
          await storage.updatePlayer(playerId, { isConnected: false });
          
          // Broadcast updated room state
          const players = await storage.getPlayersByRoom(playerRoomCode);
          broadcastToRoom(playerRoomCode, {
            type: 'room_updated',
            roomCode: playerRoomCode,
            data: { players }
          });
        }
      }
    });
  });

  // Create game room
  app.post('/api/rooms', async (req, res) => {
    try {
      const code = generateRoomCode();
      const hostId = req.body.hostId || 'host_' + Math.random().toString(36).substr(2, 9);
      
      const roomData = insertGameRoomSchema.parse({ code, hostId });
      const room = await storage.createRoom(roomData);
      
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create room', error: error.message });
    }
  });

  // Get room details
  app.get('/api/rooms/:code', async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.code);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      const players = await storage.getPlayersByRoom(room.code);
      res.json({ room, players });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get room', error: error.message });
    }
  });

  // Join room
  app.post('/api/rooms/:code/join', async (req, res) => {
    try {
      const { name } = req.body;
      const roomCode = req.params.code;
      
      if (!name) {
        return res.status(400).json({ message: 'Player name is required' });
      }

      const room = await storage.getRoom(roomCode);
      if (!room || !room.isActive) {
        return res.status(404).json({ message: 'Room not found or inactive' });
      }

      const existingPlayers = await storage.getPlayersByRoom(roomCode);
      if (existingPlayers.length >= 6) {
        return res.status(400).json({ message: 'Room is full' });
      }

      const playerId = generatePlayerId();
      const color = getPlayerColor(existingPlayers.length);
      
      const playerData = insertPlayerSchema.parse({
        id: playerId,
        name,
        roomCode,
        color
      });
      
      const player = await storage.addPlayer(playerData);
      
      // Broadcast player joined
      broadcastToRoom(roomCode, {
        type: 'player_joined',
        roomCode,
        data: player
      });

      res.json(player);
    } catch (error) {
      res.status(400).json({ message: 'Failed to join room', error: error.message });
    }
  });

  // Host controls
  app.post('/api/rooms/:code/enable-buzzers', async (req, res) => {
    try {
      const room = await storage.updateRoom(req.params.code, { buzzerEnabled: true });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      broadcastToRoom(req.params.code, {
        type: 'buzzer_enabled',
        roomCode: req.params.code,
        data: { buzzerEnabled: true }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to enable buzzers', error: error.message });
    }
  });

  app.post('/api/rooms/:code/disable-buzzers', async (req, res) => {
    try {
      const room = await storage.updateRoom(req.params.code, { buzzerEnabled: false });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      broadcastToRoom(req.params.code, {
        type: 'buzzer_disabled',
        roomCode: req.params.code,
        data: { buzzerEnabled: false }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to disable buzzers', error: error.message });
    }
  });

  app.post('/api/rooms/:code/reset-buzzers', async (req, res) => {
    try {
      const roomCode = req.params.code;
      
      // Reset room state
      await storage.updateRoom(roomCode, { firstToBuzzPlayerId: null });
      
      // Reset all players in room
      const players = await storage.getPlayersByRoom(roomCode);
      for (const player of players) {
        await storage.updatePlayer(player.id, { 
          hasBuzzed: false, 
          buzzTime: null 
        });
      }

      broadcastToRoom(roomCode, {
        type: 'buzzer_reset',
        roomCode,
        data: { reset: true }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to reset buzzers', error: error.message });
    }
  });

  // Remove player
  app.delete('/api/players/:id', async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }

      const removed = await storage.removePlayer(req.params.id);
      if (removed) {
        broadcastToRoom(player.roomCode, {
          type: 'player_left',
          roomCode: player.roomCode,
          data: { playerId: req.params.id }
        });
      }

      res.json({ success: removed });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove player', error: error.message });
    }
  });

  return httpServer;
}
