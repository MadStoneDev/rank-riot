"use client";

import { useState, useEffect } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface ScanProgressProps {
  scanId: string;
  projectId: string;
}

export default function ScanProgress({ scanId, projectId }: ScanProgressProps) {
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        },
      )
      .subscribe();

    // Set up polling as a fallback
    const interval = setInterval(fetchScanData, 10000); // Poll every 10 seconds

    return () => {
      // Clean up
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  const fetchScanData = async () => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .single();

      if (error) {
        console.error("Error fetching scan:", error);
      } else {
        setScan(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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

  if (!scan || scan.status !== "in_progress") {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
      <div className="flex items-center">
        <IconRefresh className="h-5 w-5 mr-2 animate-spin" />
        <p className="text-sm font-medium">
          Scan in progress... {scan.pages_scanned || 0} pages scanned so far.
          {scan.links_scanned ? ` ${scan.links_scanned} links checked.` : ""}
          {scan.issues_found ? ` ${scan.issues_found} issues found.` : ""}
        </p>
      </div>
      <div className="mt-2 text-xs">
        Last updated:{" "}
        {scan.last_progress_update
          ? new Date(scan.last_progress_update).toLocaleTimeString()
          : "N/A"}
      </div>
    </div>
  );
}
