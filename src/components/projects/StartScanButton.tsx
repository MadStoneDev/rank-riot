"use client";

import { useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { startScan } from "@/app/dashboard/projects/actions";
import { toast } from "sonner";

interface StartScanButtonProps {
  projectId: string;
}

export default function StartScanButton({ projectId }: StartScanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartScan = async () => {
    setIsLoading(true);

    try {
      const result = await startScan(projectId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Scan started successfully");
      }
    } catch (error) {
      toast.error("An error occurred while starting the scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartScan}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <IconRefresh
        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
      />
      {isLoading ? "Starting Scan..." : "Start New Scan"}
    </button>
  );
}
