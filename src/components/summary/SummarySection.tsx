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

    // Topology insights
    items.push({
      icon: GitBranch,
      text: `${data.topology.links.length} fronthaul links were inferred from packet-loss correlation analysis.`,
      category: "topology",
    });

    const highestConfLink = data.confidence.reduce((prev, curr) =>
      curr.confidence > prev.confidence ? curr : prev
    );
    items.push({
      icon: CheckCircle2,
      text: `${highestConfLink.link_id} shows the highest topology confidence at ${highestConfLink.confidence.toFixed(1)}%.`,
      category: "topology",
    });

    if (data.outliers.length > 0) {
      const outlierCells = data.outliers.map((o) => o.cell_id).join(", ");
      items.push({
        icon: AlertTriangle,
        text: `Outlier detected: ${outlierCells} shows weaker correlation with assigned link traffic patterns.`,
        category: "topology",
      });
    }

    // Capacity insights
    const maxSaving = data.bandwidth_savings.reduce((prev, curr) =>
      curr.savings_percent > prev.savings_percent ? curr : prev
    );
    items.push({
      icon: TrendingDown,
      text: `Buffering reduces required capacity by up to ${maxSaving.savings_percent.toFixed(1)}% on ${maxSaving.link_id}.`,
      category: "capacity",
    });

    const totalReduction =
      Object.values(data.capacities.no_buffer).reduce((a, b) => a + b, 0) -
      Object.values(data.capacities.with_buffer).reduce((a, b) => a + b, 0);
    items.push({
      icon: TrendingDown,
      text: `Total network capacity can be reduced by ${totalReduction.toFixed(1)} Gbps while maintaining ≤1% packet loss.`,
      category: "capacity",
    });

    // Congestion insights
    const eventsByLink: Record<string, number> = {};
    data.root_cause_attribution.events.forEach((e) => {
      eventsByLink[e.link_id] = (eventsByLink[e.link_id] || 0) + 1;
    });
    const mostCongestedLink = Object.entries(eventsByLink).reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );

    // Find top contributors for that link
    const topContributors = data.root_cause_attribution.events
      .filter((e) => e.link_id === mostCongestedLink[0])
      .flatMap((e) => e.contributors)
      .reduce((acc, c) => {
        acc[c.cell_id] = (acc[c.cell_id] || 0) + c.contribution_percent;
        return acc;
      }, {} as Record<string, number>);

    const topTwo = Object.entries(topContributors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id);

    items.push({
      icon: AlertTriangle,
      text: `Congestion on ${mostCongestedLink[0]} is typically driven by ${topTwo.join(" and ")}.`,
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
