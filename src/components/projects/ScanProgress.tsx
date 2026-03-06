"use client";

import { useState, useEffect, useRef } from "react";
import { IconRefresh, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface ScanProgressProps {
  scanId: string;
  projectId: string;
}

export default function ScanProgress({ scanId, projectId }: ScanProgressProps) {
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [previousPagesScanned, setPreviousPagesScanned] = useState(0);
  const router = useRouter();

  // Refs to avoid stale closures in subscription/polling callbacks
  const scanRef = useRef<any>(null);
  const showCompletedRef = useRef(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const triggerCompletedEvent = () => {
      window.dispatchEvent(
        new CustomEvent("scanCompleted", { detail: { scanId, projectId } }),
      );
    };

    const onCompleted = () => {
      if (showCompletedRef.current) return;
      showCompletedRef.current = true;
      if (mounted) setShowCompleted(true);
      triggerCompletedEvent();

      // Stop polling once completed
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      completedRef.current = setTimeout(() => {
        router.refresh();
      }, 2000);
    };

    const fetchScan = async () => {
      // Don't fetch if already completed
      if (showCompletedRef.current) return;

      try {
        const { data, error: fetchErr } = await supabase
          .from("scans")
          .select("*")
          .eq("id", scanId)
          .single();

        if (!mounted) return;

        if (fetchErr) {
          setError("Failed to fetch scan status");
          return;
        }

        const prev = scanRef.current;
        if (prev && prev.pages_scanned !== data.pages_scanned) {
          setPreviousPagesScanned(prev.pages_scanned || 0);
        }

        scanRef.current = data;
        setScan(data);
        setLastUpdateTime(new Date());

        if (data.status === "completed") {
          onCompleted();
        }
      } catch {
        if (mounted) setError("An unexpected error occurred");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchScan();

    // Always poll every 3 seconds — realtime subscriptions are unreliable
    pollingRef.current = setInterval(fetchScan, 3000);

    // Also try real-time subscription for instant updates
    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scans",
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          if (!mounted) return;

          const prev = scanRef.current;
          if (prev) {
            setPreviousPagesScanned(prev.pages_scanned || 0);
          }

          scanRef.current = payload.new;
          setScan(payload.new);
          setLastUpdateTime(new Date());

          if (
            payload.new.status === "completed" &&
            !showCompletedRef.current
          ) {
            onCompleted();
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (completedRef.current) clearTimeout(completedRef.current);
      supabase.removeChannel(channel);
    };
  }, [scanId, projectId, router]);

  // Progress calculation
  const calculateProgress = () => {
    if (!scan) return 0;
    if (scan.status === "completed" || showCompleted) return 100;

    if (scan.summary_stats?.current_progress) {
      return Math.min(100, scan.summary_stats.current_progress);
    }

    if (scan.summary_stats?.estimated_total) {
      return Math.min(
        95,
        Math.round(
          (scan.pages_scanned / scan.summary_stats.estimated_total) * 100,
        ),
      );
    }

    if (scan.pages_scanned > 0) {
      const estimatedTotal = Math.max(10, scan.pages_scanned * 1.3);
      return Math.min(
        90,
        Math.round((scan.pages_scanned / estimatedTotal) * 100),
      );
    }

    return 5;
  };

  const getEstimatedTimeRemaining = () => {
    if (!scan || !scan.started_at || scan.pages_scanned <= 1) return null;

    const elapsed = Date.now() - new Date(scan.started_at).getTime();
    const pagesPerMs = scan.pages_scanned / elapsed;

    if (scan.summary_stats?.estimated_total && pagesPerMs > 0) {
      const remaining = scan.summary_stats.estimated_total - scan.pages_scanned;
      const minutes = Math.round(remaining / pagesPerMs / 60000);
      if (minutes > 0) return minutes === 1 ? "~1 minute" : `~${minutes} minutes`;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
        <div className="flex items-center">
          <IconRefresh className="h-5 w-5 mr-2 animate-spin" />
          <p className="text-sm font-medium">Loading scan status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-md">
        <div className="flex items-center">
          <IconAlertCircle className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!scan) return null;

  if (showCompleted) {
    return (
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IconCheck className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">Scan completed successfully!</p>
          </div>
          <span className="text-xs font-medium">100% complete</span>
        </div>

        <div className="mt-2 w-full bg-green-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: "100%" }}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="font-semibold">Pages scanned:</span>{" "}
            {scan.pages_scanned || 0}
          </div>
          <div>
            <span className="font-semibold">Links checked:</span>{" "}
            {scan.links_scanned || 0}
          </div>
          <div>
            <span className="font-semibold">Issues found:</span>{" "}
            {scan.issues_found || 0}
          </div>
        </div>

        <div className="mt-2 text-xs text-green-700">
          Refreshing page to show final results...
        </div>
      </div>
    );
  }

  if (scan.status !== "in_progress") return null;

  const progressPercentage = calculateProgress();
  const estimatedTimeRemaining = getEstimatedTimeRemaining();
  const showPagesIncrement = scan.pages_scanned > previousPagesScanned;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IconRefresh className="h-5 w-5 mr-2 animate-spin" />
          <p className="text-sm font-medium">
            Scan in progress...
            {scan.summary_stats?.queue_size > 0 && (
              <span className="ml-1 text-xs">
                ({scan.summary_stats.queue_size} pages in queue)
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium">
            {progressPercentage}% complete
          </span>
          {estimatedTimeRemaining && (
            <div className="text-xs text-yellow-600">
              {estimatedTimeRemaining} remaining
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 w-full bg-yellow-200 rounded-full h-2.5">
        <div
          className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div
          className={`transition-all duration-500 ${
            showPagesIncrement ? "text-yellow-900 font-bold" : ""
          }`}
        >
          <span className="font-semibold">Pages scanned:</span>{" "}
          {scan.pages_scanned || 0}
          {showPagesIncrement && (
            <span className="ml-1 text-xs animate-pulse">
              (+{scan.pages_scanned - previousPagesScanned})
            </span>
          )}
        </div>
        <div>
          <span className="font-semibold">Links checked:</span>{" "}
          {scan.links_scanned || 0}
        </div>
        <div>
          <span className="font-semibold">Issues found:</span>{" "}
          {scan.issues_found || 0}
        </div>
      </div>

      <div className="mt-2 text-xs text-yellow-700">
        Last updated:{" "}
        {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : "N/A"}
        {scan.summary_stats?.processing_count > 0 && (
          <span className="ml-2">
            • {scan.summary_stats.processing_count} pages processing
          </span>
        )}
      </div>
    </div>
  );
}
