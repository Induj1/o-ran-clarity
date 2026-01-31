import { AnalysisResponse } from "@/types/api";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

interface TrafficPatternChartProps {
  data: AnalysisResponse;
}

const LINK_COLORS = [
  "hsl(195, 70%, 50%)",
  "hsl(168, 55%, 45%)",
  "hsl(142, 50%, 48%)",
  "hsl(38, 75%, 55%)",
  "hsl(280, 45%, 55%)",
];

const MAX_DATA_POINTS = 200;

function downsampleData(times: number[], values: number[], targetPoints: number) {
  if (times.length <= targetPoints) {
    return times.map((t, i) => ({ time: t, value: values[i] }));
  }

  const result: { time: number; value: number }[] = [];
  const bucketSize = (times.length - 2) / (targetPoints - 2);

  result.push({ time: times[0], value: values[0] });

  for (let i = 0; i < targetPoints - 2; i++) {
    const bucketStart = Math.floor(i * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    let maxIdx = bucketStart;
    let maxVal = values[bucketStart];
    for (let j = bucketStart + 1; j < bucketEnd && j < times.length - 1; j++) {
      if (values[j] > maxVal) {
        maxVal = values[j];
        maxIdx = j;
      }
    }
    result.push({ time: times[maxIdx], value: values[maxIdx] });
  }

  result.push({ time: times[times.length - 1], value: values[values.length - 1] });
  return result;
}

export function TrafficPatternChart({ data }: TrafficPatternChartProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const links = Object.keys(data.traffic_patterns || {});

  const { chartData, timeRange, stats } = useMemo(() => {
    if (links.length === 0) {
      return { chartData: [], timeRange: { min: 0, max: 60 }, stats: {} };
    }

    const downsampledLinks: Record<string, { time: number; value: number }[]> = {};
    const statsMap: Record<string, { max: number; avg: number; count: number }> = {};
    let globalMin = Infinity;
    let globalMax = -Infinity;

    links.forEach((linkId) => {
      const pattern = data.traffic_patterns[linkId];
      if (pattern?.time_seconds && pattern?.data_rate_gbps) {
        const times = pattern.time_seconds;
        const values = pattern.data_rate_gbps;
        
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        statsMap[linkId] = { max, avg, count: values.length };

        if (times.length > 0) {
          globalMin = Math.min(globalMin, times[0]);
          globalMax = Math.max(globalMax, times[times.length - 1]);
        }

        downsampledLinks[linkId] = downsampleData(times, values, MAX_DATA_POINTS);
      }
    });

    const allTimes = new Set<number>();
    Object.values(downsampledLinks).forEach((points) => {
      points.forEach((p) => allTimes.add(p.time));
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

    const chartData = sortedTimes.map((time) => {
      const point: Record<string, number> = { time };
      links.forEach((linkId) => {
        const linkData = downsampledLinks[linkId];
        if (linkData) {
          const closest = linkData.find((p) => p.time === time);
          if (closest) {
            point[`link_${linkId}`] = closest.value;
          }
        }
      });
      return point;
    });

    return {
      chartData,
      timeRange: { min: globalMin === Infinity ? 0 : globalMin, max: globalMax === -Infinity ? 60 : globalMax },
      stats: statsMap,
    };
  }, [data, links]);

  const tickValues = useMemo(() => {
    const range = timeRange.max - timeRange.min;
    let interval = 10;
    if (range <= 10) interval = 1;
    else if (range <= 30) interval = 5;
    else if (range <= 60) interval = 10;
    else interval = Math.ceil(range / 6);

    const ticks: number[] = [];
    for (let t = Math.ceil(timeRange.min / interval) * interval; t <= timeRange.max; t += interval) {
      ticks.push(t);
    }
    return ticks;
  }, [timeRange]);

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
          <span className="text-xs text-muted-foreground">{chartData.length} points</span>
        </div>
      </div>

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
                  fontSize: "12px",
                }}
                labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
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
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links
          .filter((linkId) => selectedLink === null || selectedLink === linkId)
          .map((linkId, idx) => {
            const linkStats = stats[linkId] || { max: 0, avg: 0, count: 0 };
            const confidence = data.confidence?.[linkId] || 0;

            return (
              <div key={linkId} className="p-4 rounded-xl border border-border bg-card/50">
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
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Peak</div>
                    <div className="font-mono font-medium">{linkStats.max.toFixed(1)} Gbps</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Avg</div>
                    <div className="font-mono font-medium">{linkStats.avg.toFixed(1)} Gbps</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Samples</div>
                    <div className="font-mono font-medium">{linkStats.count.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
