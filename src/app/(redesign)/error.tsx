"use client";

import { useEffect } from "react";

// Error boundary for the redesigned app. A server-side data-fetch failure (e.g.
// an origin 503) throws, lands here, and offers a retry — rather than rendering
// a misleading "no scans"/"not scanned yet" empty state (#5 / #7 / P1.5).
export default function RedesignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Redesign route error:", error);
  }, [error]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
      <div
        style={{
          maxWidth: 440,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: "var(--rr-text-2)" }}>
          We couldn&rsquo;t load this page. This is usually temporary.
        </div>
        <div>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 7,
              background: "var(--rr-accent)",
              color: "var(--rr-accent-ink)",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
