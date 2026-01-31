import { CongestionEvent } from "@/types/api";
import { AlertTriangle, Clock, Radio } from "lucide-react";
import { useMemo, useState } from "react";

interface CongestionEventTimelineProps {
  events: CongestionEvent[];
}

// Generate distinct colors for links
const LINK_COLORS: Record<string, string> = {
  "Link 1": "hsl(var(--chart-1))",
  "Link 2": "hsl(var(--chart-2))",
  "Link 3": "hsl(var(--chart-3))",
};

export function CongestionEventTimeline({ events }: CongestionEventTimelineProps) {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.timestamp - b.timestamp);
  }, [events]);

  const timeRange = useMemo(() => {
    if (sortedEvents.length === 0) return { min: 0, max: 1 };
    const timestamps = sortedEvents.map((e) => e.timestamp);
    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }, [sortedEvents]);

  const getPositionPercent = (timestamp: number) => {
    const range = timeRange.max - timeRange.min;
    if (range === 0) return 50;
    return ((timestamp - timeRange.min) / range) * 100;
  };

  return (
    <div className="section-card space-y-8">
      {/* Timeline Header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Congestion Event Timeline</span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-mono">
          {timeRange.min.toFixed(2)}s — {timeRange.max.toFixed(2)}s
        </span>
      </div>

      {/* Expanded Timeline - Horizontal Scrollable */}
      <div className="overflow-x-auto pb-4">
        <div className="relative min-w-[800px]">
          {/* Timeline Base Track */}
          <div className="h-3 bg-muted rounded-full relative overflow-hidden mx-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 animate-pulse" />
          </div>

          {/* Time Axis Labels */}
          <div className="flex justify-between mx-16 mt-2 text-xs text-muted-foreground font-mono">
            <span>{timeRange.min.toFixed(2)}s</span>
            <span>{((timeRange.min + timeRange.max) / 2).toFixed(2)}s</span>
            <span>{timeRange.max.toFixed(2)}s</span>
          </div>

          {/* Event Markers - More Spacing */}
          <div className="relative h-28 mt-6 mx-16">
            {sortedEvents.map((event, idx) => {
              const leftPercent = getPositionPercent(event.timestamp);
              const isActive = activeEvent === idx;
              const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";

              return (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 cursor-pointer transition-all duration-300 group"
                  style={{ left: `${leftPercent}%` }}
                  onMouseEnter={() => setActiveEvent(idx)}
                  onMouseLeave={() => setActiveEvent(null)}
                >
                  {/* Connector Line */}
                  <div
                    className="w-0.5 mx-auto transition-all duration-300"
                    style={{
                      backgroundColor: linkColor,
                      opacity: isActive ? 1 : 0.4,
                      height: isActive ? "32px" : "20px",
                    }}
                  />

                  {/* Event Node - Larger */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${isActive ? "scale-125 shadow-lg" : "scale-100"}
                    `}
                    style={{
                      borderColor: linkColor,
                      backgroundColor: isActive ? linkColor : "hsl(var(--card))",
                      boxShadow: isActive ? `0 0 20px ${linkColor}40` : undefined,
                    }}
                  >
                    <Radio
                      className="w-5 h-5 transition-colors"
                      style={{ color: isActive ? "hsl(var(--card))" : linkColor }}
                    />
                  </div>

                  {/* Link Badge */}
                  <div
                    className="mt-2 px-2 py-0.5 rounded text-[10px] font-medium text-center whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${linkColor}20`, 
                      color: linkColor 
                    }}
                  >
                    {event.link_id}
                  </div>

                  {/* Timestamp */}
                  <div className="text-[10px] text-center mt-1 text-muted-foreground font-mono whitespace-nowrap">
                    t={event.timestamp.toFixed(2)}s
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details - Horizontal Scroll for Many Events */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-min">
          {sortedEvents.map((event, idx) => {
            const isActive = activeEvent === idx;
            const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";

            return (
              <div
                key={idx}
                className={`
                  p-4 rounded-lg border transition-all duration-300 cursor-pointer flex-shrink-0 w-64
                  ${isActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-card/50 hover:bg-card"}
                `}
                onMouseEnter={() => setActiveEvent(idx)}
                onMouseLeave={() => setActiveEvent(null)}
              >
                {/* Event Header */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: `${linkColor}20`, color: linkColor }}
                  >
                    {event.link_id}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    t={event.timestamp.toFixed(2)}s
                  </span>
                </div>

                {/* Contributors */}
                <div className="space-y-2.5">
                  {event.contributors.slice(0, 4).map((contributor, cIdx) => {
                    const isHighContributor = contributor.contribution_percent > 20;

                    return (
                      <div key={cIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {isHighContributor && (
                              <AlertTriangle className="w-3 h-3 text-[hsl(var(--status-medium))]" />
                            )}
                            <span className={isHighContributor ? "text-[hsl(var(--status-medium))] font-medium" : "text-muted-foreground"}>
                              Cell {contributor.cell_id}
                            </span>
                          </div>
                          <span className={`font-mono ${isHighContributor ? "text-[hsl(var(--status-medium))] font-medium" : "text-foreground"}`}>
                            {contributor.contribution_percent.toFixed(1)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.min(contributor.contribution_percent * 2, 100)}%`,
                              backgroundColor: isHighContributor
                                ? "hsl(var(--status-medium))"
                                : linkColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {event.contributors.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{event.contributors.length - 4} more contributors
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        {Object.entries(LINK_COLORS).map(([linkId, color]) => (
          <div key={linkId} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{linkId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
