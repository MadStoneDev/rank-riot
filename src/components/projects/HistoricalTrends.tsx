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
      return {
        name: format(new Date(snapshot.created_at), "MMM d"),
        critical: data.issues.critical,
        warning: data.issues.high + data.issues.medium,
        info: data.issues.low,
      };
    });

  const metricsChartData = snapshots
    .slice()
    .reverse()
    .map((snapshot) => {
      const data = snapshot.snapshot_data;
      return {
        date: format(new Date(snapshot.created_at), "MMM d"),
        pages: data.metrics.totalPages,
        issues: data.issues.total,
        score: data.metrics.avgSeoScore,
      };
    });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Historical Trends
          </h2>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Historical Trends
          </h2>
        </div>
        <div className="p-6 text-center py-12">
          <IconChartLine className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500 font-medium">No historical data yet</p>
          <p className="text-sm text-neutral-400 mt-1">
            Historical trends will appear after multiple scans are completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Historical Trends
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "issues"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <IconChartBar className="w-4 h-4 inline-block mr-1" />
              Issues
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "metrics"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <IconChartLine className="w-4 h-4 inline-block mr-1" />
              Metrics
            </button>
          </div>
          <button
            onClick={fetchSnapshots}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "issues" ? (
          <div>
            <p className="text-sm text-neutral-500 mb-4">
              Issue count by severity over time
            </p>
            <StackedBarChart data={issueChartData} height={280} />
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-neutral-600">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-neutral-600">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-neutral-600">Info</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-500 mb-4">
              Key metrics progression over time
            </p>
            <TrendLineChart
              data={metricsChartData}
              lines={[
                { dataKey: "score", name: "Avg SEO Score", color: "#22c55e" },
                { dataKey: "pages", name: "Total Pages", color: "#3b82f6" },
                { dataKey: "issues", name: "Total Issues", color: "#ef4444" },
              ]}
              height={280}
            />
          </div>
        )}

        {/* Summary stats */}
        {snapshots.length >= 2 && (
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">
              Change since first scan
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(() => {
                const first = snapshots[snapshots.length - 1].snapshot_data;
                const latest = snapshots[0].snapshot_data;
                const issueChange = latest.issues.total - first.issues.total;
                const pageChange = latest.metrics.totalPages - first.metrics.totalPages;
                const scoreChange = latest.metrics.avgSeoScore - first.metrics.avgSeoScore;

                return (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">
                        {pageChange > 0 ? "+" : ""}
                        {pageChange}
                      </p>
                      <p className="text-sm text-neutral-500">Pages</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          issueChange < 0
                            ? "text-green-600"
                            : issueChange > 0
                            ? "text-red-600"
                            : "text-neutral-900"
                        }`}
                      >
                        {issueChange > 0 ? "+" : ""}
                        {issueChange}
                      </p>
                      <p className="text-sm text-neutral-500">Issues</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          scoreChange > 0
                            ? "text-green-600"
                            : scoreChange < 0
                            ? "text-red-600"
                            : "text-neutral-900"
                        }`}
                      >
                        {scoreChange > 0 ? "+" : ""}
                        {scoreChange}
                      </p>
                      <p className="text-sm text-neutral-500">Avg Score</p>
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
