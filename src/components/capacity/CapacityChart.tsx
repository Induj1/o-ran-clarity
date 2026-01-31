import { AnalysisResponse } from "@/types/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { useMemo } from "react";

interface CapacityChartProps {
  data: AnalysisResponse;
}

export function CapacityChart({ data }: CapacityChartProps) {
  const chartData = useMemo(() => {
    const linkIds = Object.keys(data.capacity.no_buffer_gbps);
    
    return linkIds.map((linkId) => {
      const savings = data.bandwidth_savings_pct[linkId] ?? 0;
      return {
        link: `Link ${linkId}`,
        noBuffer: data.capacity.no_buffer_gbps[linkId],
        withBuffer: data.capacity.with_buffer_gbps[linkId],
        savings,
      };
    });
  }, [data]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="link"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: "Capacity (Gbps)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="noBuffer"
            name="Without Buffer"
            fill="hsl(var(--chart-4))"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-no-${index}`} />
            ))}
          </Bar>
          <Bar
            dataKey="withBuffer"
            name="With Buffer"
            fill="hsl(var(--chart-3))"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="savings"
              position="top"
              formatter={(value: number) => `-${value.toFixed(1)}%`}
              style={{
                fill: "hsl(var(--status-high))",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
