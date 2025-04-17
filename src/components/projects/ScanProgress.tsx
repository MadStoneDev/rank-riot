"use client";

import { useState, useEffect } from "react";
import { IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface ScanProgressProps {
  scanId: string;
  projectId: string;
}

export default function ScanProgress({ scanId, projectId }: ScanProgressProps) {
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const supabase = createClient();

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
        },
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.log(`Subscription status: ${status}`);
        }
      });

    // Set up polling as a fallback
    const interval = setInterval(fetchScanData, 5000); // Poll every 5 seconds

    return () => {
      // Clean up
      clearInterval(interval);
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
        setScan(data);
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress percentage (estimate)
  const calculateProgress = () => {
    if (!scan) return 0;

    // If completed, return 100%
    if (scan.status === "completed") return 100;

    // If we have a max pages setting in the summary stats
    if (scan.summary_stats?.max_pages) {
      return Math.min(
        100,
        Math.round((scan.pages_scanned / scan.summary_stats.max_pages) * 100),
      );
    }

    // No way to accurately determine progress, make a guess based on typical scan size
    const estimatedTotalPages = 50; // Just a guess for average website
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

  if (!scan || scan.status !== "in_progress") {
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
