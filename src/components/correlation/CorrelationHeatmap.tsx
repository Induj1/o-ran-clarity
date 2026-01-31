import { AnalysisResponse } from "@/types/api";
import { useMemo } from "react";
import { Grid3X3 } from "lucide-react";

interface CorrelationHeatmapProps {
  data: AnalysisResponse;
}

// Color scale from blue (low) to red (high correlation)
function getCorrelationColor(value: number): string {
  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value));
  
  if (v < 0.2) {
    // Low: Blue shades
    return `hsl(210, 70%, ${70 - v * 100}%)`;
  } else if (v < 0.5) {
    // Medium-low: Blue to cyan
    return `hsl(${210 - (v - 0.2) * 100}, 60%, 55%)`;
  } else if (v < 0.7) {
    // Medium: Cyan to yellow
    return `hsl(${170 - (v - 0.5) * 340}, 70%, 50%)`;
  } else if (v < 0.9) {
    // Medium-high: Yellow to orange
    return `hsl(${50 - (v - 0.7) * 100}, 80%, 50%)`;
  } else {
    // High: Orange to red
    return `hsl(${30 - (v - 0.9) * 300}, 85%, 50%)`;
  }
}

export function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
  const { matrix, cells, maxCells } = useMemo(() => {
    const cells = data.cells || [];
    const matrix = data.correlation_matrix || [];
    
    // Limit to 24 cells max for performance/readability
    const maxCells = Math.min(cells.length, 24);
    
    return { 
      matrix: matrix.slice(0, maxCells).map(row => row.slice(0, maxCells)), 
      cells: cells.slice(0, maxCells),
      maxCells 
    };
  }, [data]);

  if (cells.length === 0 || matrix.length === 0) {
    return (
      <div className="section-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="section-title mb-0">Correlation Matrix</h3>
            <p className="text-sm text-muted-foreground">No correlation data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate cell size based on number of cells
  const cellSize = maxCells <= 10 ? 36 : maxCells <= 16 ? 28 : 22;
  const fontSize = maxCells <= 10 ? 10 : maxCells <= 16 ? 8 : 7;

  return (
    <div className="section-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="section-title mb-0">Cell Correlation Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Traffic correlation between cells (high = same link)
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {cells.length} cells
        </span>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* Column headers */}
          <div className="flex" style={{ marginLeft: cellSize + 4 }}>
            {cells.map((cellId) => (
              <div
                key={`col-${cellId}`}
                className="text-center font-mono text-muted-foreground"
                style={{ 
                  width: cellSize, 
                  fontSize,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  height: cellSize * 0.8,
                }}
              >
                {cellId}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          <div className="flex flex-col gap-[1px]">
            {matrix.map((row, i) => (
              <div key={`row-${i}`} className="flex gap-[1px] items-center">
                {/* Row label */}
                <div
                  className="text-right font-mono text-muted-foreground pr-1"
                  style={{ width: cellSize, fontSize }}
                >
                  {cells[i]}
                </div>
                
                {/* Row cells */}
                {row.map((value, j) => {
                  const isDiagonal = i === j;
                  
                  return (
                    <div
                      key={`cell-${i}-${j}`}
                      className="group relative cursor-pointer transition-transform hover:scale-110 hover:z-10"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: isDiagonal 
                          ? 'hsl(var(--muted))' 
                          : getCorrelationColor(value),
                        borderRadius: 2,
                      }}
                      title={`Cell ${cells[i]} ↔ Cell ${cells[j]}: ${(value * 100).toFixed(1)}%`}
                    >
                      {/* Value on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-sm">
                        <span className="text-white font-mono" style={{ fontSize: fontSize + 1 }}>
                          {(value * 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex gap-[2px]">
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
            <div
              key={v}
              className="w-8 h-4 rounded-sm"
              style={{ backgroundColor: getCorrelationColor(v) }}
              title={`${(v * 100).toFixed(0)}%`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">High</span>
      </div>

      {/* Interpretation */}
      <div className="text-xs text-muted-foreground text-center">
        High correlation indicates cells share the same fronthaul Ethernet link
      </div>
    </div>
  );
}
