import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JoinRoomModal } from "@/components/join-room-modal";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { toast } = useToast();

  const createRoom = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest('POST', '/api/rooms', {});
      const room = await response.json();
      
      toast({
        title: "Room Created!",
        description: `Room code: ${room.code}`,
      });
      
      setLocation(`/host/${room.code}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to BuzzerPro
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The ultimate real-time buzzer system for game shows, quizzes, and interactive events. 
            Host games with confidence or join as a player for the ultimate experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Host a Game */}
          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Play className="mr-3 text-blue-400" />
                Host a Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Create a new game room and manage players with professional host controls. 
                Generate room codes, control buzzers, and track responses in real-time.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Real-time player management
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Buzzer enable/disable controls
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  First-to-buzz detection
                </div>
              </div>
              <Button 
                onClick={createRoom}
                disabled={isCreating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Join a Game */}
          <Card className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Users className="mr-3 text-green-400" />
                Join a Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Enter a room code to join an existing game. Compete with other players 
                and be the first to buzz in when you know the answer.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Quick room entry
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Large buzzer buttons
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Real-time status updates
                </div>
              </div>
              <Button 
                onClick={() => setShowJoinModal(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            Professional Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="text-white text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Real-time Updates</h4>
              <p className="text-gray-400">
                Lightning-fast WebSocket connections ensure instant buzzer responses and live status updates.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Multi-player Support</h4>
              <p className="text-gray-400">
                Support for up to 6 players per room with unique color identification and player management.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Automated Backup</h4>
              <p className="text-gray-400">
                Continuous data backup and recovery ensures your game sessions are never lost.
              </p>
            </div>
          </div>
        </div>
      </div>

      <JoinRoomModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </div>
  );
}
