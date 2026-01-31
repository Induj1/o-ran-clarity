import { useMemo } from "react";
import { AnalysisResponse, Outlier, TopologyConfidence } from "@/types/api";
import { cn } from "@/lib/utils";
import { AlertTriangle, Server, Radio, Link as LinkIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopologyGraphProps {
  data: AnalysisResponse;
}

function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 90) return "high";
  if (confidence >= 75) return "medium";
  return "low";
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level = getConfidenceLevel(confidence);
  
  return (
    <span
      className={cn(
        "text-xs font-mono px-1.5 py-0.5 rounded",
        level === "high" && "bg-status-high/20 text-status-high",
        level === "medium" && "bg-status-medium/20 text-status-medium",
        level === "low" && "bg-status-low/20 text-status-low"
      )}
    >
      {confidence.toFixed(1)}%
    </span>
  );
}

function CellNode({ 
  cellId, 
  isOutlier,
  outlierReason 
}: { 
  cellId: string; 
  isOutlier: boolean;
  outlierReason?: string;
}) {
  const node = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        isOutlier
          ? "bg-status-low/20 text-status-low border border-dashed border-status-low"
          : "bg-node-cell/20 text-node-cell"
      )}
    >
      <Radio className="w-3 h-3" />
      {cellId}
      {isOutlier && <AlertTriangle className="w-3 h-3 ml-1" />}
    </div>
  );

  if (isOutlier) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">
            <strong>Outlier Detected:</strong> {outlierReason || "This cell shows weaker correlation with the rest of the link"}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return node;
}

export function TopologyGraph({ data }: TopologyGraphProps) {
  const outlierMap = useMemo(() => {
    const map = new Map<string, Outlier>();
    data.outliers.forEach((o) => map.set(o.cell_id, o));
    return map;
  }, [data.outliers]);

  const confidenceMap = useMemo(() => {
    const map = new Map<string, TopologyConfidence>();
    data.confidence.forEach((c) => map.set(c.link_id, c));
    return map;
  }, [data.confidence]);

  return (
    <div className="relative">
      {/* DU Node - Center Top */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-node-du/20 text-node-du border border-node-du/30 font-semibold">
          <Server className="w-5 h-5" />
          DU (Distributed Unit)
        </div>
      </div>

      {/* Connection Lines Container */}
      <div className="relative">
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.topology.links.map((link) => {
            const confidence = confidenceMap.get(link.link_id);
            const confidenceValue = confidence?.confidence ?? 0;
            const level = getConfidenceLevel(confidenceValue);

            return (
              <div
                key={link.link_id}
                className={cn(
                  "relative p-4 rounded-lg border transition-all",
                  level === "high" && "border-status-high/30 bg-status-high/5",
                  level === "medium" && "border-status-medium/30 bg-status-medium/5",
                  level === "low" && "border-status-low/30 bg-status-low/5"
                )}
              >
                {/* Vertical connector line */}
                <div
                  className={cn(
                    "absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8",
                    level === "high" && "bg-status-high/50",
                    level === "medium" && "bg-status-medium/50",
                    level === "low" && "bg-status-low/50"
                  )}
                />

                {/* Link Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center",
                        level === "high" && "bg-status-high/20 text-status-high",
                        level === "medium" && "bg-status-medium/20 text-status-medium",
                        level === "low" && "bg-status-low/20 text-status-low"
                      )}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-foreground">{link.link_id}</span>
                  </div>
                  <ConfidenceBadge confidence={confidenceValue} />
                </div>

                {/* Cells */}
                <div className="flex flex-wrap gap-2">
                  {link.cells.map((cellId) => {
                    const outlier = outlierMap.get(cellId);
                    return (
                      <CellNode
                        key={cellId}
                        cellId={cellId}
                        isOutlier={!!outlier}
                        outlierReason={outlier?.reason}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
