import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuzzerButtonProps {
  color: string;
  disabled: boolean;
  hasBuzzed: boolean;
  isFirstToBuzz?: boolean;
  onClick: () => void;
}

export function BuzzerButton({ color, disabled, hasBuzzed, isFirstToBuzz, onClick }: BuzzerButtonProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { 
        bg: 'bg-blue-500', 
        hover: 'hover:bg-blue-600', 
        glow: 'shadow-lg shadow-blue-500/30',
        glowActive: 'shadow-xl shadow-blue-500/50'
      },
      green: { 
        bg: 'bg-green-500', 
        hover: 'hover:bg-green-600', 
        glow: 'shadow-lg shadow-green-500/30',
        glowActive: 'shadow-xl shadow-green-500/50'
      },
      amber: { 
        bg: 'bg-amber-500', 
        hover: 'hover:bg-amber-600', 
        glow: 'shadow-lg shadow-amber-500/30',
        glowActive: 'shadow-xl shadow-amber-500/50'
      },
      purple: { 
        bg: 'bg-purple-500', 
        hover: 'hover:bg-purple-600', 
        glow: 'shadow-lg shadow-purple-500/30',
        glowActive: 'shadow-xl shadow-purple-500/50'
      },
      cyan: { 
        bg: 'bg-cyan-500', 
        hover: 'hover:bg-cyan-600', 
        glow: 'shadow-lg shadow-cyan-500/30',
        glowActive: 'shadow-xl shadow-cyan-500/50'
      },
      red: { 
        bg: 'bg-red-500', 
        hover: 'hover:bg-red-600', 
        glow: 'shadow-lg shadow-red-500/30',
        glowActive: 'shadow-xl shadow-red-500/50'
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const colors = getColorClasses(color);

  const getButtonState = () => {
    if (hasBuzzed) {
      if (isFirstToBuzz) {
        return {
          text: "FIRST! 🎉",
          className: "bg-purple-500 hover:bg-purple-600 shadow-xl shadow-purple-500/50 animate-pulse",
        };
      } else {
        return {
          text: "BUZZED!",
          className: "bg-red-500 shadow-lg shadow-red-500/30",
        };
      }
    }
    
    if (disabled) {
      return {
        text: "BUZZ",
        className: "bg-gray-600 opacity-50 cursor-not-allowed",
      };
    }

    return {
      text: "BUZZ",
      className: cn(
        colors.bg,
        colors.hover,
        colors.glow,
        "transition-all transform hover:scale-105 active:scale-95"
      ),
    };
  };

  const buttonState = getButtonState();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-24 text-white font-bold text-2xl rounded-xl",
        buttonState.className
      )}
    >
      <span className="mr-3">👋</span>
      {buttonState.text}
    </Button>
  );
}
