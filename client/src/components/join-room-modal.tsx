import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and room code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsJoining(true);
      const response = await apiRequest('POST', `/api/rooms/${roomCode.toUpperCase()}/join`, {
        name: name.trim(),
      });
      
      const player = await response.json();
      
      toast({
        title: "Joined successfully!",
        description: `Welcome to room ${roomCode.toUpperCase()}`,
      });
      
      setLocation(`/play/${roomCode.toUpperCase()}/${player.id}`);
      onClose();
    } catch (error) {
      toast({
        title: "Failed to join room",
        description: "Please check the room code and try again",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setName("");
    setRoomCode("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Join Game Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-400">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
              maxLength={30}
            />
          </div>
          <div>
            <Label htmlFor="roomCode" className="text-gray-400">Room Code</Label>
            <Input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
              maxLength={6}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit"
              disabled={isJoining}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold"
            >
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
            <Button 
              type="button"
              onClick={handleClose}
              disabled={isJoining}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
