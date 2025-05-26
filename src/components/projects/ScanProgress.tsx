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
  const supabase = createClient();
  const completedTimeout = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Custom event for scan completion
  const triggerScanCompletedEvent = () => {
    const event = new CustomEvent("scanCompleted", {
      detail: { scanId, projectId },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Initial fetch
    fetchScanData();

    // Set up subscription for real-time updates
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
          console.log("Real-time scan update:", payload.new);

          // Track previous pages scanned for animation
          if (scan) {
            setPreviousPagesScanned(scan.pages_scanned || 0);
          }

          setScan(payload.new);
          setLastUpdateTime(new Date());

          // Check if scan just completed
          if (payload.new.status === "completed" && !showCompleted) {
            handleScanCompleted();
          }
        },
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
      });

    // Set up more frequent polling for progress updates
    pollingInterval.current = setInterval(fetchScanData, 500); // Poll every 500ms

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (completedTimeout.current) clearTimeout(completedTimeout.current);
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  const fetchScanData = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .single();

      if (error) {
        console.error("Error fetching scan:", error);
        setError("Failed to fetch scan status");
      } else {
        // Track previous pages for progress animation
        if (scan && scan.pages_scanned !== data.pages_scanned) {
          setPreviousPagesScanned(scan.pages_scanned || 0);
        }

        // Check if scan status changed from in_progress to completed
        if (
          scan &&
          scan.status === "in_progress" &&
          data.status === "completed"
        ) {
          triggerScanCompletedEvent();
        }

        setScan(data);
        setLastUpdateTime(new Date());

        // Check if scan is completed
        if (data.status === "completed" && !showCompleted) {
          handleScanCompleted();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleScanCompleted = () => {
    setShowCompleted(true);
    triggerScanCompletedEvent();

    // Clear polling interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    // Set timeout to refresh page after showing completed state
    completedTimeout.current = setTimeout(() => {
      router.refresh();
    }, 2000); // Show completed state for 2 seconds
  };

  // Enhanced progress calculation
  const calculateProgress = () => {
    if (!scan) return 0;

    // If completed or showing completed state, return 100%
    if (scan.status === "completed" || showCompleted) return 100;

    // Use backend-calculated progress if available
    if (scan.summary_stats?.current_progress) {
      return Math.min(100, scan.summary_stats.current_progress);
    }

    // Fallback calculation
    if (scan.summary_stats?.estimated_total) {
      return Math.min(
        95,
        Math.round(
          (scan.pages_scanned / scan.summary_stats.estimated_total) * 100,
        ),
      );
    }

    // Basic estimate if no detailed stats
    if (scan.pages_scanned > 0) {
      const estimatedTotal = Math.max(10, scan.pages_scanned * 1.3);
      return Math.min(
        90,
        Math.round((scan.pages_scanned / estimatedTotal) * 100),
      );
    }

    return 5; // Starting progress
  };

  // Get estimated time remaining
  const getEstimatedTimeRemaining = () => {
    if (!scan || !scan.started_at || scan.pages_scanned <= 1) return null;

    const startTime = new Date(scan.started_at).getTime();
    const currentTime = Date.now();
    const elapsedMs = currentTime - startTime;
    const pagesPerMs = scan.pages_scanned / elapsedMs;

    if (scan.summary_stats?.estimated_total && pagesPerMs > 0) {
      const remainingPages =
        scan.summary_stats.estimated_total - scan.pages_scanned;
      const remainingMs = remainingPages / pagesPerMs;
      const remainingMinutes = Math.round(remainingMs / (1000 * 60));

      if (remainingMinutes > 0) {
        return remainingMinutes === 1
          ? "~1 minute"
          : `~${remainingMinutes} minutes`;
      }
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

  // If showing completed state
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
          ></div>
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

  // If scan is not in progress anymore, return null
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
        ></div>
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
