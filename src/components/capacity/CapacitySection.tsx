import { AnalysisResponse } from "@/types/api";
import { CapacityChart } from "./CapacityChart";
import { TrendingDown, Zap } from "lucide-react";

interface CapacitySectionProps {
  data: AnalysisResponse;
}

export function CapacitySection({ data }: CapacitySectionProps) {
  const savingsEntries = Object.entries(data.bandwidth_savings_pct);
  const maxSaving = Math.max(...savingsEntries.map(([, v]) => v));
  const avgSaving =
    savingsEntries.reduce((acc, [, v]) => acc + v, 0) / savingsEntries.length;
  const totalCapacityReduction =
    Object.values(data.capacity.no_buffer_gbps).reduce((a, b) => a + b, 0) -
    Object.values(data.capacity.with_buffer_gbps).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="section-card">
          <div className="data-label">Max Bandwidth Savings</div>
          <div className="data-value text-status-high">{maxSaving.toFixed(1)}%</div>
        </div>
        <div className="section-card">
          <div className="data-label">Avg Savings</div>
          <div className="data-value">{avgSaving.toFixed(1)}%</div>
        </div>
        <div className="section-card">
          <div className="data-label">Total Capacity Reduction</div>
          <div className="data-value text-status-high">{totalCapacityReduction.toFixed(1)} Gbps</div>
        </div>
      </div>

      {/* Chart */}
      <div className="section-card">
        <h2 className="section-title">Link Capacity Comparison</h2>
        <p className="section-description">
          Required capacity with and without buffering optimization
        </p>
        <CapacityChart data={data} />
      </div>

      {/* Savings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {savingsEntries.map(([linkId, savings]) => (
          <div
            key={linkId}
            className="section-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-high/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-status-high" />
              </div>
              <div>
                <div className="font-medium text-foreground">Link {linkId}</div>
                <div className="text-sm text-muted-foreground">Bandwidth saved</div>
              </div>
            </div>
            <div className="status-badge-high text-lg font-mono font-semibold">
              {savings.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="explanation-box flex gap-3">
        <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">Cost-Avoidance Through Buffering</p>
          <p>
            Buffering absorbs short traffic bursts, allowing lower link capacity provisioning 
            while maintaining ≤1% packet loss. This translates to significant infrastructure 
            cost savings without compromising network quality.
          </p>
        </div>
      </div>
    </div>
  );
}
