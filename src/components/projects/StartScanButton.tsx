"use client";

import { useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { startScan } from "@/app/(private)/projects/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StartScanButtonProps {
  projectId: string;
}

export default function StartScanButton({ projectId }: StartScanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const router = useRouter();

  const handleStartScan = async () => {
    setIsLoading(true);

    try {
      const result: any = await startScan(projectId);

      if (result.error) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error.message ||
              result.error.code ||
              "An error occurred while starting the scan";

        toast.error(errorMessage);
        setIsLoading(false);
      } else {
        toast.success("Scan started successfully");
        setScanStarted(true);
        // Refresh the page so the server re-renders with ScanProgress
        router.refresh();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while starting the scan";

      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Show skeleton progress box while waiting for page to re-render
  if (scanStarted) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md animate-pulse">
        <div className="flex items-center">
          <IconRefresh className="h-5 w-5 mr-2 animate-spin" />
          <p className="text-sm font-medium">Starting scan...</p>
        </div>
        <div className="mt-2 w-full bg-yellow-200 rounded-full h-2.5">
          <div
            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: "5%" }}
          ></div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-4 bg-yellow-200 rounded" />
          <div className="h-4 bg-yellow-200 rounded" />
          <div className="h-4 bg-yellow-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartScan}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <IconRefresh
        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
      />
      {isLoading ? "Starting Scan..." : "Start New Scan"}
    </button>
  );
}
