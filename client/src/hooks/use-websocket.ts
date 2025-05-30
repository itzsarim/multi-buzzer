import { useEffect, useRef, useState } from "react";
import type { WebSocketMessage } from "@shared/schema";

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  roomCode?: string;
  playerId?: string;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { onMessage, roomCode, playerId } = options;
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = (message: Partial<WebSocketMessage>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      
      // Join room on connection
      if (roomCode) {
        sendMessage({
          type: 'join_room',
          roomCode,
          playerId,
        });
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [url, roomCode, playerId, onMessage]);

  return { isConnected, sendMessage };
}
