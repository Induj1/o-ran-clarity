import { CongestionEvent } from "@/types/api";
import { AlertTriangle, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CongestionEventTimelineProps {
  events: CongestionEvent[];
}

const LINK_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(38, 75%, 55%)",
  "hsl(280, 45%, 55%)",
  "hsl(320, 50%, 55%)",
];

const MAX_EVENTS_PER_LINK = 50;

export function CongestionEventTimeline({ events }: CongestionEventTimelineProps) {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const linkConfig = useMemo(() => {
    const uniqueLinks = [...new Set(events.map((e) => e.link_id))].sort();
    const config: Record<string, { color: string; label: string }> = {};
    uniqueLinks.forEach((linkId, idx) => {
      config[linkId] = {
        color: LINK_COLORS[idx % LINK_COLORS.length],
        label: linkId,
      };
    });
    return config;
  }, [events]);

  const { eventsByLink, totalCounts } = useMemo(() => {
    const grouped: Record<string, (CongestionEvent & { displayOffset: number })[]> = {};
    const counts: Record<string, number> = {};

    Object.keys(linkConfig).forEach((linkId) => {
      grouped[linkId] = [];
      counts[linkId] = 0;
    });

    const allGrouped: Record<string, CongestionEvent[]> = {};
    events.forEach((event) => {
      if (!allGrouped[event.link_id]) allGrouped[event.link_id] = [];
      allGrouped[event.link_id].push(event);
    });

    Object.entries(allGrouped).forEach(([linkId, linkEvents]) => {
      counts[linkId] = linkEvents.length;
      linkEvents.sort((a, b) => a.timestamp - b.timestamp);

      let sampled = linkEvents;
      if (linkEvents.length > MAX_EVENTS_PER_LINK) {
        const step = linkEvents.length / MAX_EVENTS_PER_LINK;
        sampled = [];
        for (let i = 0; i < MAX_EVENTS_PER_LINK; i++) {
          sampled.push(linkEvents[Math.floor(i * step)]);
        }
      }

      const processed = sampled.map((e) => ({ ...e, displayOffset: 0 }));
      for (let i = 1; i < processed.length; i++) {
        const timeDiff = processed[i].timestamp - processed[i - 1].timestamp;
        if (timeDiff < 0.5) {
          processed[i].displayOffset = processed[i - 1].displayOffset + 14;
        }
      }

      grouped[linkId] = processed;
    });

    return { eventsByLink: grouped, totalCounts: counts };
  }, [events, linkConfig]);

  const timeRange = useMemo(() => {
    if (events.length === 0) return { min: 0, max: 60 };
    const timestamps = events.map((e) => e.timestamp);
    return { min: Math.min(...timestamps), max: Math.max(...timestamps) };
  }, [events]);

  const getPositionPercent = (timestamp: number) => {
    const range = timeRange.max - timeRange.min;
    if (range === 0) return 50;
    return 5 + ((timestamp - timeRange.min) / range) * 90;
  };

  const timeMarkers = useMemo(() => {
    const { min, max } = timeRange;
    const range = max - min;
    const numMarkers = 5;
    const step = range / (numMarkers - 1);
    return Array.from({ length: numMarkers }, (_, i) => min + step * i);
  }, [timeRange]);

  if (events.length === 0) {
    return (
      <div className="section-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>No congestion events recorded</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="section-card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">Event Timeline</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted rounded">
            {timeRange.min.toFixed(1)}s → {timeRange.max.toFixed(1)}s ({events.length} total)
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center h-8 border-b border-border/50">
            <div className="w-20 flex-shrink-0" />
            <div className="flex-1 relative">
              {timeMarkers.map((time, idx) => (
                <span
                  key={idx}
                  className="absolute text-[10px] text-muted-foreground font-mono -translate-x-1/2"
                  style={{ left: `${getPositionPercent(time)}%` }}
                >
                  {time.toFixed(1)}s
                </span>
              ))}
            </div>
          </div>

          {Object.entries(linkConfig).map(([linkId, config]) => {
            const linkEvents = eventsByLink[linkId] || [];
            const totalCount = totalCounts[linkId] || 0;

            return (
              <div
                key={linkId}
                className="flex items-center h-12 group hover:bg-muted/30 rounded-lg transition-colors"
              >
                <div className="w-20 flex-shrink-0 px-2">
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="flex-1 relative h-full">
                  <div
                    className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full opacity-20"
                    style={{ backgroundColor: config.color }}
                  />

                  {linkEvents.map((event, idx) => {
                    const eventId = `${linkId}-${idx}`;
                    const isHovered = hoveredEvent === eventId;
                    const topContrib = event.contributors[0];
                    const isHighSeverity = topContrib && topContrib.contribution_percent > 50;

                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                            style={{
                              left: `${getPositionPercent(event.timestamp)}%`,
                              marginLeft: `${event.displayOffset}px`,
                            }}
                            onMouseEnter={() => setHoveredEvent(eventId)}
                            onMouseLeave={() => setHoveredEvent(null)}
                          >
                            <div
                              className={`w-3 h-3 rounded-full border-2 transition-transform ${
                                isHovered ? "scale-150" : ""
                              } ${isHighSeverity ? "animate-pulse" : ""}`}
                              style={{
                                borderColor: config.color,
                                backgroundColor: isHovered ? config.color : "hsl(var(--background))",
                              }}
                            />
                            {isHighSeverity && (
                              <AlertTriangle
                                className="absolute -top-1 -right-1 w-2 h-2"
                                style={{ color: "hsl(var(--status-medium))" }}
                              />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-2 max-w-xs">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium" style={{ color: config.color }}>
                                {event.link_id}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
                                t={event.timestamp.toFixed(2)}s
                              </span>
                            </div>
                            {event.contributors.slice(0, 3).map((c, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span>{c.cell_id}</span>
                                <span className="font-mono">{c.contribution_percent.toFixed(1)}%</span>
                              </div>
                            ))}
                            {event.contributors.length > 3 && (
                              <div className="text-[10px] text-muted-foreground">
                                +{event.contributors.length - 3} more
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                <div className="w-16 flex-shrink-0 text-right pr-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {linkEvents.length === totalCount ? totalCount : `${linkEvents.length}/${totalCount}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          {Object.entries(linkConfig).map(([linkId, config]) => (
            <div
              key={linkId}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ backgroundColor: `${config.color}08` }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-xs font-medium" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {totalCounts[linkId] || 0} events
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
