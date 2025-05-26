"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";

import DeleteScanButton from "./DeleteScanButton";
import StartScanButton from "@/components/projects/StartScanButton";

import { Database } from "../../../database.types";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

interface ScanHistoryItemProps {
  scan: Scan;
  onDelete: (id: string) => void;
}

const ScanHistoryItem = ({ scan, onDelete }: ScanHistoryItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string) => {
    setIsDeleting(true);

    setTimeout(() => {
      onDelete(id);
    }, 500);
  };

  return (
    <article
      className={`
        group/scan 
        hover:bg-neutral-100/80 
        transition 
        duration-300 
        ease-in-out
        ${isDeleting ? "slide-out-right" : ""}
      `}
    >
      <div
        className={`flex items-center lg:items-stretch justify-between overflow-hidden`}
      >
        <div
          className={`flex-grow p-4 flex items-stretch justify-between gap-1 shadow-none lg:group-hover/scan:shadow-2xl z-10 transition duration-300 ease-in-out`}
        >
          <div className={`flex-grow`}>
            <div className="flex items-center">
              <span
                className={`inline-block h-2 w-2 rounded-full mr-2 ${
                  scan.status === "completed"
                    ? "bg-green-500"
                    : scan.status === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium text-neutral-900 capitalize">
                {scan.status}
              </span>
              {scan.status === "failed" && (
                <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Started:{" "}
              {format(parseISO(scan.started_at as string), "d MMM, yyyy")} at{" "}
              {format(parseISO(scan.started_at as string), "hh:mm a")}
            </p>
            {scan.completed_at && (
              <p className="mt-1 text-xs text-neutral-500">
                {scan.status === "completed" ? "Completed" : "Failed"}:{" "}
                {format(parseISO(scan.completed_at as string), "MMM d, yyyy")}{" "}
                at {format(parseISO(scan.completed_at as string), "hh:mm a")}
              </p>
            )}
            {scan.status === "failed" &&
              scan.summary_stats &&
              typeof scan.summary_stats === "object" &&
              scan.summary_stats !== null &&
              "error_message" in scan.summary_stats && (
                <p className="mt-1 text-xs text-red-600 truncate max-w-xs">
                  Error: {String(scan.summary_stats.error_message)}
                </p>
              )}
          </div>

          <div className={`text-right`}>
            <p className="text-sm text-neutral-900">
              {scan.pages_scanned || 0} pages
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {scan.issues_found || 0} issues
            </p>
            {scan.status === "failed" && (
              <p className="mt-1 text-xs text-red-500">Scan failed</p>
            )}
          </div>
        </div>

        {/* The key part - we pass the handleDelete function to the DeleteScanButton */}
        <DeleteScanButton id={scan.id} onDelete={handleDelete} />
      </div>
    </article>
  );
};

interface ScanHistoryProps {
  initialScans: Scan[];
  projectId: string;
}

export default function ScanHistory({
  initialScans,
  projectId,
}: ScanHistoryProps) {
  const [scans, setScans] = useState(initialScans);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = createClient();

  // Function to refresh scan history
  const refreshScanHistory = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("project_id", projectId)
        .order("started_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching scan history:", error);
      } else if (data) {
        setScans(data as Scan[]);
      }
    } catch (error) {
      console.error("Error refreshing scan history:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Set up subscription for real-time updates
    const channel = supabase
      .channel(`project-scans-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scans",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log(
            "Scan status update:",
            payload.new.status,
            "from:",
            payload.old.status,
          );

          // Refresh when scan completes OR fails
          if (
            payload.old.status === "in_progress" &&
            (payload.new.status === "completed" ||
              payload.new.status === "failed")
          ) {
            console.log(`Scan ${payload.new.status}, refreshing history...`);
            refreshScanHistory();
          }

          // Also refresh for any other status changes to keep UI in sync
          else if (payload.old.status !== payload.new.status) {
            console.log(
              `Scan status changed to ${payload.new.status}, updating list...`,
            );
            // Update individual scan in the list without full refresh
            setScans((prevScans) =>
              prevScans.map((scan) =>
                scan.id === payload.new.id
                  ? ({ ...scan, ...payload.new } as Scan)
                  : scan,
              ),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scans",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("New scan started:", payload.new.id);
          // Add new scan to the beginning of the list
          setScans((prevScans) => [payload.new as Scan, ...prevScans]);
        },
      )
      .subscribe((status) => {
        console.log(`Scan subscription status: ${status}`);
      });

    // Listen for custom scan completed event from ScanProgress component
    const handleScanCompleted = (event: CustomEvent) => {
      console.log("Custom scan completed event received:", event.detail);
      refreshScanHistory();
    };

    // Listen for custom scan failed event (if you want to add this to other components)
    const handleScanFailed = (event: CustomEvent) => {
      console.log("Custom scan failed event received:", event.detail);
      refreshScanHistory();
    };

    window.addEventListener(
      "scanCompleted",
      handleScanCompleted as EventListener,
    );
    window.addEventListener("scanFailed", handleScanFailed as EventListener);

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(
        "scanCompleted",
        handleScanCompleted as EventListener,
      );
      window.removeEventListener(
        "scanFailed",
        handleScanFailed as EventListener,
      );
    };
  }, [projectId]);

  const handleDeleteScan = (scanId: string) => {
    setScans(scans.filter((scan) => scan.id !== scanId));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-900">Scan History</h3>
        <button
          onClick={refreshScanHistory}
          disabled={isRefreshing}
          className="text-sm text-secondary hover:text-primary-dark flex items-center"
        >
          <svg
            className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {scans && scans.length > 0 ? (
        <section className="divide-y divide-neutral-200">
          {scans.map((scan) => (
            <ScanHistoryItem
              key={scan.id}
              scan={scan}
              onDelete={handleDeleteScan}
            />
          ))}
        </section>
      ) : (
        <div className="p-6 text-center">
          <p className="text-neutral-500">No scans have been run yet.</p>
          <StartScanButton projectId={projectId} />
        </div>
      )}
    </div>
  );
}
