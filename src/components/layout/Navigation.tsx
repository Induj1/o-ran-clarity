import { cn } from "@/lib/utils";
import { GitBranch, BarChart3, AlertTriangle, Brain } from "lucide-react";

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
    <nav className="border-b border-border bg-card/30">
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
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {section.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
