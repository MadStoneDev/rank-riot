"use client";

import { useState, useEffect, useCallback } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { startScan } from "@/app/(private)/projects/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StartScanButtonProps {
  projectId: string;
}

export default function StartScanButton({ projectId }: StartScanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Listen for scan completion from ScanProgress component
  const handleScanCompleted = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scanCompleted", handleScanCompleted);
    return () => window.removeEventListener("scanCompleted", handleScanCompleted);
  }, [handleScanCompleted]);

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
        // Refresh the page so the server re-renders with ScanProgress
        router.refresh();
        // Keep button disabled — ScanProgress will take over
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
