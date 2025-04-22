"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";

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
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Started:{" "}
              {format(parseISO(scan.started_at as string), "d MMM, yyyy")} at{" "}
              {format(parseISO(scan.started_at as string), "hh:mm a")}
            </p>
            {scan.completed_at && (
              <p className="mt-1 text-xs text-neutral-500">
                Completed:{" "}
                {format(parseISO(scan.completed_at as string), "MMM d, yyyy")}{" "}
                at {format(parseISO(scan.completed_at as string), "hh:mm a")}
              </p>
            )}
          </div>

          <div className={`text-right`}>
            <p className="text-sm text-neutral-900">
              {scan.pages_scanned} pages
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {scan.issues_found} issues
            </p>
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

  const handleDeleteScan = (scanId: string) => {
    setScans(scans.filter((scan) => scan.id !== scanId));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">Scan History</h3>
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
