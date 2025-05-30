import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { GameRoom, Player } from "@shared/schema";

interface RoomStatusProps {
  room: GameRoom;
  players: Player[];
}

export function RoomStatus({ room, players }: RoomStatusProps) {
  const { toast } = useToast();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({ title: "Copied!", description: "Room code copied to clipboard" });
  };

  return (
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
          <div className="text-3xl font-bold text-white tracking-wider">{room.code}</div>
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
  );
}
