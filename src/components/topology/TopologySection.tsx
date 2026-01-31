import { AnalysisResponse } from "@/types/api";
import { TopologyGraph } from "./TopologyGraph";
import { Info } from "lucide-react";

interface TopologySectionProps {
  data: AnalysisResponse;
}

export function TopologySection({ data }: TopologySectionProps) {
  const linkIds = Object.keys(data.topology);
  const totalCells = Object.values(data.topology).reduce(
    (acc, cells) => acc + cells.length,
    0
  );
  const confidenceValues = Object.values(data.topology_confidence);
  const avgConfidence =
    confidenceValues.reduce((acc, c) => acc + c, 0) / confidenceValues.length;
  const outliersList = Array.isArray(data.outliers) ? data.outliers : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="section-card">
          <div className="data-label">Links Detected</div>
          <div className="data-value">{linkIds.length}</div>
        </div>
        <div className="section-card">
          <div className="data-label">Total Cells</div>
          <div className="data-value">{totalCells}</div>
        </div>
        <div className="section-card">
          <div className="data-label">Avg Confidence</div>
          <div className="data-value">{avgConfidence.toFixed(1)}%</div>
        </div>
        <div className="section-card">
          <div className="data-label">Outliers</div>
          <div className="data-value text-status-low">
            {outliersList.length}
          </div>
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="section-card">
        <h2 className="section-title">Inferred Network Topology</h2>
        <p className="section-description">
          Cells grouped by detected fronthaul links with confidence scores
        </p>
        <TopologyGraph data={data} />
      </div>

      {/* Explanation */}
      <div className="explanation-box flex gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">How Topology Inference Works</p>
          <p>
            Cells sharing the same fronthaul link experience correlated packet loss during congestion.
            The system infers topology automatically by analyzing these correlation patterns and assigns 
            a confidence score to each link based on the strength of observed correlations.
          </p>
        </div>
      </div>
    </div>
  );
}
