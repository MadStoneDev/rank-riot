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
} from "recharts";

interface DataPoint {
  name: string;
  critical?: number;
  warning?: number;
  info?: number;
  [key: string]: string | number | undefined;
}

interface StackedBarChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

const SEVERITY_COLORS = {
  critical: "#ef4444", // red-500
  warning: "#f97316", // orange-500
  info: "#3b82f6", // blue-500
};

export default function StackedBarChart({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
}: StackedBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-neutral-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-neutral-500 text-sm">No data available</p>
      </div>
    );
  }

  // Check which severity levels have data
  const hasCritical = data.some((d) => (d.critical || 0) > 0);
  const hasWarning = data.some((d) => (d.warning || 0) > 0);
  const hasInfo = data.some((d) => (d.info || 0) > 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        )}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value, name) => {
            const label = name === "critical" ? "Critical" : name === "warning" ? "Warning" : "Info";
            return [value, label];
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            formatter={(value: string) => {
              return value === "critical" ? "Critical" : value === "warning" ? "Warning" : "Info";
            }}
          />
        )}
        {hasCritical && (
          <Bar
            dataKey="critical"
            stackId="issues"
            fill={SEVERITY_COLORS.critical}
            radius={[0, 0, 0, 0]}
          />
        )}
        {hasWarning && (
          <Bar
            dataKey="warning"
            stackId="issues"
            fill={SEVERITY_COLORS.warning}
            radius={[0, 0, 0, 0]}
          />
        )}
        {hasInfo && (
          <Bar
            dataKey="info"
            stackId="issues"
            fill={SEVERITY_COLORS.info}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
