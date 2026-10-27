"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/redesign/primitives";
import type { PageFlag } from "@/lib/fixes";

// Speed report table (F-D12). Per-page FLAGS come only from the crawler's
// persisted slow_page / large_page_size issues — the page no longer recomputes
// "slow" from metrics. TTFB / load / size are shown as plain, sortable raw-data
// columns (bucket C): no badge, no severity colour, no value judgement. Pages
// timed in a headless browser can't be compared on these axes (the crawler only
// raises slow_page/large_page_size for HTTP-timed pages), so their timing cells
// say so instead of showing a number.
export interface SpeedRow {
  id: string;
  title: string;
  path: string;
  ttfbMs: number | null;
  loadMs: number | null;
  sizeBytes: number | null;
  isHttp: boolean;
  flags: PageFlag[];
}

type SortKey = "ttfb" | "load" | "size";
type SortDir = "asc" | "desc";

const HEADLESS_NOTE = "Timing not comparable (rendered in a browser)";

function fmtMs(ms: number | null): string {
  if (ms == null || ms <= 0) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function fmtBytes(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return "—";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1000)} KB`;
}

function valueOf(row: SpeedRow, key: SortKey): number | null {
  // Headless timing isn't comparable on any of these axes, so such rows never
  // carry a sortable value — they sink to the bottom regardless of direction.
  if (!row.isHttp) return null;
  if (key === "ttfb") return row.ttfbMs;
  if (key === "load") return row.loadMs;
  return row.sizeBytes;
}

export function SpeedTable({
  projectId,
  rows,
}: {
  projectId: string;
  rows: SpeedRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("ttfb");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const withValue: SpeedRow[] = [];
    const withoutValue: SpeedRow[] = [];
    for (const r of rows) {
      (valueOf(r, sortKey) == null ? withoutValue : withValue).push(r);
    }
    withValue.sort((a, b) => {
      const av = valueOf(a, sortKey) ?? 0;
      const bv = valueOf(b, sortKey) ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    // Incomparable rows (headless / no data) always trail, ordered by title.
    withoutValue.sort((a, b) => a.title.localeCompare(b.title));
    return [...withValue, ...withoutValue];
  }, [rows, sortKey, sortDir]);

  const toggle = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: "48px 0",
          textAlign: "center",
          color: "var(--rr-text-3)",
          fontSize: 13,
        }}
      >
        No timing data for this project yet.
      </div>
    );
  }

  return (
    <div>
      {/* Header row with sort controls for the raw-data columns. */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: "0 12px 8px",
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <div style={{ flex: "1 1 240px", fontSize: 12, color: "var(--rr-text-3)" }}>
          Page
        </div>
        {(
          [
            ["ttfb", "TTFB"],
            ["load", "Load"],
            ["size", "Size"],
          ] as [SortKey, string][]
        ).map(([key, label]) => (
          <SortButton
            key={key}
            label={label}
            active={sortKey === key}
            dir={sortDir}
            onClick={() => toggle(key)}
          />
        ))}
      </div>

      {sorted.map((r) => (
        <Link
          key={r.id}
          href={`/projects/${projectId}/pages-redesign/${r.id}`}
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            padding: "13px 12px",
            borderBottom: "1px solid var(--rr-hairline)",
            flexWrap: "wrap",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.title}
            </div>
            <div
              className="rr-mono"
              style={{
                fontSize: 12,
                color: "var(--rr-text-3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.path}
            </div>
            {r.flags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {r.flags.map((f, i) => (
                  <Flag key={i} severity={f.severity}>
                    {f.label}
                  </Flag>
                ))}
              </div>
            )}
          </div>
          {r.isHttp ? (
            <>
              <Cell value={fmtMs(r.ttfbMs)} />
              <Cell value={fmtMs(r.loadMs)} />
              <Cell value={fmtBytes(r.sizeBytes)} />
            </>
          ) : (
            <div
              style={{
                flex: "1 1 270px",
                textAlign: "right",
                fontSize: 12,
                color: "var(--rr-text-3)",
                fontStyle: "italic",
              }}
            >
              {HEADLESS_NOTE}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Sort by ${label}${active ? (dir === "desc" ? ", descending" : ", ascending") : ""}`}
      style={{
        flex: "none",
        width: 90,
        textAlign: "right",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? "var(--rr-text)" : "var(--rr-text-3)",
      }}
    >
      {label}
      {active ? (dir === "desc" ? " ↓" : " ↑") : ""}
    </button>
  );
}

function Cell({ value }: { value: string }) {
  return (
    <div
      className="rr-mono"
      style={{
        flex: "none",
        width: 90,
        textAlign: "right",
        fontSize: 12,
        color: "var(--rr-text-2)",
      }}
    >
      {value}
    </div>
  );
}
