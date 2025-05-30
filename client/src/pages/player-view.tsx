import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BuzzerButton } from "@/components/buzzer-button";
import { useWebSocket } from "@/hooks/use-websocket";
import type { GameRoom, Player, WebSocketMessage, BuzzerPressData } from "@shared/schema";

interface PlayerViewProps {
  roomCode: string;
  playerId: string;
}

export default function PlayerView({ roomCode, playerId }: PlayerViewProps) {
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [firstToBuzz, setFirstToBuzz] = useState<BuzzerPressData | null>(null);
  const [buzzerEnabled, setBuzzerEnabled] = useState(false);

  const { data } = useQuery({
    queryKey: [`/api/rooms/${roomCode}`],
    refetchInterval: 2000,
  });

  const room = data?.room as GameRoom | undefined;
  const players = (data?.players as Player[]) || [];
  const currentPlayer = players.find(p => p.id === playerId);

  // Update buzzer state based on room data
  useEffect(() => {
    if (room) {
      setBuzzerEnabled(room.buzzerEnabled);
      
      // Check if someone buzzed first
      if (room.firstToBuzzPlayerId && !firstToBuzz) {
        const buzzedPlayer = players.find(p => p.id === room.firstToBuzzPlayerId);
        if (buzzedPlayer && buzzedPlayer.buzzTime) {
          setFirstToBuzz({
            playerId: buzzedPlayer.id,
            playerName: buzzedPlayer.name,
            timestamp: new Date(buzzedPlayer.buzzTime).getTime(),
            buzzTime: buzzedPlayer.buzzTime.toISOString()
          });
        }
      }

      // Reset state when buzzers are reset
      if (!room.firstToBuzzPlayerId) {
        setFirstToBuzz(null);
        setHasBuzzed(false);
      }
    }
  }, [room, players, firstToBuzz]);

  // Update player's buzz status
  useEffect(() => {
    if (currentPlayer) {
      setHasBuzzed(currentPlayer.hasBuzzed);
    }
  }, [currentPlayer]);

  const { sendMessage } = useWebSocket(`/ws`, {
    roomCode,
    playerId,
  });

  const handleBuzz = () => {
    if (!buzzerEnabled || hasBuzzed || firstToBuzz) return;
    
    sendMessage({
      type: 'buzzer_pressed',
      roomCode,
      playerId,
    });
  };

  const getPlayerColor = (color: string) => {
    const colorMap = {
      blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', glow: 'shadow-blue-500/30' },
      green: { bg: 'bg-green-500', hover: 'hover:bg-green-600', glow: 'shadow-green-500/30' },
      amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', glow: 'shadow-amber-500/30' },
      purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', glow: 'shadow-purple-500/30' },
      cyan: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', glow: 'shadow-cyan-500/30' },
      red: { bg: 'bg-red-500', hover: 'hover:bg-red-600', glow: 'shadow-red-500/30' },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Player not found</div>
      </div>
    );
  }

  const playerColors = getPlayerColor(currentPlayer.color);
  const isFirstToBuzz = firstToBuzz?.playerId === playerId;
  const isDisabled = !buzzerEnabled || hasBuzzed || (firstToBuzz && !isFirstToBuzz);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${playerColors.bg} p-2 rounded-lg`}>
              <User className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{currentPlayer.name}</h1>
              <p className="text-gray-400 text-sm">Room: {roomCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentPlayer.isConnected 
                ? 'bg-green-500 text-green-100' 
                : 'bg-red-500 text-red-100'
            }`}>
              {currentPlayer.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Game Status */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Round {room?.currentRound || 1} - Question 5</h2>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="bg-gray-700 rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold text-green-500">03:45</div>
                  <div className="text-gray-400 text-sm">Time Remaining</div>
                </div>
                <div className="bg-gray-700 rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold text-blue-500">150</div>
                  <div className="text-gray-400 text-sm">Points</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${
                  buzzerEnabled 
                    ? 'bg-green-500 text-green-100' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                  {buzzerEnabled ? 'Buzzers Ready' : 'Buzzers Disabled'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* First to Buzz Display */}
          {firstToBuzz && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-white text-center">First to Buzz</h3>
                <div className={`rounded-lg p-6 text-center shadow-lg ${
                  isFirstToBuzz 
                    ? `bg-gradient-to-r from-purple-500 to-purple-600 ${playerColors.glow}` 
                    : 'bg-gray-700'
                }`}>
                  <div className="text-2xl font-bold text-white mb-2">{firstToBuzz.playerName}</div>
                  <div className={isFirstToBuzz ? 'text-purple-200' : 'text-gray-400'}>
                    <span className="mr-2">⏱️</span>
                    {new Date(firstToBuzz.timestamp).toLocaleTimeString()}
                  </div>
                  {isFirstToBuzz && (
                    <div className="mt-2 text-purple-200 font-medium animate-pulse">
                      You buzzed first! 🎉
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Player Buzzer */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mb-4">
                  <div className={`w-20 h-20 ${playerColors.bg} rounded-full mx-auto mb-4 flex items-center justify-center ${
                    isFirstToBuzz ? 'animate-pulse' : ''
                  }`}>
                    <User className="text-white text-3xl" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">{currentPlayer.name}</h4>
                  <p className="text-gray-400">Player {players.findIndex(p => p.id === playerId) + 1}</p>
                </div>
                
                <BuzzerButton
                  color={currentPlayer.color}
                  disabled={isDisabled}
                  hasBuzzed={hasBuzzed}
                  isFirstToBuzz={isFirstToBuzz}
                  onClick={handleBuzz}
                />
                
                <div className="text-lg">
                  {hasBuzzed && isFirstToBuzz && (
                    <span className="text-purple-400 font-bold animate-pulse">First to buzz! 🎉</span>
                  )}
                  {hasBuzzed && !isFirstToBuzz && (
                    <span className="text-red-400">You buzzed in</span>
                  )}
                  {!hasBuzzed && !buzzerEnabled && (
                    <span className="text-gray-400">Waiting for host...</span>
                  )}
                  {!hasBuzzed && buzzerEnabled && !firstToBuzz && (
                    <span className="text-green-400">Ready to buzz!</span>
                  )}
                  {!hasBuzzed && firstToBuzz && !isFirstToBuzz && (
                    <span className="text-gray-400">Someone else buzzed first</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Players */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-white text-center">Other Players</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {players.filter(p => p.id !== playerId).map((player) => {
                  const colors = getPlayerColor(player.color);
                  return (
                    <div key={player.id} className="bg-gray-700 rounded-lg p-4 text-center">
                      <div className={`w-12 h-12 ${colors.bg} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                        <User className="text-white" />
                      </div>
                      <div className="font-medium text-white text-sm">{player.name}</div>
                      <div className={`text-xs mt-1 ${
                        player.isConnected ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {player.isConnected ? 'Connected' : 'Offline'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
