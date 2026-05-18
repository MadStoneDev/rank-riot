"use client";

import { useState, useTransition } from "react";
import {
  IconPlayerStop,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

interface ScanActionsProps {
  scanId: string;
  status: string;
  errorMessage: string | null;
  summaryStats: Record<string, unknown> | null;
}

export default function ScanActions({
  scanId,
  status,
  errorMessage,
  summaryStats,
}: ScanActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [cancelled, setCancelled] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel_scan", scanId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to cancel");
          return;
        }

        setCancelled(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      }
    });
  }

  const isRunning = status === "in_progress" || status === "pending";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* Cancel button for running scans */}
        {isRunning && !cancelled && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium bg-[var(--color-score-critical)]/15 text-[var(--color-score-critical)] hover:bg-[var(--color-score-critical)]/25 transition-colors disabled:opacity-40"
          >
            <IconPlayerStop className="h-3 w-3" />
            {isPending ? "Cancelling..." : "Cancel"}
          </button>
        )}

        {cancelled && (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Cancelled
          </span>
        )}

        {/* JSON viewer toggle */}
        {summaryStats && Object.keys(summaryStats).length > 0 && (
          <button
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {showJson ? (
              <>
                <IconChevronUp className="h-3 w-3" />
                Hide
              </>
            ) : (
              <>
                <IconChevronDown className="h-3 w-3" />
                JSON
              </>
            )}
          </button>
        )}
      </div>

      {/* Full error message for failed scans */}
      {errorMessage && (
        <p className="text-[10px] text-[var(--color-score-critical)] max-w-[400px] break-words whitespace-pre-wrap">
          {errorMessage}
        </p>
      )}

      {/* Expandable JSON viewer */}
      {showJson && summaryStats && (
        <pre className="mt-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] p-2 text-[10px] text-[var(--color-text-secondary)] max-w-[500px] max-h-[200px] overflow-auto whitespace-pre-wrap">
          {JSON.stringify(summaryStats, null, 2)}
        </pre>
      )}

      {error && (
        <p className="text-[10px] text-[var(--color-score-critical)]">
          {error}
        </p>
      )}
    </div>
  );
}
