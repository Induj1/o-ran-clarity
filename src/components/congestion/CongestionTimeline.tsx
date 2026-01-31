import { CongestionEvent } from "@/types/api";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle } from "lucide-react";

interface CongestionTimelineProps {
  events: CongestionEvent[];
}

function ContributorBar({ 
  cellId, 
  percent, 
  isTop 
}: { 
  cellId: string; 
  percent: number;
  isTop: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-sm text-muted-foreground font-mono">{cellId}</div>
      <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all flex items-center justify-end pr-2",
            isTop ? "bg-primary" : "bg-primary/40"
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        >
          <span className={cn(
            "text-xs font-mono font-medium",
            isTop ? "text-primary-foreground" : "text-foreground"
          )}>
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>
      {isTop && (
        <AlertCircle className="w-4 h-4 text-status-medium shrink-0" />
      )}
    </div>
  );
}

export function CongestionTimeline({ events }: CongestionTimelineProps) {
  // Group events by link
  const eventsByLink = events.reduce((acc, event) => {
    if (!acc[event.link_id]) {
      acc[event.link_id] = [];
    }
    acc[event.link_id].push(event);
    return acc;
  }, {} as Record<string, CongestionEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(eventsByLink).map(([linkId, linkEvents]) => (
        <div key={linkId} className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{linkId}</h3>
            <span className="text-sm text-muted-foreground">
              ({linkEvents.length} congestion events)
            </span>
          </div>

          <div className="space-y-4">
            {linkEvents.map((event, idx) => (
              <div
                key={`${event.link_id}-${event.timestamp}`}
                className="pl-4 border-l-2 border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-primary">
                    t = {event.timestamp.toFixed(2)}s
                  </span>
                </div>
                
                <div className="space-y-2">
                  {event.contributors.map((contributor, cIdx) => (
                    <ContributorBar
                      key={contributor.cell_id}
                      cellId={contributor.cell_id}
                      percent={contributor.contribution_percent}
                      isTop={contributor.contribution_percent > 20}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
