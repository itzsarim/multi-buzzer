import { useEffect, useRef, useState } from "react";
import type { WebSocketMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  roomCode?: string;
  playerId?: string;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { onMessage, roomCode, playerId } = options;
  const [isConnected, setIsConnected] = useState(true);

  const sendMessage = async (message: Partial<WebSocketMessage>) => {
    if (message.type === 'buzzer_pressed' && roomCode && playerId) {
      try {
        await apiRequest('POST', `/api/rooms/${roomCode}/buzz`, {
          playerId
        });
      } catch (error) {
        console.error('Failed to send buzzer press:', error);
      }
    }
  };

  // Simulate connected state for now
  useEffect(() => {
    setIsConnected(true);
  }, []);

  return { isConnected, sendMessage };
}
