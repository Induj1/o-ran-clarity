import { Network, Activity } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">O-RAN Fronthaul Optimizer</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Network Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-status-high animate-pulse-glow" />
            <span className="text-muted-foreground">Analysis Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
