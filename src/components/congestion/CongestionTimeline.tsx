import { CongestionEvent } from "@/types/api";
import { useMemo, memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CongestionTimelineProps {
  events: CongestionEvent[];
}

const CELL_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--status-medium))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 58%)",
  "hsl(330, 81%, 60%)",
];

const MAX_EVENTS = 100; // Limit chart data points

export const CongestionTimeline = memo(function CongestionTimeline({ events }: CongestionTimelineProps) {
  const { chartData, allCells, cellColors } = useMemo(() => {
    // Downsample events if too many
    let sampled = events;
    if (events.length > MAX_EVENTS) {
      const step = events.length / MAX_EVENTS;
      sampled = [];
      for (let i = 0; i < MAX_EVENTS; i++) {
        sampled.push(events[Math.floor(i * step)]);
      }
    }

    // Get unique cells
    const cellSet = new Set<string>();
    sampled.forEach((event) => {
      event.contributors.forEach((c) => cellSet.add(c.cell_id));
    });
    const allCells = Array.from(cellSet).sort().slice(0, 8); // Limit to 8 cells for readability

    // Assign colors
    const cellColors: Record<string, string> = {};
    allCells.forEach((cell, idx) => {
      cellColors[cell] = CELL_COLORS[idx % CELL_COLORS.length];
    });

    // Build chart data
    const chartData = sampled
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((event) => {
        const point: Record<string, number | string> = {
          timestamp: event.timestamp,
          time: `${event.timestamp.toFixed(1)}s`,
        };
        allCells.forEach((cell) => (point[cell] = 0));
        event.contributors.forEach((c) => {
          if (allCells.includes(c.cell_id)) {
            point[c.cell_id] = c.contribution_percent;
          }
        });
        return point;
      });

    return { chartData, allCells, cellColors };
  }, [events]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="section-card">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
              iconType="circle"
              iconSize={8}
            />
            {allCells.map((cell) => (
              <Line
                key={cell}
                type="monotone"
                dataKey={cell}
                stroke={cellColors[cell]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
