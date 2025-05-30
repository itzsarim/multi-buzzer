import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  onRemove?: (playerId: string) => void;
  showRemoveButton?: boolean;
}

export function PlayerCard({ player, onRemove, showRemoveButton = false }: PlayerCardProps) {
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

  return (
    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
      <div className="flex items-center space-x-3">
        <div className={cn("w-4 h-4 rounded-full", getPlayerColor(player.color))}></div>
        <span className="font-medium text-white">{player.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={cn(
          "text-sm",
          player.isConnected ? 'text-green-400' : 'text-red-400'
        )}>
          {player.isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {showRemoveButton && onRemove && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(player.id)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
