import { AnalysisResponse } from "@/types/api";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

interface TrafficPatternChartProps {
  data: AnalysisResponse;
}

// Generate distinct colors for cells
const CELL_COLORS = [
  "hsl(195, 70%, 50%)",   // chart-1
  "hsl(168, 55%, 45%)",   // chart-2
  "hsl(142, 50%, 48%)",   // chart-3
  "hsl(38, 75%, 55%)",    // chart-4
  "hsl(280, 45%, 55%)",   // chart-5
  "hsl(0, 65%, 55%)",     // chart-6
  "hsl(210, 60%, 55%)",   // chart-7
  "hsl(320, 50%, 55%)",   // chart-8
  "hsl(60, 60%, 45%)",
  "hsl(180, 50%, 45%)",
  "hsl(240, 50%, 55%)",
  "hsl(300, 45%, 50%)",
];

export function TrafficPatternChart({ data }: TrafficPatternChartProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  // Generate simulated packet loss data based on root cause attribution
  const chartData = useMemo(() => {
    const timePoints: Record<number, Record<string, number>> = {};
    
    // Use a time range from 0 to 5 seconds with 0.1s intervals for more granular data
    for (let t = 0; t <= 5; t += 0.1) {
      const roundedT = Math.round(t * 10) / 10;
      timePoints[roundedT] = { time: roundedT };
    }

    // Get all unique cell IDs
    const allCells = new Set<number>();
    Object.values(data.topology).forEach((cells) => {
      cells.forEach((cellId) => allCells.add(cellId));
    });

    // Initialize all cells with baseline values
    Object.keys(timePoints).forEach((tKey) => {
      const t = parseFloat(tKey);
      allCells.forEach((cellId) => {
        const cellKey = `cell_${cellId}`;
        // Create varied baseline noise with different patterns per cell
        const baseNoise = Math.sin(t * 2 + cellId) * 0.02 + 0.03;
        timePoints[t][cellKey] = Math.max(0, baseNoise + Math.random() * 0.02);
      });
    });

    // Add loss spikes based on root cause attribution
    Object.entries(data.root_cause_attribution).forEach(([linkId, events]) => {
      events.forEach((event) => {
        // Map event time to our 0-5s range
        const normalizedTime = ((event.time_sec - 1) / 3) * 5; // Map 1-4s to 0-5s range
        const baseTime = Math.round(normalizedTime * 10) / 10;
        
        event.contributors.forEach((contrib, contribIdx) => {
          const cellKey = `cell_${contrib.cell_id}`;
          
          // Create a spike around the event time with some spread
          for (let offset = -0.3; offset <= 0.3; offset += 0.1) {
            const t = Math.round((baseTime + offset + contribIdx * 0.1) * 10) / 10;
            if (t >= 0 && t <= 5 && timePoints[t]) {
              // Calculate spike height based on contribution percentage
              const spikeHeight = (contrib.pct / 100) * (0.4 + Math.random() * 0.3);
              const decay = 1 - Math.abs(offset) * 2; // Decay away from center
              timePoints[t][cellKey] = Math.min(1, (timePoints[t][cellKey] || 0) + spikeHeight * decay);
            }
          }
        });
      });
    });

    return Object.values(timePoints)
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, [data]);

  const links = Object.keys(data.topology);

  return (
    <div className="section-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="section-title mb-0">Traffic Pattern Snapshot</h3>
            <p className="text-sm text-muted-foreground">Correlated Packet Loss (cells sharing link correlate)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Real-time correlation analysis</span>
        </div>
      </div>

      {/* Link Selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedLink(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedLink === null
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All Links
        </button>
        {links.map((linkId) => (
          <button
            key={linkId}
            onClick={() => setSelectedLink(linkId)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedLink === linkId
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Link {linkId}
          </button>
        ))}
      </div>

      {/* Charts per Link */}
      <div className="space-y-6">
        {links
          .filter((linkId) => selectedLink === null || selectedLink === linkId)
          .map((linkId) => {
            const cells = data.topology[linkId];
            const confidence = data.topology_confidence[linkId];

            return (
              <div
                key={linkId}
                className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CELL_COLORS[parseInt(linkId) % CELL_COLORS.length] }}
                    />
                    <span className="font-medium text-foreground">
                      Link {linkId} - packet loss over time
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (cells sharing link correlate)
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {confidence}% confidence
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickFormatter={(v) => `${v.toFixed(1)}s`}
                        interval={9}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        domain={[0, 1]}
                        ticks={[0, 0.25, 0.5, 0.75, 1]}
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        labelFormatter={(value) => `Time: ${value}s`}
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, ""]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                        iconType="circle"
                        iconSize={8}
                      />
                      {cells.slice(0, 6).map((cellId, idx) => (
                        <Line
                          key={cellId}
                          type="monotone"
                          dataKey={`cell_${cellId}`}
                          name={`Cell ${cellId}`}
                          stroke={CELL_COLORS[idx % CELL_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5, fill: CELL_COLORS[idx % CELL_COLORS.length], strokeWidth: 2, stroke: "hsl(var(--background))" }}
                          connectNulls
                        />
                      ))}
                      {cells.length > 6 && (
                        <Line
                          type="monotone"
                          dataKey={() => null}
                          name={`+${cells.length - 6} more cells`}
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={0}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
