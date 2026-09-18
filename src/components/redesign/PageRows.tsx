import Link from "next/link";
import { Flag } from "@/components/redesign/primitives";
import type { PageFlag } from "@/lib/fixes";

// A hairline list of page exceptions for a report tab (Speed / Content / AEO).
// Each row is the whole tap target and opens the page detail. Kept simple and
// server-rendered — the Pages tab is the place for filters and the slide-over.
export interface PageRowItem {
  id: string;
  title: string;
  path: string;
  meta?: string; // right-aligned mono value(s), e.g. "310 ms · 2.4 MB"
  flags: PageFlag[];
}

export function PageRows({
  projectId,
  rows,
  emptyText,
}: {
  projectId: string;
  rows: PageRowItem[];
  emptyText: string;
}) {
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
        {emptyText}
      </div>
    );
  }

  return (
    <div>
      {rows.map((r) => (
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
          {r.flags.length > 0 && (
            <div style={{ flex: "1 1 240px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {r.flags.map((f, i) => (
                <Flag key={i} severity={f.severity}>
                  {f.label}
                </Flag>
              ))}
            </div>
          )}
          {r.meta && (
            <div
              className="rr-mono"
              style={{
                flex: "none",
                marginLeft: "auto",
                textAlign: "right",
                fontSize: 12,
                color: "var(--rr-text-2)",
              }}
            >
              {r.meta}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
