"use client";

import { useMemo, useState } from "react";
import { Flag } from "@/components/redesign/primitives";
import type { PageFlag } from "@/lib/fixes";

export interface PageRow {
  id: string;
  title: string;
  path: string;
  pageType: string | null;
  score: number;
  inlinks: number;
  flags: PageFlag[];
}

type Segment = "all" | "content" | "taxonomy" | "pagination";

const TAXONOMY = new Set(["tag", "category", "author", "date_archive"]);

function inSegment(pageType: string | null, seg: Segment): boolean {
  if (seg === "all") return true;
  if (seg === "content") return !pageType || pageType === "content";
  if (seg === "taxonomy") return !!pageType && TAXONOMY.has(pageType);
  if (seg === "pagination") return pageType === "pagination";
  return true;
}

const PILLS: { key: Segment; label: string }[] = [
  { key: "all", label: "Exceptions" },
  { key: "content", label: "Content" },
  { key: "taxonomy", label: "Tag / category / author" },
  { key: "pagination", label: "Pagination" },
];

export function PagesV2View({ rows }: { rows: PageRow[] }) {
  const [segment, setSegment] = useState<Segment>("all");
  const [showAll, setShowAll] = useState(false);

  const visible = useMemo(() => {
    return rows
      .filter((r) => inSegment(r.pageType, segment))
      .filter((r) => (showAll ? true : r.flags.length > 0));
  }, [rows, segment, showAll]);

  return (
    <div style={{ padding: "16px 32px 64px" }}>
      {/* Filter pills + show-all toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PILLS.map((p) => {
            const active = segment === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setSegment(p.key)}
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 15,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  background: active ? "var(--rr-text)" : "transparent",
                  color: active ? "var(--rr-bg)" : "var(--rr-text-2)",
                  border: active ? "none" : "1px solid var(--rr-border)",
                }}
              >
                {p.key === "all" && !showAll ? "Exceptions only" : p.label}
              </button>
            );
          })}
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--rr-text-2)",
            cursor: "pointer",
          }}
        >
          Show all {rows.length}
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            style={{ accentColor: "var(--rr-accent)" }}
          />
        </label>
      </div>

      {/* Header */}
      <div
        className="rr-mono"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: "12px",
          borderBottom: "1px solid var(--rr-border)",
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--rr-text-3)",
        }}
      >
        <div style={{ flex: "1 1 260px" }}>Page</div>
        <div style={{ width: 40, textAlign: "right" }}>Score</div>
        <div style={{ width: 48, textAlign: "right" }}>Inlinks</div>
        <div style={{ flex: "1 1 260px" }}>Flags</div>
      </div>

      {/* Rows */}
      {visible.length === 0 ? (
        <div
          style={{
            padding: "48px 0",
            textAlign: "center",
            color: "var(--rr-text-3)",
            fontSize: 13,
          }}
        >
          {showAll ? "No pages in this segment." : "No exceptions here — these pages are clean."}
        </div>
      ) : (
        visible.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: "13px 12px",
              borderBottom: "1px solid var(--rr-hairline)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
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
            </div>
            <div
              className="rr-mono"
              style={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 600 }}
            >
              {r.score}
            </div>
            <div
              className="rr-mono"
              style={{
                width: 48,
                textAlign: "right",
                fontSize: 13,
                color: "var(--rr-text-2)",
              }}
            >
              {r.inlinks}
            </div>
            <div
              style={{
                flex: "1 1 260px",
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {r.flags.map((f, i) => (
                <Flag key={i} severity={f.severity}>
                  {f.label}
                </Flag>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
