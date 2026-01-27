"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconRefresh,
} from "@tabler/icons-react";
import { ComparisonBarChart } from "@/components/charts";

interface Scan {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  pages_scanned: number | null;
  issues_found: number | null;
}

interface ComparisonData {
  scan1: {
    id: string;
    date: string;
    metrics: {
      totalPages: number;
      totalIssues: number;
      criticalIssues: number;
      warningIssues: number;
      brokenLinks: number;
      avgScore: number;
    };
  };
  scan2: {
    id: string;
    date: string;
    metrics: {
      totalPages: number;
      totalIssues: number;
      criticalIssues: number;
      warningIssues: number;
      brokenLinks: number;
      avgScore: number;
    };
  };
  changes: {
    newIssues: number;
    fixedIssues: number;
    newPages: number;
    removedPages: number;
  };
}

interface ScanCompareProps {
  projectId: string;
  scans: Scan[];
  initialScan1?: string;
  initialScan2?: string;
}

export default function ScanCompare({
  projectId,
  scans,
  initialScan1,
  initialScan2,
}: ScanCompareProps) {
  const [scan1Id, setScan1Id] = useState(initialScan1 || scans[1]?.id || "");
  const [scan2Id, setScan2Id] = useState(initialScan2 || scans[0]?.id || "");
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scan1Id && scan2Id && scan1Id !== scan2Id) {
      fetchComparison();
    }
  }, [scan1Id, scan2Id]);

  const fetchComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/scans/${projectId}/compare?scan1=${scan1Id}&scan2=${scan2Id}`
      );
      if (!response.ok) throw new Error("Failed to fetch comparison");
      const data = await response.json();
      setComparison(data.comparison);
    } catch (err) {
      setError("Unable to load comparison data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatScanDate = (scan: Scan) => {
    if (!scan.started_at) return "Unknown date";
    return format(new Date(scan.started_at), "MMM d, yyyy 'at' h:mm a");
  };

  const renderChangeIndicator = (current: number, previous: number, inverse = false) => {
    const change = current - previous;
    const isPositive = inverse ? change < 0 : change > 0;
    const isNegative = inverse ? change > 0 : change < 0;

    if (change === 0) {
      return (
        <span className="flex items-center text-neutral-500">
          <IconMinus className="w-4 h-4 mr-1" />
          No change
        </span>
      );
    }

    return (
      <span
        className={`flex items-center ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {change > 0 ? (
          <IconTrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <IconTrendingDown className="w-4 h-4 mr-1" />
        )}
        {change > 0 ? "+" : ""}
        {change}
      </span>
    );
  };

  if (scans.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500 font-medium">Not enough scans to compare</p>
        <p className="text-sm text-neutral-400 mt-1">
          Run at least two scans to enable comparison.
        </p>
      </div>
    );
  }

  const chartData = comparison
    ? [
        {
          name: "Pages",
          previous: comparison.scan1.metrics.totalPages,
          current: comparison.scan2.metrics.totalPages,
        },
        {
          name: "Issues",
          previous: comparison.scan1.metrics.totalIssues,
          current: comparison.scan2.metrics.totalIssues,
        },
        {
          name: "Critical",
          previous: comparison.scan1.metrics.criticalIssues,
          current: comparison.scan2.metrics.criticalIssues,
        },
        {
          name: "Broken Links",
          previous: comparison.scan1.metrics.brokenLinks,
          current: comparison.scan2.metrics.brokenLinks,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Scan Selection */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Select Scans to Compare
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Previous Scan
              </label>
              <select
                value={scan1Id}
                onChange={(e) => setScan1Id(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">Select a scan</option>
                {scans.map((scan) => (
                  <option
                    key={scan.id}
                    value={scan.id}
                    disabled={scan.id === scan2Id}
                  >
                    {formatScanDate(scan)} ({scan.pages_scanned} pages, {scan.issues_found} issues)
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block">
              <IconArrowRight className="w-6 h-6 text-neutral-400 mt-6" />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Current Scan
              </label>
              <select
                value={scan2Id}
                onChange={(e) => setScan2Id(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">Select a scan</option>
                {scans.map((scan) => (
                  <option
                    key={scan.id}
                    value={scan.id}
                    disabled={scan.id === scan1Id}
                  >
                    {formatScanDate(scan)} ({scan.pages_scanned} pages, {scan.issues_found} issues)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Loading comparison...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchComparison}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <IconRefresh className="w-4 h-4 inline-block mr-2" />
            Retry
          </button>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500 mb-1">Total Pages</p>
              <p className="text-2xl font-bold text-neutral-900">
                {comparison.scan2.metrics.totalPages}
              </p>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(
                  comparison.scan2.metrics.totalPages,
                  comparison.scan1.metrics.totalPages
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500 mb-1">Total Issues</p>
              <p className="text-2xl font-bold text-neutral-900">
                {comparison.scan2.metrics.totalIssues}
              </p>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(
                  comparison.scan2.metrics.totalIssues,
                  comparison.scan1.metrics.totalIssues,
                  true // inverse - fewer issues is better
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500 mb-1">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {comparison.scan2.metrics.criticalIssues}
              </p>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(
                  comparison.scan2.metrics.criticalIssues,
                  comparison.scan1.metrics.criticalIssues,
                  true
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-500 mb-1">Avg SEO Score</p>
              <p className="text-2xl font-bold text-neutral-900">
                {comparison.scan2.metrics.avgScore}
              </p>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(
                  comparison.scan2.metrics.avgScore,
                  comparison.scan1.metrics.avgScore
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                Metrics Comparison
              </h2>
            </div>
            <div className="p-6">
              <ComparisonBarChart
                data={chartData}
                height={300}
                previousLabel={`Scan ${format(new Date(comparison.scan1.date), "MMM d")}`}
                currentLabel={`Scan ${format(new Date(comparison.scan2.date), "MMM d")}`}
              />
            </div>
          </div>

          {/* Changes Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                What Changed
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    +{comparison.changes.newIssues}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">New Issues</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    -{comparison.changes.fixedIssues}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">Fixed Issues</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    +{comparison.changes.newPages}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">New Pages</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">
                    -{comparison.changes.removedPages}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">Removed Pages</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
