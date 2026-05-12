"use client";

import { useState, useEffect } from "react";
import { IconChartLine, IconChartBar, IconRefresh } from "@tabler/icons-react";
import { TrendLineChart, StackedBarChart } from "@/components/charts";
import { format } from "date-fns";

interface SnapshotData {
  timestamp: string;
  metrics: {
    totalPages: number;
    indexablePages: number;
    brokenLinks: number;
    avgSeoScore: number;
  };
  issues: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scan: {
    id: string;
    pagesScanned: number;
    issuesFound: number;
  };
}

interface Snapshot {
  id: string;
  scan_id: string;
  snapshot_data: SnapshotData;
  created_at: string;
}

interface HistoricalTrendsProps {
  projectId: string;
}

export default function HistoricalTrends({ projectId }: HistoricalTrendsProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"issues" | "metrics">("issues");

  useEffect(() => {
    fetchSnapshots();
  }, [projectId]);

  const fetchSnapshots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scans/${projectId}/snapshot?limit=12`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      setError("Unable to load historical data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform snapshots for charts
  const issueChartData = snapshots
    .slice()
    .reverse()
    .map((snapshot) => {
      const data = snapshot.snapshot_data;
      const issues = data.issues ?? { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
      return {
        name: format(new Date(snapshot.created_at), "MMM d"),
        critical: issues.critical ?? 0,
        warning: (issues.high ?? 0) + (issues.medium ?? 0),
        info: issues.low ?? 0,
      };
    });

  const metricsChartData = snapshots
    .slice()
    .reverse()
    .map((snapshot) => {
      const data = snapshot.snapshot_data;
      const issues = data.issues ?? { total: 0 };
      const metrics = data.metrics ?? { totalPages: 0, avgSeoScore: 0 };
      return {
        date: format(new Date(snapshot.created_at), "MMM d"),
        pages: metrics.totalPages ?? 0,
        issues: issues.total ?? 0,
        score: metrics.avgSeoScore ?? 0,
      };
    });

  if (isLoading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Historical Trends
          </h2>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Historical Trends
          </h2>
        </div>
        <div className="p-6 text-center py-12">
          <IconChartLine className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3" />
          <p className="text-[var(--color-text-secondary)] font-medium">No historical data yet</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Historical trends will appear after multiple scans are completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Historical Trends
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--color-surface-overlay)] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "issues"
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <IconChartBar className="w-4 h-4 inline-block mr-1" />
              Issues
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "metrics"
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <IconChartLine className="w-4 h-4 inline-block mr-1" />
              Metrics
            </button>
          </div>
          <button
            onClick={fetchSnapshots}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
            title="Refresh data"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "issues" ? (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Issue count by severity over time
            </p>
            <StackedBarChart data={issueChartData} height={280} />
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-severity-critical)" }}></div>
                <span className="text-[var(--color-text-secondary)]">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-severity-high)" }}></div>
                <span className="text-[var(--color-text-secondary)]">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-primary)" }}></div>
                <span className="text-[var(--color-text-secondary)]">Info</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Key metrics progression over time
            </p>
            <TrendLineChart
              data={metricsChartData}
              lines={[
                { dataKey: "score", name: "Avg SEO Score", color: "#10b981" },
                { dataKey: "pages", name: "Total Pages", color: "#3b82f6" },
                { dataKey: "issues", name: "Total Issues", color: "#f43f5e" },
              ]}
              height={280}
            />
          </div>
        )}

        {/* Summary stats */}
        {snapshots.length >= 2 && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
              Change since first scan
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(() => {
                const first = snapshots[snapshots.length - 1].snapshot_data;
                const latest = snapshots[0].snapshot_data;
                const latestIssues = latest.issues ?? { total: 0 };
                const firstIssues = first.issues ?? { total: 0 };
                const latestMetrics = latest.metrics ?? { totalPages: 0, avgSeoScore: 0 };
                const firstMetrics = first.metrics ?? { totalPages: 0, avgSeoScore: 0 };
                const issueChange = (latestIssues.total ?? 0) - (firstIssues.total ?? 0);
                const pageChange = (latestMetrics.totalPages ?? 0) - (firstMetrics.totalPages ?? 0);
                const scoreChange = (latestMetrics.avgSeoScore ?? 0) - (firstMetrics.avgSeoScore ?? 0);

                return (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {pageChange > 0 ? "+" : ""}
                        {pageChange}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">Pages</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          issueChange < 0
                            ? "text-[var(--color-score-good)]"
                            : issueChange > 0
                            ? "text-[var(--color-score-critical)]"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {issueChange > 0 ? "+" : ""}
                        {issueChange}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">Issues</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          scoreChange > 0
                            ? "text-[var(--color-score-good)]"
                            : scoreChange < 0
                            ? "text-[var(--color-score-critical)]"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {scoreChange > 0 ? "+" : ""}
                        {scoreChange}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">Avg Score</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
