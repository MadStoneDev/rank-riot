"use client";

import { useState } from "react";
import { IconChartBar, IconRefresh } from "@tabler/icons-react";
import { startAuditScan } from "@/app/(private)/projects/actions";
import { toast } from "sonner";

interface StartAuditButtonProps {
  projectId: string;
}

export default function StartAuditButton({ projectId }: StartAuditButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAudit = async () => {
    setIsLoading(true);

    try {
      console.log("🔵 Calling startAuditScan with projectId:", projectId);

      const result: any = await startAuditScan(projectId);

      console.log("🔵 Result from startAuditScan:", result);
      console.log("🔵 Result type:", typeof result);
      console.log("🔵 Result keys:", Object.keys(result || {}));

      if (result.error) {
        console.log("🔴 Error path - result.error:", result.error);
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error.message ||
              result.error.code ||
              "An error occurred while starting the audit";

        toast.error(errorMessage);
      } else if (result.success) {
        console.log("🟢 Success path");
        toast.success("Audit scan started successfully");
      } else {
        console.log("🟡 Unexpected result structure:", result);
        toast.error("Unexpected response: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("🔴 Caught exception:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while starting the audit";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartAudit}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
          Starting Audit...
        </>
      ) : (
        <>
          <IconChartBar className="h-4 w-4 mr-2" />
          Run Audit Scan
        </>
      )}
    </button>
  );
}
