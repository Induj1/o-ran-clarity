import { cn } from "@/lib/utils";
import { GitBranch, BarChart3, AlertTriangle, Brain, Hexagon } from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "topology", label: "Topology", icon: GitBranch },
  { id: "capacity", label: "Capacity", icon: BarChart3 },
  { id: "congestion", label: "Congestion", icon: AlertTriangle },
  { id: "summary", label: "AI Summary", icon: Brain },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  return (
    <nav className="border-b border-border/50 bg-card/20 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "group flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 transition-all",
                  isActive && "drop-shadow-[0_0_8px_hsl(180_100%_45%/0.8)]"
                )} />
                <span className={cn(
                  isActive && "text-glow-cyan"
                )}>{section.label}</span>
                
                {/* Active indicator - glowing line */}
                {isActive && (
                  <>
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary" />
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 blur-sm bg-accent" />
                  </>
                )}
                
                {/* Hover hexagon decoration */}
                <Hexagon className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 opacity-0 transition-opacity text-primary/30",
                  "group-hover:opacity-100"
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
