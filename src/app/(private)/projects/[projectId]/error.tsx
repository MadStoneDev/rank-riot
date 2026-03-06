"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconRefresh, IconArrowLeft } from "@tabler/icons-react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <IconAlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Failed to load project
      </h2>
      <p className="text-sm text-neutral-500 mb-6 max-w-md">
        There was a problem loading this project. The data may be temporarily
        unavailable.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          All Projects
        </Link>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconRefresh className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
