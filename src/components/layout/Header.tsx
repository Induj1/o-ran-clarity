import { Network, Activity, Hexagon, Wifi } from "lucide-react";

export function Header() {
  return (
    <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      {/* Animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-data-stream" 
           style={{ backgroundSize: '200% 100%' }} />
      
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center animate-glow-pulse">
              <Network className="w-6 h-6 text-accent" />
            </div>
          </div>
          
          <div>
            <h1 className="text-lg font-bold text-foreground font-display tracking-wider">
              O-RAN <span className="text-primary">Fronthaul</span> Optimizer
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hexagon className="w-3 h-3 text-accent" />
              <span>AI-Powered Network Intelligence</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Status indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-high/10 border border-status-high/30">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-high))] animate-pulse" 
                   style={{ boxShadow: '0 0 10px hsl(160 100% 50% / 0.6)' }} />
              <span className="text-xs font-medium text-[hsl(var(--status-high))]">System Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="w-4 h-4 text-accent animate-pulse" />
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs font-mono">v2.4.1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
