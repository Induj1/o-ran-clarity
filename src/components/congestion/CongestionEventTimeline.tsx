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
    <div className="section-card space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Event Timeline</span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs">
          {timeRange.min.toFixed(2)}s — {timeRange.max.toFixed(2)}s
        </span>
      </div>

      {/* Visual Timeline Track */}
      <div className="relative">
        {/* Timeline Base */}
        <div className="h-2 bg-muted rounded-full relative overflow-hidden">
          {/* Animated pulse effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
        </div>

        {/* Event Markers */}
        <div className="relative h-16 mt-2">
          {sortedEvents.map((event, idx) => {
            const leftPercent = getPositionPercent(event.timestamp);
            const isActive = activeEvent === idx;
            const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";

            return (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2 cursor-pointer transition-all duration-300"
                style={{ left: `${leftPercent}%` }}
                onMouseEnter={() => setActiveEvent(idx)}
                onMouseLeave={() => setActiveEvent(null)}
              >
                {/* Connector Line */}
                <div
                  className="w-0.5 h-4 mx-auto transition-all duration-300"
                  style={{
                    backgroundColor: linkColor,
                    opacity: isActive ? 1 : 0.5,
                    height: isActive ? "24px" : "16px",
                  }}
                />

                {/* Event Node */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isActive ? "scale-125 shadow-lg" : "scale-100"}
                  `}
                  style={{
                    borderColor: linkColor,
                    backgroundColor: isActive ? linkColor : "hsl(var(--card))",
                  }}
                >
                  <Radio
                    className="w-4 h-4 transition-colors"
                    style={{ color: isActive ? "hsl(var(--card))" : linkColor }}
                  />
                </div>

                {/* Timestamp Label */}
                <div
                  className={`
                    text-xs text-center mt-1 whitespace-nowrap
                    transition-opacity duration-300
                    ${isActive ? "opacity-100" : "opacity-60"}
                  `}
                >
                  t={event.timestamp.toFixed(2)}s
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedEvents.map((event, idx) => {
          const isActive = activeEvent === idx;
          const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";

          return (
            <div
              key={idx}
              className={`
                p-4 rounded-lg border transition-all duration-300 cursor-pointer
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
                <span className="text-xs text-muted-foreground">
                  t={event.timestamp.toFixed(2)}s
                </span>
              </div>

              {/* Contributors */}
              <div className="space-y-2">
                {event.contributors.slice(0, 4).map((contributor, cIdx) => {
                  const isHighContributor = contributor.contribution_percent > 20;

                  return (
                    <div key={cIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {isHighContributor && (
                            <AlertTriangle className="w-3 h-3 text-status-medium" />
                          )}
                          <span className={isHighContributor ? "text-status-medium font-medium" : "text-muted-foreground"}>
                            {contributor.cell_id}
                          </span>
                        </div>
                        <span className={isHighContributor ? "text-status-medium font-medium" : "text-foreground"}>
                          {contributor.contribution_percent.toFixed(1)}%
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${contributor.contribution_percent * 2.5}%`,
                            backgroundColor: isHighContributor
                              ? "hsl(var(--status-medium))"
                              : linkColor,
                            animationDelay: `${cIdx * 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cell Flow Animation */}
      <div className="relative h-24 bg-muted/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Cell Contribution Flow
        </div>

        {/* Animated flowing dots representing cells */}
        {sortedEvents.flatMap((event, eventIdx) =>
          event.contributors.slice(0, 3).map((contributor, cIdx) => {
            const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";
            const delay = eventIdx * 0.5 + cIdx * 0.2;
            const duration = 3 + Math.random() * 2;

            return (
              <div
                key={`${eventIdx}-${cIdx}`}
                className="absolute w-3 h-3 rounded-full animate-flow-right"
                style={{
                  backgroundColor: linkColor,
                  opacity: contributor.contribution_percent / 100,
                  top: `${20 + cIdx * 25}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })
        )}

        {/* Link Labels */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
          {Object.entries(LINK_COLORS).map(([linkId, color]) => (
            <div key={linkId} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{linkId}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
