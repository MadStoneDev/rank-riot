"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <IconAlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-500 mb-6 max-w-md">
        An unexpected error occurred. You can try again or navigate to a
        different page.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <IconRefresh className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
