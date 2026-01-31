import { AnalysisResponse } from "@/types/api";
import { CongestionTimeline } from "./CongestionTimeline";
import { Info } from "lucide-react";
import { useMemo } from "react";

interface CongestionSectionProps {
  data: AnalysisResponse;
}

export function CongestionSection({ data }: CongestionSectionProps) {
  const stats = useMemo(() => {
    const events = data.root_cause_attribution.events;
    const totalEvents = events.length;
    
    // Find most problematic cell
    const cellContributions: Record<string, number[]> = {};
    events.forEach((event) => {
      event.contributors.forEach((c) => {
        if (!cellContributions[c.cell_id]) {
          cellContributions[c.cell_id] = [];
        }
        cellContributions[c.cell_id].push(c.contribution_percent);
      });
    });

    let topCell = "";
    let topAvg = 0;
    Object.entries(cellContributions).forEach(([cellId, contribs]) => {
      const avg = contribs.reduce((a, b) => a + b, 0) / contribs.length;
      if (avg > topAvg) {
        topAvg = avg;
        topCell = cellId;
      }
    });

    // Count high contributors
    const highContributors = events.flatMap((e) =>
      e.contributors.filter((c) => c.contribution_percent > 20)
    ).length;

    return { totalEvents, topCell, topAvg, highContributors };
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="section-card">
          <div className="data-label">Congestion Events</div>
          <div className="data-value">{stats.totalEvents}</div>
        </div>
        <div className="section-card">
          <div className="data-label">High Contributors</div>
          <div className="data-value text-status-medium">{stats.highContributors}</div>
        </div>
        <div className="section-card">
          <div className="data-label">Top Problem Cell</div>
          <div className="data-value text-sm">{stats.topCell}</div>
        </div>
        <div className="section-card">
          <div className="data-label">Avg Contribution</div>
          <div className="data-value">{stats.topAvg.toFixed(1)}%</div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="section-title mb-1">Congestion Event Timeline</h2>
        <p className="section-description">
          Root-cause attribution showing which cells contributed to each congestion event
        </p>
        <CongestionTimeline events={data.root_cause_attribution.events} />
      </div>

      {/* Explanation */}
      <div className="explanation-box flex gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">Understanding Root-Cause Attribution</p>
          <p>
            Root-cause attribution explains which cells contributed most to congestion events on each link.
            Cells marked with a warning icon contributed more than 20% to the congestion event, 
            indicating they are primary drivers that may warrant further investigation.
          </p>
        </div>
      </div>
    </div>
  );
}
