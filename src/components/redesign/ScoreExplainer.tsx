"use client";

import { useState } from "react";

export interface ScoreDeduction {
  issueType: string;
  category: string;
  severity: string;
  affectedPages: number;
  scoredPages: number;
  share: number;
  penalty: number;
  siteLevel: boolean;
}

function humanIssueType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * "How is this calculated?" — explains the severity × volume formula in plain
 * English and lists the actual deductions behind this scan's score (P1.2). This
 * transparency is what makes the number sellable.
 */
export function ScoreExplainer({
  overall,
  deductions,
  capped,
  scoreVersion,
  crawlerVersion,
}: {
  overall: number | null;
  deductions: ScoreDeduction[];
  capped?: "critical" | "high" | null;
  scoreVersion?: number | null;
  crawlerVersion?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 12,
          color: "var(--rr-accent)",
        }}
      >
        {open ? "Hide" : "How is this calculated?"}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            padding: 16,
            borderRadius: 9,
            border: "1px solid var(--rr-hairline)",
            background: "var(--rr-surface-2, rgba(127,127,127,0.04))",
            fontSize: 13,
            color: "var(--rr-text-2)",
          }}
        >
          <p style={{ margin: "0 0 10px" }}>
            The score starts at 100. Each kind of open issue removes points based
            on its severity and how much of the site it affects:
            <br />
            <span className="rr-mono" style={{ fontSize: 12 }}>
              penalty = weight × √(affected pages ÷ scored pages)
            </span>
            <br />
            Weights: critical 25, high 12, medium 6, low 2. Any open critical caps
            the score at 79; any open high caps it at 89.
          </p>

          {capped && (
            <p style={{ margin: "0 0 10px", color: "var(--rr-warn)" }}>
              Capped at {capped === "critical" ? 79 : 89} because open{" "}
              {capped} issues exist.
            </p>
          )}

          {deductions.length === 0 ? (
            <p style={{ margin: 0 }}>No deductions — nothing is lowering the score.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--rr-text-3)" }}>
                  <th style={{ padding: "4px 0", fontWeight: 500 }}>Issue</th>
                  <th style={{ padding: "4px 0", fontWeight: 500 }}>Coverage</th>
                  <th style={{ padding: "4px 0", fontWeight: 500, textAlign: "right" }}>
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d) => (
                  <tr key={d.issueType} style={{ borderTop: "1px solid var(--rr-hairline)" }}>
                    <td style={{ padding: "6px 0" }}>
                      {humanIssueType(d.issueType)}{" "}
                      <span style={{ color: "var(--rr-text-3)", fontSize: 11 }}>
                        ({d.severity})
                      </span>
                    </td>
                    <td style={{ padding: "6px 0", color: "var(--rr-text-3)" }}>
                      {d.siteLevel
                        ? "site-wide"
                        : `${d.affectedPages} of ${d.scoredPages} pages`}
                    </td>
                    <td
                      className="rr-mono"
                      style={{ padding: "6px 0", textAlign: "right" }}
                    >
                      −{d.penalty.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--rr-text-3)" }}>
            Overall {overall ?? "—"}
            {scoreVersion != null ? ` · scoring v${scoreVersion}` : ""}
            {crawlerVersion ? ` · crawler ${crawlerVersion}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
