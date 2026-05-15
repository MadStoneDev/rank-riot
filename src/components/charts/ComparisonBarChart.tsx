"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

interface ComparisonDataPoint {
  name: string;
  previous: number;
  current: number;
  change?: number;
}

interface ComparisonBarChartProps {
  data: ComparisonDataPoint[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  previousLabel?: string;
  currentLabel?: string;
}

export default function ComparisonBarChart({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
  previousLabel = "Previous Scan",
  currentLabel = "Current Scan",
}: ComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-[var(--color-surface-overlay)] rounded-lg"
        style={{ height }}
      >
        <p className="text-[var(--color-text-muted)] text-sm">No comparison data available</p>
      </div>
    );
  }

  // Calculate change for tooltip
  const dataWithChange = data.map((d) => ({
    ...d,
    change: d.current - d.previous,
    changePercent:
      d.previous > 0
        ? Math.round(((d.current - d.previous) / d.previous) * 100)
        : d.current > 0
        ? 100
        : 0,
  }));

  return (
    <div role="img" aria-label="Comparison bar chart showing previous vs current scan data" style={{ width: "100%", height }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataWithChange}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        barGap={2}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        )}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          tickLine={{ stroke: "var(--color-border-subtle)" }}
          axisLine={{ stroke: "var(--color-border-subtle)" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          tickLine={{ stroke: "var(--color-border-subtle)" }}
          axisLine={{ stroke: "var(--color-border-subtle)" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface-overlay)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null;

            const item = payload[0]?.payload;
            const changeColor =
              item.change > 0
                ? "text-[var(--color-score-critical)]"
                : item.change < 0
                ? "text-[var(--color-score-good)]"
                : "text-[var(--color-text-secondary)]";

            return (
              <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border-default)] rounded-lg p-3 shadow-lg">
                <p className="font-medium text-[var(--color-text-primary)] mb-2">{label}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-[var(--color-text-muted)]">
                    {previousLabel}: <span className="text-[var(--color-text-primary)] font-medium">{item.previous}</span>
                  </p>
                  <p className="text-[var(--color-text-muted)]">
                    {currentLabel}: <span className="text-[var(--color-text-primary)] font-medium">{item.current}</span>
                  </p>
                  <p className={changeColor}>
                    Change: {item.change > 0 ? "+" : ""}
                    {item.change} ({item.change > 0 ? "+" : ""}
                    {item.changePercent}%)
                  </p>
                </div>
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          />
        )}
        <Bar
          dataKey="previous"
          name={previousLabel}
          fill="var(--color-surface-hover)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="current"
          name={currentLabel}
          radius={[4, 4, 0, 0]}
        >
          {dataWithChange.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.change > 0
                  ? "#ef4444" // red - more issues is bad
                  : entry.change < 0
                  ? "#22c55e" // green - fewer issues is good
                  : "#3b82f6" // blue - no change
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
