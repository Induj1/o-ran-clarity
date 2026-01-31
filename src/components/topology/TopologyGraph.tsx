import { useMemo } from "react";
import { AnalysisResponse } from "@/types/api";
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
  if (confidence >= 80) return "high";
  if (confidence >= 60) return "medium";
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
      {confidence.toFixed(0)}%
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
  // Build outlier map
  const outlierMap = useMemo(() => {
    const map = new Map<string, { reason?: string }>();
    const outliersList = Array.isArray(data.outliers) ? data.outliers : [];
    outliersList.forEach((o) => map.set(`Cell ${o.cell_id}`, { reason: o.reason }));
    return map;
  }, [data.outliers]);

  // Transform topology to array format
  const links = useMemo(() => {
    return Object.entries(data.topology).map(([linkId, cellIds]) => ({
      link_id: `Link ${linkId}`,
      cells: cellIds.map((id) => `Cell ${id}`),
      confidence: data.topology_confidence[linkId] ?? 0,
    }));
  }, [data.topology, data.topology_confidence]);

  return (
    <div className="relative">
      {/* DU Node - Center Top */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-node-du/20 text-node-du border border-node-du/30 font-semibold">
          <Server className="w-5 h-5" />
          DU (Distributed Unit)
        </div>
      </div>

      {/* Connection Lines - SVG overlay */}
      <div className="relative">
        {/* SVG for connection lines */}
        <svg 
          className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible"
          style={{ zIndex: 1 }}
        >
          {/* Lines from DU to each link */}
          {links.map((link, idx) => {
            const level = getConfidenceLevel(link.confidence);
            const totalLinks = links.length;
            // Calculate x position for each link (evenly distributed)
            const xPercent = ((idx + 0.5) / totalLinks) * 100;
            
            const strokeColor = level === "high" 
              ? "hsl(var(--status-high))" 
              : level === "medium" 
                ? "hsl(var(--status-medium))" 
                : "hsl(var(--status-low))";

            return (
              <line
                key={link.link_id}
                x1="50%"
                y1="0"
                x2={`${xPercent}%`}
                y2="100%"
                stroke={strokeColor}
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}
        </svg>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 relative" style={{ zIndex: 2 }}>
          {links.map((link) => {
            const confidenceValue = link.confidence;
            const level = getConfidenceLevel(confidenceValue);

            return (
              <div
                key={link.link_id}
                className={cn(
                  "relative p-4 rounded-lg border transition-all bg-card",
                  level === "high" && "border-status-high/30",
                  level === "medium" && "border-status-medium/30",
                  level === "low" && "border-status-low/30"
                )}
              >
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
