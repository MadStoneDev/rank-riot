"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
}

interface TrendLineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function TrendLineChart({
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
}: TrendLineChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        )}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            dot={{ fill: line.color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
