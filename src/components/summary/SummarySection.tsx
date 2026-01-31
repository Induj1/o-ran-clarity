import { AnalysisResponse } from "@/types/api";
import { useMemo } from "react";
import { Brain, GitBranch, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SummarySectionProps {
  data: AnalysisResponse;
}

interface InsightItem {
  icon: React.ElementType;
  text: string;
  category: "topology" | "capacity" | "congestion";
}

export function SummarySection({ data }: SummarySectionProps) {
  const insights = useMemo<InsightItem[]>(() => {
    const items: InsightItem[] = [];
    const linkIds = Object.keys(data.topology);

    // Topology insights
    items.push({
      icon: GitBranch,
      text: `${linkIds.length} fronthaul links were inferred from packet-loss correlation analysis.`,
      category: "topology",
    });

    const confidenceEntries = Object.entries(data.topology_confidence);
    const highestConfLink = confidenceEntries.reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );
    items.push({
      icon: CheckCircle2,
      text: `Link ${highestConfLink[0]} shows the highest topology confidence at ${highestConfLink[1].toFixed(1)}%.`,
      category: "topology",
    });

    const outliersList = Array.isArray(data.outliers) ? data.outliers : [];
    if (outliersList.length > 0) {
      const outlierCells = outliersList.map((o) => `Cell ${o.cell_id}`).join(", ");
      items.push({
        icon: AlertTriangle,
        text: `Outlier detected: ${outlierCells} shows weaker correlation with assigned link traffic patterns.`,
        category: "topology",
      });
    }

    // Capacity insights
    const savingsEntries = Object.entries(data.bandwidth_savings_pct);
    const maxSaving = savingsEntries.reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );
    items.push({
      icon: TrendingDown,
      text: `Buffering reduces required capacity by up to ${maxSaving[1].toFixed(1)}% on Link ${maxSaving[0]}.`,
      category: "capacity",
    });

    const totalReduction =
      Object.values(data.capacity.no_buffer_gbps).reduce((a, b) => a + b, 0) -
      Object.values(data.capacity.with_buffer_gbps).reduce((a, b) => a + b, 0);
    items.push({
      icon: TrendingDown,
      text: `Total network capacity can be reduced by ${totalReduction.toFixed(1)} Gbps while maintaining ≤1% packet loss.`,
      category: "capacity",
    });

    // Congestion insights
    const eventsByLink: Record<string, number> = {};
    Object.entries(data.root_cause_attribution).forEach(([linkId, events]) => {
      eventsByLink[linkId] = events.length;
    });
    const mostCongestedLink = Object.entries(eventsByLink).reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );

    // Find top contributors for that link
    const topContributors: Record<string, number> = {};
    data.root_cause_attribution[mostCongestedLink[0]]?.forEach((event) => {
      event.contributors.forEach((c) => {
        topContributors[`Cell ${c.cell_id}`] = (topContributors[`Cell ${c.cell_id}`] || 0) + c.pct;
      });
    });

    const topTwo = Object.entries(topContributors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id);

    items.push({
      icon: AlertTriangle,
      text: `Congestion on Link ${mostCongestedLink[0]} is typically driven by ${topTwo.join(" and ")}.`,
      category: "congestion",
    });

    return items;
  }, [data]);

  const categoryColors = {
    topology: "border-node-du/50 bg-node-du/5",
    capacity: "border-status-high/50 bg-status-high/5",
    congestion: "border-status-medium/50 bg-status-medium/5",
  };

  const iconColors = {
    topology: "text-node-du bg-node-du/20",
    capacity: "text-status-high bg-status-high/20",
    congestion: "text-status-medium bg-status-medium/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">AI Analysis Summary</h2>
            <p className="text-sm text-muted-foreground">
              Key insights derived from fronthaul analysis
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border ${categoryColors[insight.category]}`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${iconColors[insight.category]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-foreground leading-relaxed pt-1">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Grounding Notice */}
      <div className="section-card border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>
            All insights are derived directly from the analysis API response — no predictions or inferences added.
          </span>
        </div>
      </div>
    </div>
  );
}
