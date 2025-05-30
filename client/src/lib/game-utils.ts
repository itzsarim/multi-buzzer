export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

export function getPlayerColor(playerCount: number): string {
  const colors = ['blue', 'green', 'amber', 'purple', 'cyan', 'red'];
  return colors[playerCount % colors.length];
}

export function formatBuzzTime(timestamp: number): string {
  const seconds = (timestamp / 1000).toFixed(3);
  return `${seconds} seconds`;
}

export function getColorClasses(color: string) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-blue-500',
      border: 'border-blue-500',
      glow: 'shadow-blue-500/30'
    },
    green: {
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600',
      text: 'text-green-500',
      border: 'border-green-500',
      glow: 'shadow-green-500/30'
    },
    amber: {
      bg: 'bg-amber-500',
      hover: 'hover:bg-amber-600',
      text: 'text-amber-500',
      border: 'border-amber-500',
      glow: 'shadow-amber-500/30'
    },
    purple: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      text: 'text-purple-500',
      border: 'border-purple-500',
      glow: 'shadow-purple-500/30'
    },
    cyan: {
      bg: 'bg-cyan-500',
      hover: 'hover:bg-cyan-600',
      text: 'text-cyan-500',
      border: 'border-cyan-500',
      glow: 'shadow-cyan-500/30'
    },
    red: {
      bg: 'bg-red-500',
      hover: 'hover:bg-red-600',
      text: 'text-red-500',
      border: 'border-red-500',
      glow: 'shadow-red-500/30'
    },
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
}
