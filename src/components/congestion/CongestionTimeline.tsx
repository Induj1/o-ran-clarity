import { CongestionEvent } from "@/types/api";
import { useMemo } from "react";
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

// Generate distinct colors for cells
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

export function CongestionTimeline({ events }: CongestionTimelineProps) {
  // Transform events into chart data format
  const { chartData, allCells, cellColors } = useMemo(() => {
    // Get all unique cells across all events
    const cellSet = new Set<string>();
    events.forEach((event) => {
      event.contributors.forEach((c) => cellSet.add(c.cell_id));
    });
    const allCells = Array.from(cellSet).sort();

    // Assign colors to cells
    const cellColors: Record<string, string> = {};
    allCells.forEach((cell, idx) => {
      cellColors[cell] = CELL_COLORS[idx % CELL_COLORS.length];
    });

    // Build chart data points
    const chartData = events
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((event) => {
        const point: Record<string, number | string> = {
          timestamp: event.timestamp,
          time: `t=${event.timestamp.toFixed(2)}s`,
          link: event.link_id,
        };
        // Initialize all cells to 0
        allCells.forEach((cell) => {
          point[cell] = 0;
        });
        // Set actual contribution values
        event.contributors.forEach((c) => {
          point[c.cell_id] = c.contribution_percent;
        });
        return point;
      });

    return { chartData, allCells, cellColors };
  }, [events]);

  return (
    <div className="section-card">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
            {allCells.map((cell) => (
              <Line
                key={cell}
                type="monotone"
                dataKey={cell}
                stroke={cellColors[cell]}
                strokeWidth={2}
                dot={{ r: 4, fill: cellColors[cell] }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={1500}
                animationBegin={0}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
