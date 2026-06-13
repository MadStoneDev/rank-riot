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
  homepagePercent: number | null;
  signalCoverage: Record<string, number>;
  totalPages: number;
  topRecommendations: string[];
}

const SCORE_COLORS = {
  good: "var(--color-score-good)",
  moderate: "var(--color-score-warning)",
  poor: "var(--color-score-critical)",
  remaining: "var(--color-surface-elevated)",
};

function getScoreColor(percent: number) {
  if (percent >= 60) return SCORE_COLORS.good;
  if (percent >= 30) return SCORE_COLORS.moderate;
  return SCORE_COLORS.poor;
}

export default function AeoReadinessSection({
  averagePercent,
  homepagePercent,
  signalCoverage,
  totalPages,
  topRecommendations,
}: AeoReadinessSectionProps) {
  const primaryPercent = homepagePercent ?? averagePercent;
  const scoreColor = getScoreColor(primaryPercent);

  const donutData = [
    { name: "Score", value: primaryPercent },
    { name: "Remaining", value: 100 - primaryPercent },
  ];

  const signalEntries = Object.entries(signalCoverage).map(([name, count]) => ({
    name,
    count,
    percent: totalPages > 0 ? Math.round((count / totalPages) * 100) : 0,
  }));

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconBrain className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                AEO / GEO Readiness
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Answer Engine & Generative Engine Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {primaryPercent >= 60 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>Good</span>
              </div>
            )}
            {primaryPercent >= 30 && primaryPercent < 60 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>Needs Work</span>
              </div>
            )}
            {primaryPercent < 30 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)] rounded-full text-sm font-medium">
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
          <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5 flex flex-col items-center">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              {homepagePercent !== null ? "Homepage Score" : "Readiness Overview"}
            </h4>
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
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
                  {primaryPercent}%
                </span>
              </div>
            </div>
            {homepagePercent !== null ? (
              <div className="text-center mt-2">
                <p className="text-xs text-[var(--color-text-muted)]">Homepage AEO/GEO readiness</p>
                <p className="text-xs mt-1">
                  <span className="text-[var(--color-text-muted)]">Site-wide avg: </span>
                  <span className="font-medium" style={{ color: getScoreColor(averagePercent) }}>
                    {averagePercent}%
                  </span>
                  <span className="text-[var(--color-text-muted)]"> across {totalPages} pages</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Average across {totalPages} pages</p>
            )}
          </div>

          {/* Schema Signals */}
          <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Schema Signals</h4>
            <div className="space-y-2.5">
              {signalEntries.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)]">{entry.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
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
                    <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">
                      {entry.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
              <IconBulb className="w-4 h-4 text-[var(--color-score-warning)]" />
              Top Recommendations
            </h4>
            {topRecommendations.length > 0 ? (
              <ul className="space-y-2">
                {topRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-[var(--color-text-secondary)] flex gap-2">
                    <span className="text-[var(--color-primary)] font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                All AEO signals are covered. Great work!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
