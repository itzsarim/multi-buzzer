import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import HostDashboard from "@/pages/host-dashboard";
import PlayerView from "@/pages/player-view";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/host/:roomCode">
        {(params) => <HostDashboard roomCode={params.roomCode} />}
      </Route>
      <Route path="/play/:roomCode/:playerId">
        {(params) => <PlayerView roomCode={params.roomCode} playerId={params.playerId} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
