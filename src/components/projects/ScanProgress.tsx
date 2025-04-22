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
  const router = useRouter();
  const supabase = createClient();
  const completedTimeout = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Custom event for scan completion
  const triggerScanCompletedEvent = () => {
    // Create and dispatch a custom event that other components can listen for
    const event = new CustomEvent("scanCompleted", {
      detail: {
        scanId,
        projectId,
      },
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
          setScan(payload.new);
          setLastUpdateTime(new Date());

          // Check if scan just completed
          if (payload.new.status === "completed" && !showCompleted) {
            handleScanCompleted();
          }
        },
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.log(`Subscription status: ${status}`);
        }
      });

    // Set up polling as a fallback (more frequent polling)
    pollingInterval.current = setInterval(fetchScanData, 1000); // Poll every 1 second

    return () => {
      // Clean up
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
    // Show completed state
    setShowCompleted(true);

    // Trigger the custom event
    triggerScanCompletedEvent();

    // Clear polling interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    // Set timeout to refresh page after showing completed state
    completedTimeout.current = setTimeout(() => {
      router.refresh(); // This refreshes the current page
    }, 1500); // Show completed state for 1.5 seconds
  };

  // Calculate progress percentage (estimate)
  const calculateProgress = () => {
    if (!scan) return 0;

    // If completed or showing completed state, return 100%
    if (scan.status === "completed" || showCompleted) return 100;

    // If we have a max pages setting in the summary stats
    if (scan.summary_stats?.max_pages) {
      return Math.min(
        100,
        Math.round((scan.pages_scanned / scan.summary_stats.max_pages) * 100),
      );
    }

    // No way to accurately determine progress, make a guess based on typical scan size
    // For small websites, use a smaller denominator
    const estimatedTotalPages = Math.max(10, scan.pages_scanned * 1.5); // Dynamic estimate
    return Math.min(
      95,
      Math.round((scan.pages_scanned / estimatedTotalPages) * 100),
    );
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

  if (!scan) {
    return null;
  }

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
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
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

  // If scan is not in progress anymore and not showing completed state, return null
  if (scan.status !== "in_progress") {
    return null;
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IconRefresh className="h-5 w-5 mr-2 animate-spin" />
          <p className="text-sm font-medium">Scan in progress...</p>
        </div>
        <span className="text-xs font-medium">
          ~{progressPercentage}% complete
        </span>
      </div>

      <div className="mt-2 w-full bg-yellow-200 rounded-full h-2.5">
        <div
          className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
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

      <div className="mt-2 text-xs text-yellow-700">
        Last updated:{" "}
        {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : "N/A"}
      </div>
    </div>
  );
}
