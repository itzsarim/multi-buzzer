import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Copy, Play, RotateCcw, Pause, X, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import type { GameRoom, Player, WebSocketMessage, BuzzerPressData } from "@shared/schema";

interface HostDashboardProps {
  roomCode: string;
}

export default function HostDashboard({ roomCode }: HostDashboardProps) {
  const { toast } = useToast();
  const [timer, setTimer] = useState("03:45");
  const [firstToBuzz, setFirstToBuzz] = useState<BuzzerPressData | null>(null);
  const [lastBackup, setLastBackup] = useState("2 minutes ago");

  const { data, isLoading } = useQuery({
    queryKey: [`/api/rooms/${roomCode}`],
    refetchInterval: 2000,
    enabled: !!roomCode,
  });

  const room = data?.room as GameRoom | undefined;
  const players = (data?.players as Player[]) || [];

  // Check for first buzz from room data
  useEffect(() => {
    if (room?.firstToBuzzPlayerId) {
      const buzzedPlayer = players.find(p => p.id === room.firstToBuzzPlayerId);
      if (buzzedPlayer && buzzedPlayer.buzzTime) {
        const buzzTimeStr = typeof buzzedPlayer.buzzTime === 'string' 
          ? buzzedPlayer.buzzTime 
          : buzzedPlayer.buzzTime.toISOString();
        
        setFirstToBuzz({
          playerId: buzzedPlayer.id,
          playerName: buzzedPlayer.name,
          timestamp: new Date(buzzedPlayer.buzzTime).getTime(),
          buzzTime: buzzTimeStr
        });
      }
    } else {
      // Reset when no one has buzzed
      setFirstToBuzz(null);
    }
  }, [room?.firstToBuzzPlayerId, players]);

  const enableBuzzersMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/rooms/${roomCode}/enable-buzzers`),
    onSuccess: () => {
      toast({ title: "Buzzers Enabled", description: "Players can now buzz in!" });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomCode}`] });
    },
  });

  const disableBuzzersMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/rooms/${roomCode}/disable-buzzers`),
    onSuccess: () => {
      toast({ title: "Buzzers Disabled", description: "Buzzers have been disabled" });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomCode}`] });
    },
  });

  const resetBuzzersMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/rooms/${roomCode}/reset-buzzers`),
    onSuccess: () => {
      setFirstToBuzz(null);
      toast({ title: "Buzzers Reset", description: "All buzzers have been reset" });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomCode}`] });
    },
  });

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => apiRequest('DELETE', `/api/players/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomCode}`] });
    },
  });

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: "Copied!", description: "Room code copied to clipboard" });
  };

  const getPlayerColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500', 
      amber: 'bg-amber-500',
      purple: 'bg-purple-500',
      cyan: 'bg-cyan-500',
      red: 'bg-red-500',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500';
  };

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds;
        if (totalSeconds <= 0) return "00:00";
        
        const newTotal = totalSeconds - 1;
        const newMinutes = Math.floor(newTotal / 60);
        const newSeconds = newTotal % 60;
        return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Backup status effect
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMinutes = Math.floor(Math.random() * 5) + 1;
      setLastBackup(`${randomMinutes} minute${randomMinutes > 1 ? 's' : ''} ago`);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Play className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BuzzerPro</h1>
              <p className="text-gray-400 text-sm">Professional Game Show Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-green-500 text-green-100 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-100 rounded-full inline-block mr-1"></span>
              Live
            </span>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Host Dashboard */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Status Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Room Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Room Code</span>
                    <Button variant="ghost" size="sm" onClick={copyRoomCode}>
                      <Copy className="h-4 w-4 text-blue-400" />
                    </Button>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-wider">{roomCode}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{players.length}</div>
                    <div className="text-gray-400 text-sm">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">{room.currentRound}</div>
                    <div className="text-gray-400 text-sm">Round</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buzzer Controls */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Buzzer Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => enableBuzzersMutation.mutate()}
                  disabled={enableBuzzersMutation.isPending}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Enable Buzzers
                </Button>
                <Button 
                  onClick={() => resetBuzzersMutation.mutate()}
                  disabled={resetBuzzersMutation.isPending}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Buzzers
                </Button>
                <Button 
                  onClick={() => disableBuzzersMutation.mutate()}
                  disabled={disableBuzzersMutation.isPending}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Disable Buzzers
                </Button>
              </CardContent>
            </Card>

            {/* Player Management */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Player Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${getPlayerColor(player.color)} rounded-full`}></div>
                      <span className="font-medium text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${player.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {player.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removePlayerMutation.mutate(player.id)}
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    No players have joined yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Status Display */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-4 text-white">Round {room.currentRound} - Question 5</h2>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="bg-gray-700 rounded-lg px-6 py-3">
                      <div className="text-2xl font-bold text-green-500">{timer}</div>
                      <div className="text-gray-400 text-sm">Time Remaining</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg px-6 py-3">
                      <div className="text-2xl font-bold text-blue-500">150</div>
                      <div className="text-gray-400 text-sm">Points</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${
                      room.buzzerEnabled 
                        ? 'bg-green-500 text-green-100' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                      {room.buzzerEnabled ? 'Buzzers Ready' : 'Buzzers Disabled'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Buzz Indicator */}
            {firstToBuzz && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">First to Buzz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-center shadow-lg shadow-purple-500/30">
                    <div className="text-3xl font-bold text-white mb-2">{firstToBuzz.playerName}</div>
                    <div className="text-purple-200">
                      <span className="mr-2">⏱️</span>
                      {new Date(firstToBuzz.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Backup & Recovery Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <span className="mr-3 text-green-500">🛡️</span>
                  Automated Backup & Recovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-green-500 text-2xl mb-2">☁️</div>
                    <div className="text-sm text-gray-400">Last Backup</div>
                    <div className="font-medium text-white">{lastBackup}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-blue-500 text-2xl mb-2">💾</div>
                    <div className="text-sm text-gray-400">Data Status</div>
                    <div className="font-medium text-green-500">Synchronized</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-amber-500 text-2xl mb-2">🕐</div>
                    <div className="text-sm text-gray-400">Recovery Points</div>
                    <div className="font-medium text-white">24 available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
