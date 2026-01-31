import { AnalysisResponse } from "@/types/api";
import { CongestionTimeline } from "./CongestionTimeline";
import { CongestionEventTimeline } from "./CongestionEventTimeline";
import { CellFlowVisualization } from "./CellFlowVisualization";
import { Info } from "lucide-react";
import { useMemo } from "react";

interface CongestionSectionProps {
  data: AnalysisResponse;
}

export function CongestionSection({ data }: CongestionSectionProps) {
  const stats = useMemo(() => {
    // Flatten all events across all links
    let totalEvents = 0;
    const cellContributions: Record<string, number[]> = {};
    let highContributors = 0;

    Object.entries(data.root_cause_attribution).forEach(([linkId, events]) => {
      totalEvents += events.length;
      events.forEach((event) => {
        event.contributors.forEach((c) => {
          const cellKey = `Cell ${c.cell_id}`;
          if (!cellContributions[cellKey]) {
            cellContributions[cellKey] = [];
          }
          cellContributions[cellKey].push(c.pct);
          if (c.pct > 20) {
            highContributors++;
          }
        });
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

    return { totalEvents, topCell, topAvg, highContributors };
  }, [data]);

  // Transform events for timeline components
  const transformedEvents = useMemo(() => {
    const events: Array<{
      timestamp: number;
      link_id: string;
      contributors: Array<{ cell_id: string; contribution_percent: number }>;
    }> = [];

    Object.entries(data.root_cause_attribution).forEach(([linkId, linkEvents]) => {
      linkEvents.forEach((event) => {
        events.push({
          timestamp: event.time_sec,
          link_id: `Link ${linkId}`,
          contributors: event.contributors.map((c) => ({
            cell_id: `Cell ${c.cell_id}`,
            contribution_percent: c.pct,
          })),
        });
      });
    });

    return events.sort((a, b) => a.timestamp - b.timestamp);
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

      {/* Cell Flow Visualization */}
      <div>
        <h2 className="section-title mb-1">Cell → Link Flow</h2>
        <p className="section-description">
          Animated visualization showing how cells contribute traffic to each fronthaul link
        </p>
        <CellFlowVisualization data={data} />
      </div>

      {/* Visual Event Timeline */}
      <div>
        <h2 className="section-title mb-1">Congestion Event Timeline</h2>
        <p className="section-description">
          Interactive timeline showing when congestion events occurred and which cells contributed
        </p>
        <CongestionEventTimeline events={transformedEvents} />
      </div>

      {/* Line Chart */}
      <div>
        <h2 className="section-title mb-1">Cell Contribution Trends</h2>
        <p className="section-description">
          Line chart showing how cell contributions change across congestion events
        </p>
        <CongestionTimeline events={transformedEvents} />
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
