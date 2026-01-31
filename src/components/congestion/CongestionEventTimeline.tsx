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

  // Group events by unique timestamp to avoid overlap
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const groups: { timestamp: number; events: typeof events }[] = [];
    
    sorted.forEach((event) => {
      // Find if there's an existing group within 0.05s
      const existingGroup = groups.find(
        (g) => Math.abs(g.timestamp - event.timestamp) < 0.05
      );
      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        groups.push({ timestamp: event.timestamp, events: [event] });
      }
    });
    
    return groups;
  }, [events]);

  const timeRange = useMemo(() => {
    if (groupedEvents.length === 0) return { min: 0, max: 1 };
    const timestamps = groupedEvents.map((g) => g.timestamp);
    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }, [groupedEvents]);

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

      {/* Timeline - Horizontal with grouped events */}
      <div className="overflow-x-auto pb-4">
        <div className="relative min-w-[900px]">
          {/* Timeline Base Track */}
          <div className="h-3 bg-muted rounded-full relative overflow-hidden mx-20">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full"
              style={{ width: '100%' }}
            />
          </div>

          {/* Time Axis Labels */}
          <div className="flex justify-between mx-20 mt-2 text-xs text-muted-foreground font-mono">
            <span>{timeRange.min.toFixed(2)}s</span>
            <span>{((timeRange.min + timeRange.max) / 2).toFixed(2)}s</span>
            <span>{timeRange.max.toFixed(2)}s</span>
          </div>

          {/* Grouped Event Markers */}
          <div className="relative h-40 mt-8 mx-20">
            {groupedEvents.map((group, groupIdx) => {
              const leftPercent = getPositionPercent(group.timestamp);
              const isAnyActive = group.events.some((_, idx) => 
                activeEvent === events.indexOf(group.events[idx])
              );

              return (
                <div
                  key={groupIdx}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${leftPercent}%` }}
                >
                  {/* Connector Line */}
                  <div className="w-0.5 h-6 mx-auto bg-muted-foreground/30" />

                  {/* Stacked event nodes for this timestamp */}
                  <div className="flex flex-col items-center gap-1">
                    {group.events.map((event, eventIdx) => {
                      const globalIdx = events.indexOf(event);
                      const isActive = activeEvent === globalIdx;
                      const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";

                      return (
                        <div
                          key={eventIdx}
                          className="flex flex-col items-center cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setActiveEvent(globalIdx)}
                          onMouseLeave={() => setActiveEvent(null)}
                        >
                          {/* Event Node */}
                          <div
                            className={`
                              w-9 h-9 rounded-full flex items-center justify-center
                              border-2 transition-all duration-200
                              ${isActive ? "scale-110 shadow-md" : "scale-100"}
                            `}
                            style={{
                              borderColor: linkColor,
                              backgroundColor: isActive ? linkColor : "hsl(var(--card))",
                            }}
                          >
                            <Radio
                              className="w-4 h-4"
                              style={{ color: isActive ? "hsl(var(--card))" : linkColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Single timestamp label for the group */}
                  <div className="mt-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1 mb-1">
                      {group.events.map((event, idx) => {
                        const linkColor = LINK_COLORS[event.link_id] || "hsl(var(--primary))";
                        return (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{ backgroundColor: `${linkColor}20`, color: linkColor }}
                          >
                            {event.link_id}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      t={group.timestamp.toFixed(2)}s
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details - Grouped by timestamp */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-min">
          {groupedEvents.flatMap((group) => group.events).map((event, idx) => {
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
                    // Extract just the number from "Cell X" if it already has "Cell" prefix
                    const cellDisplay = contributor.cell_id.startsWith("Cell ") 
                      ? contributor.cell_id 
                      : `Cell ${contributor.cell_id}`;

                    return (
                      <div key={cIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {isHighContributor && (
                              <AlertTriangle className="w-3 h-3 text-[hsl(var(--status-medium))]" />
                            )}
                            <span className={isHighContributor ? "text-[hsl(var(--status-medium))] font-medium" : "text-muted-foreground"}>
                              {cellDisplay}
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
