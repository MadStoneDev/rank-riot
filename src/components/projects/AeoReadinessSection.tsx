"use client";

import {
  IconBrain,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconBulb,
} from "@tabler/icons-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AeoReadinessSectionProps {
  averagePercent: number;
  signalCoverage: Record<string, number>;
  totalPages: number;
  topRecommendations: string[];
}

const SCORE_COLORS = {
  good: "#16a34a",
  moderate: "#ca8a04",
  poor: "#dc2626",
  remaining: "#e5e5e5",
};

export default function AeoReadinessSection({
  averagePercent,
  signalCoverage,
  totalPages,
  topRecommendations,
}: AeoReadinessSectionProps) {
  const scoreColor =
    averagePercent >= 60
      ? SCORE_COLORS.good
      : averagePercent >= 30
        ? SCORE_COLORS.moderate
        : SCORE_COLORS.poor;

  const donutData = [
    { name: "Score", value: averagePercent },
    { name: "Remaining", value: 100 - averagePercent },
  ];

  const signalEntries = Object.entries(signalCoverage).map(([name, count]) => ({
    name,
    count,
    percent: totalPages > 0 ? Math.round((count / totalPages) * 100) : 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconBrain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">
                AEO / GEO Readiness
              </h3>
              <p className="text-sm text-neutral-500">
                Answer Engine & Generative Engine Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {averagePercent >= 60 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>Good</span>
              </div>
            )}
            {averagePercent >= 30 && averagePercent < 60 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>Needs Work</span>
              </div>
            )}
            {averagePercent < 30 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>Low</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="bg-neutral-50 rounded-xl p-5 flex flex-col items-center">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Readiness Overview</h4>
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill={scoreColor} />
                    <Cell fill={SCORE_COLORS.remaining} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                  {averagePercent}%
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Average across {totalPages} pages</p>
          </div>

          {/* Schema Signals */}
          <div className="bg-neutral-50 rounded-xl p-5">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Schema Signals</h4>
            <div className="space-y-2.5">
              {signalEntries.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{entry.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${entry.percent}%`,
                          backgroundColor:
                            entry.percent >= 60
                              ? SCORE_COLORS.good
                              : entry.percent >= 30
                                ? SCORE_COLORS.moderate
                                : SCORE_COLORS.poor,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 w-8 text-right">
                      {entry.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-neutral-50 rounded-xl p-5">
            <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-1.5">
              <IconBulb className="w-4 h-4 text-yellow-500" />
              Top Recommendations
            </h4>
            {topRecommendations.length > 0 ? (
              <ul className="space-y-2">
                {topRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400">
                All AEO signals are covered. Great work!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
