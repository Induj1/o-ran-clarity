import { AnalysisResponse } from "@/types/api";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

interface TrafficPatternChartProps {
  data: AnalysisResponse;
}

// Generate distinct colors for links
const LINK_COLORS = [
  "hsl(195, 70%, 50%)",   // chart-1
  "hsl(168, 55%, 45%)",   // chart-2
  "hsl(142, 50%, 48%)",   // chart-3
  "hsl(38, 75%, 55%)",    // chart-4
  "hsl(280, 45%, 55%)",   // chart-5
];

export function TrafficPatternChart({ data }: TrafficPatternChartProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  // Transform traffic_patterns from API into chart data format
  const { chartData, timeRange } = useMemo(() => {
    const links = Object.keys(data.traffic_patterns || {});
    if (links.length === 0) {
      return { chartData: [], timeRange: { min: 0, max: 60 } };
    }

    // Get all unique time points across all links
    const allTimePoints = new Set<number>();
    links.forEach((linkId) => {
      const pattern = data.traffic_patterns[linkId];
      if (pattern?.time_seconds) {
        pattern.time_seconds.forEach((t) => allTimePoints.add(t));
      }
    });

    const sortedTimes = Array.from(allTimePoints).sort((a, b) => a - b);
    const minTime = sortedTimes[0] || 0;
    const maxTime = sortedTimes[sortedTimes.length - 1] || 60;

    // Build chart data with all links' data rates at each time point
    const chartData = sortedTimes.map((time) => {
      const point: Record<string, number> = { time };
      
      links.forEach((linkId) => {
        const pattern = data.traffic_patterns[linkId];
        if (pattern?.time_seconds && pattern?.data_rate_gbps) {
          const idx = pattern.time_seconds.indexOf(time);
          if (idx !== -1) {
            point[`link_${linkId}`] = pattern.data_rate_gbps[idx];
          }
        }
      });
      
      return point;
    });

    return { 
      chartData, 
      timeRange: { min: minTime, max: maxTime } 
    };
  }, [data]);

  const links = Object.keys(data.traffic_patterns || {});

  // Calculate appropriate tick interval based on time range
  const tickInterval = useMemo(() => {
    const range = timeRange.max - timeRange.min;
    if (range <= 10) return 1;
    if (range <= 30) return 5;
    if (range <= 60) return 10;
    return Math.ceil(range / 6);
  }, [timeRange]);

  // Generate tick values
  const tickValues = useMemo(() => {
    const ticks: number[] = [];
    for (let t = Math.ceil(timeRange.min / tickInterval) * tickInterval; t <= timeRange.max; t += tickInterval) {
      ticks.push(t);
    }
    return ticks;
  }, [timeRange, tickInterval]);

  if (links.length === 0) {
    return (
      <div className="section-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="section-title mb-0">Traffic Pattern</h3>
            <p className="text-sm text-muted-foreground">No traffic data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="section-title mb-0">Traffic Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Data rate over time ({timeRange.min.toFixed(0)}s - {timeRange.max.toFixed(0)}s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Live traffic analysis</span>
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

      {/* Chart */}
      <div className="p-4 rounded-xl border border-border bg-card/50">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(v) => `${v}s`}
                ticks={tickValues}
                domain={[timeRange.min, timeRange.max]}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(v) => `${v.toFixed(1)} Gbps`}
                width={70}
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
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} Gbps`,
                  name.replace("link_", "Link "),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => value.replace("link_", "Link ")}
              />
              {links
                .filter((linkId) => selectedLink === null || selectedLink === linkId)
                .map((linkId, idx) => (
                  <Line
                    key={linkId}
                    type="monotone"
                    dataKey={`link_${linkId}`}
                    name={`link_${linkId}`}
                    stroke={LINK_COLORS[idx % LINK_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ 
                      r: 5, 
                      fill: LINK_COLORS[idx % LINK_COLORS.length], 
                      strokeWidth: 2, 
                      stroke: "hsl(var(--background))" 
                    }}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Link Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links
          .filter((linkId) => selectedLink === null || selectedLink === linkId)
          .map((linkId, idx) => {
            const pattern = data.traffic_patterns[linkId];
            const rates = pattern?.data_rate_gbps || [];
            const maxRate = Math.max(...rates);
            const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
            const confidence = data.confidence?.[linkId] || 0;

            return (
              <div
                key={linkId}
                className="p-4 rounded-xl border border-border bg-card/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: LINK_COLORS[idx % LINK_COLORS.length] }}
                  />
                  <span className="font-medium text-foreground">Link {linkId}</span>
                  <span className="text-xs px-2 py-0.5 bg-status-medium/10 text-status-medium rounded-full ml-auto">
                    {confidence}% confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Peak Rate</div>
                    <div className="font-mono font-medium">{maxRate.toFixed(2)} Gbps</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Avg Rate</div>
                    <div className="font-mono font-medium">{avgRate.toFixed(2)} Gbps</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
