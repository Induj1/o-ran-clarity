import { CongestionEvent } from "@/types/api";
import { AlertTriangle, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CongestionEventTimelineProps {
  events: CongestionEvent[];
}

// Link colors matching the design system
const LINK_CONFIG: Record<string, { color: string; label: string }> = {
  "Link 1": { color: "hsl(var(--chart-1))", label: "Link 1" },
  "Link 2": { color: "hsl(var(--chart-2))", label: "Link 2" },
  "Link 3": { color: "hsl(var(--chart-3))", label: "Link 3" },
};

export function CongestionEventTimeline({ events }: CongestionEventTimelineProps) {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // Group events by link and calculate positions with offset for overlapping events
  const eventsByLink = useMemo(() => {
    const grouped: Record<string, (CongestionEvent & { displayOffset: number })[]> = {
      "Link 1": [],
      "Link 2": [],
      "Link 3": [],
    };
    
    events.forEach((event) => {
      if (grouped[event.link_id]) {
        grouped[event.link_id].push({ ...event, displayOffset: 0 });
      }
    });
    
    // Sort each link's events by timestamp and calculate offsets for close events
    Object.keys(grouped).forEach((linkId) => {
      grouped[linkId].sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate offsets for events that are too close together
      for (let i = 1; i < grouped[linkId].length; i++) {
        const current = grouped[linkId][i];
        const previous = grouped[linkId][i - 1];
        const timeDiff = current.timestamp - previous.timestamp;
        
        // If events are within 0.1s of each other, offset them
        if (timeDiff < 0.1) {
          // Stack offset: each overlapping event gets pushed right by 18px
          current.displayOffset = previous.displayOffset + 18;
        }
      }
    });
    
    return grouped;
  }, [events]);

  const timeRange = useMemo(() => {
    if (events.length === 0) return { min: 0, max: 1 };
    const timestamps = events.map((e) => e.timestamp);
    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }, [events]);

  const getPositionPercent = (timestamp: number) => {
    const range = timeRange.max - timeRange.min;
    if (range === 0) return 5;
    return 5 + ((timestamp - timeRange.min) / range) * 90; // 5-95% range
  };

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const { min, max } = timeRange;
    const range = max - min;
    const step = range / 4;
    return [min, min + step, min + step * 2, min + step * 3, max];
  }, [timeRange]);

  return (
    <TooltipProvider>
      <div className="section-card space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">Event Timeline</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted rounded">
            {timeRange.min.toFixed(2)}s → {timeRange.max.toFixed(2)}s
          </span>
        </div>

        {/* Lane-based Timeline */}
        <div className="space-y-1">
          {/* Time axis header */}
          <div className="flex items-center h-8 border-b border-border/50">
            <div className="w-20 flex-shrink-0" />
            <div className="flex-1 relative">
              {timeMarkers.map((time, idx) => (
                <span
                  key={idx}
                  className="absolute text-[10px] text-muted-foreground font-mono -translate-x-1/2"
                  style={{ left: `${getPositionPercent(time)}%` }}
                >
                  {time.toFixed(2)}s
                </span>
              ))}
            </div>
          </div>

          {/* Link lanes */}
          {Object.entries(LINK_CONFIG).map(([linkId, config]) => {
            const linkEvents = eventsByLink[linkId] || [];
            
            return (
              <div
                key={linkId}
                className="flex items-center h-14 group hover:bg-muted/30 rounded-lg transition-colors"
              >
                {/* Link label */}
                <div className="w-20 flex-shrink-0 px-2">
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: `${config.color}15`,
                      color: config.color 
                    }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Timeline track */}
                <div className="flex-1 relative h-full">
                  {/* Track background */}
                  <div 
                    className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full opacity-20"
                    style={{ backgroundColor: config.color }}
                  />

                  {/* Event dots */}
                  {linkEvents.map((event, idx) => {
                    const eventId = `${linkId}-${idx}`;
                    const isHovered = hoveredEvent === eventId;
                    const topContributor = event.contributors[0];
                    const isHighSeverity = topContributor && topContributor.contribution_percent > 50;

                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                            style={{ 
                              left: `${getPositionPercent(event.timestamp)}%`,
                              marginLeft: `${event.displayOffset}px`,
                            }}
                            onMouseEnter={() => setHoveredEvent(eventId)}
                            onMouseLeave={() => setHoveredEvent(null)}
                          >
                            {/* Event marker */}
                            <div
                              className={`
                                w-4 h-4 rounded-full border-2 transition-all duration-200
                                ${isHovered ? "scale-150 shadow-lg" : "scale-100"}
                                ${isHighSeverity ? "animate-pulse" : ""}
                              `}
                              style={{
                                borderColor: config.color,
                                backgroundColor: isHovered ? config.color : "hsl(var(--background))",
                                boxShadow: isHovered ? `0 0 12px ${config.color}` : undefined,
                              }}
                            />
                            
                            {/* Severity indicator */}
                            {isHighSeverity && (
                              <div className="absolute -top-1 -right-1">
                                <AlertTriangle 
                                  className="w-2.5 h-2.5" 
                                  style={{ color: "hsl(var(--status-medium))" }}
                                />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="p-3 max-w-xs"
                          style={{ borderColor: config.color }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <span 
                                className="text-xs font-medium px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                {event.link_id}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
                                t={event.timestamp.toFixed(2)}s
                              </span>
                            </div>
                            
                            <div className="space-y-1.5">
                              {event.contributors.slice(0, 3).map((contrib, cIdx) => {
                                const cellId = contrib.cell_id.startsWith("Cell ") 
                                  ? contrib.cell_id 
                                  : `Cell ${contrib.cell_id}`;
                                const isHigh = contrib.contribution_percent > 20;
                                
                                return (
                                  <div key={cIdx} className="flex items-center justify-between gap-2 text-xs">
                                    <span className={isHigh ? "text-[hsl(var(--status-medium))] font-medium" : "text-muted-foreground"}>
                                      {cellId}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${Math.min(contrib.contribution_percent, 100)}%`,
                                            backgroundColor: isHigh ? "hsl(var(--status-medium))" : config.color,
                                          }}
                                        />
                                      </div>
                                      <span className="font-mono w-12 text-right">
                                        {contrib.contribution_percent.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              {event.contributors.length > 3 && (
                                <div className="text-[10px] text-muted-foreground">
                                  +{event.contributors.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Event count */}
                <div className="w-12 flex-shrink-0 text-right pr-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {linkEvents.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          {Object.entries(LINK_CONFIG).map(([linkId, config]) => {
            const linkEvents = eventsByLink[linkId] || [];
            const totalContributors = linkEvents.reduce(
              (acc, e) => acc + e.contributors.length, 
              0
            );
            
            return (
              <div
                key={linkId}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ backgroundColor: `${config.color}08` }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{linkEvents.length}</span> events
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
