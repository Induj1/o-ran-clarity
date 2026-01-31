import { AnalysisResponse } from "@/types/api";
import { useMemo, useState } from "react";
import { Radio, Zap, Activity } from "lucide-react";

interface CellFlowVisualizationProps {
  data: AnalysisResponse;
}

const LINK_COLORS: Record<string, { main: string; glow: string; bg: string }> = {
  "1": { main: "hsl(var(--chart-1))", glow: "hsl(187 80% 48% / 0.4)", bg: "hsl(187 80% 48% / 0.1)" },
  "2": { main: "hsl(var(--chart-2))", glow: "hsl(262 80% 60% / 0.4)", bg: "hsl(262 80% 60% / 0.1)" },
  "3": { main: "hsl(var(--chart-3))", glow: "hsl(142 70% 45% / 0.4)", bg: "hsl(142 70% 45% / 0.1)" },
};

interface FlowParticle {
  id: string;
  cellId: number;
  linkId: string;
  pct: number;
  delay: number;
}

export function CellFlowVisualization({ data }: CellFlowVisualizationProps) {
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Generate flow particles from root cause attribution
  const particles = useMemo(() => {
    const result: FlowParticle[] = [];
    let particleId = 0;

    Object.entries(data.root_cause_attribution).forEach(([linkId, events]) => {
      events.forEach((event, eventIdx) => {
        event.contributions.forEach((contribution, contribIdx) => {
          result.push({
            id: `p-${particleId++}`,
            cellId: contribution.cell,
            linkId,
            pct: contribution.percentage,
            delay: eventIdx * 0.8 + contribIdx * 0.2,
          });
        });
      });
    });

    return result;
  }, [data]);

  // Get cells per link
  const linkCells = useMemo(() => {
    return Object.entries(data.topology).map(([linkId, cells]) => ({
      linkId,
      cells,
      confidence: data.confidence[linkId] || 0,
    }));
  }, [data]);

  // Restart animation
  const restartAnimation = () => {
    setAnimationKey((k) => k + 1);
  };

  return (
    <div className="section-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-medium">Cell → Link Flow Visualization</span>
        </div>
        <button
          onClick={restartAnimation}
          className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors flex items-center gap-1.5"
        >
          <Zap className="w-3 h-3" />
          Replay Animation
        </button>
      </div>

      {/* Flow Visualization Container */}
      <div className="relative bg-muted/30 rounded-xl p-6 pb-16 overflow-visible min-h-[500px]">
        {/* DU Node (Center Right) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--node-du))] flex items-center justify-center shadow-lg border-4 border-background">
            <div className="text-center">
              <div className="text-white font-bold text-sm">DU</div>
              <div className="text-white/70 text-[10px]">Central</div>
            </div>
          </div>
        </div>

        {/* Link Lanes */}
        {linkCells.map((link, linkIdx) => {
          const yPosition = 12 + linkIdx * 30; // Distribute vertically with more space
          const colors = LINK_COLORS[link.linkId] || LINK_COLORS["1"];
          const isActive = activeLink === link.linkId;

          return (
            <div
              key={link.linkId}
              className="absolute left-4 right-32 transition-all duration-300"
              style={{ top: `${yPosition}%` }}
              onMouseEnter={() => setActiveLink(link.linkId)}
              onMouseLeave={() => setActiveLink(null)}
            >
              {/* Link Label */}
              <div
                className="absolute -left-2 -top-6 px-2 py-0.5 rounded text-xs font-medium z-10"
                style={{ backgroundColor: colors.bg, color: colors.main }}
              >
                Link {link.linkId}
                <span className="ml-2 opacity-70">{link.confidence}% conf</span>
              </div>

              {/* Flow Track */}
              <div
                className={`h-12 rounded-full relative overflow-hidden transition-all duration-300 ${
                  isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
                style={{
                  backgroundColor: colors.bg,
                  boxShadow: isActive ? `0 0 20px ${colors.glow}` : undefined,
                }}
              >
                {/* Gradient flow background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${colors.main}, transparent)`,
                    animation: "flowPulse 2s ease-in-out infinite",
                  }}
                />

                {/* Cell particles */}
                {particles
                  .filter((p) => p.linkId === link.linkId)
                  .map((particle) => (
                    <div
                      key={`${animationKey}-${particle.id}`}
                      className="absolute h-8 top-2 rounded-full flex items-center justify-center text-[10px] font-bold animate-flow-cell"
                      style={{
                        width: `${Math.max(32, particle.pct * 1.2)}px`,
                        backgroundColor: colors.main,
                        color: "hsl(var(--background))",
                        animationDelay: `${particle.delay}s`,
                        boxShadow: `0 0 10px ${colors.glow}`,
                        opacity: 0,
                      }}
                    >
                      {particle.cellId}
                    </div>
                  ))}
              </div>

              {/* Cell Source Icons */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {link.cells.map((cellId, idx) => (
                  <div
                    key={cellId}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium border-2 animate-pulse-subtle bg-background/80"
                    style={{
                      borderColor: colors.main,
                      color: colors.main,
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  >
                    {cellId}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Connection Lines to DU */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            {Object.entries(LINK_COLORS).map(([id, colors]) => (
              <linearGradient key={id} id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.main} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.main} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>
          {linkCells.map((link, idx) => {
            const yPos = 12 + idx * 30;
            return (
              <path
                key={link.linkId}
                d={`M calc(100% - 140px) ${yPos}% Q calc(100% - 100px) ${yPos}%, calc(100% - 70px) 50%`}
                fill="none"
                stroke={`url(#grad-${link.linkId})`}
                strokeWidth="3"
                strokeDasharray="8,4"
                className="animate-dash"
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Radio className="w-3 h-3" />
            </div>
            <span>Cell nodes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span>Congestion contributor</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {linkCells.map((link) => {
          const colors = LINK_COLORS[link.linkId] || LINK_COLORS["1"];
          const events = data.root_cause_attribution[link.linkId] || [];
          const totalContributors = events.reduce((acc, e) => acc + e.contributions.length, 0);

          return (
            <div
              key={link.linkId}
              className="p-4 rounded-lg border transition-all hover:scale-[1.02]"
              style={{ borderColor: colors.main, backgroundColor: colors.bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: colors.main }}>
                  Link {link.linkId}
                </span>
                <span className="text-xs text-muted-foreground">{link.cells.length} cells</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Events</div>
                  <div className="font-mono font-medium">{events.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Contributors</div>
                  <div className="font-mono font-medium">{totalContributors}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
