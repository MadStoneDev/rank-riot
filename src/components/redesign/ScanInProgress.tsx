"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cancelScan } from "@/app/(redesign)/actions";
import { MetricCard, MetricStrip, SeverityDot } from "@/components/redesign/primitives";
import type { FixSeverity } from "@/lib/fixes";

// Screen 6 — scan in progress. Progress is a state, not an alarm: a 2px
// text-primary bar, no amber, no accent fill. The only prominent action is an
// outlined "Stop scan". The previous completed scan stays readable underneath
// at opacity .45, explicitly labelled stale. Polls the scans row every 3s and
// refreshes the server component when the scan resolves.

interface Progress {
  pagesScanned: number;
  linksScanned: number;
  issuesFound: number;
  percent: number;
  queueSize: number | null;
}

interface PreviousFix {
  id: string;
  severity: FixSeverity;
  title: string;
  effort: string;
}

export function ScanInProgress({
  projectId,
  scanId,
  projectName,
  domain,
  startedAt,
  initial,
  previous,
}: {
  projectId: string;
  scanId: string;
  projectName: string;
  domain: string;
  startedAt: string | null;
  initial: Progress;
  previous: {
    health: number | null;
    openFixes: number;
    medianResponse: number | null;
    orphanCount: number;
    fixes: PreviousFix[];
    lastScanned: string | null;
  };
}) {
  const router = useRouter();
  const [p, setP] = useState<Progress>(initial);
  const [stopping, setStopping] = useState(false);
  const supabase = createClient();

  const handleStop = async () => {
    if (stopping) return;
    if (!confirm("Stop this scan? The in-progress scan will be discarded and your last completed scan kept.")) return;
    setStopping(true);
    try {
      await cancelScan(scanId);
      router.refresh();
    } catch {
      setStopping(false);
    }
  };

  useEffect(() => {
    let active = true;
    const read = async () => {
      const { data } = await supabase
        .from("scans")
        .select("status, pages_scanned, links_scanned, issues_found, summary_stats")
        .eq("id", scanId)
        .single();
      if (!active || !data) return;
      if (data.status === "completed" || data.status === "failed") {
        router.refresh();
        return;
      }
      const stats = (data.summary_stats ?? {}) as {
        current_progress?: number;
        estimated_total?: number;
        queue_size?: number;
      };
      const pages = data.pages_scanned ?? 0;
      const percent =
        typeof stats.current_progress === "number"
          ? Math.min(100, Math.round(stats.current_progress))
          : stats.estimated_total && stats.estimated_total > 0
            ? Math.min(95, Math.round((pages / stats.estimated_total) * 100))
            : Math.min(90, Math.round((pages / Math.max(1, pages * 1.3)) * 100)) || 5;
      setP({
        pagesScanned: pages,
        linksScanned: data.links_scanned ?? 0,
        issuesFound: data.issues_found ?? 0,
        percent,
        queueSize: stats.queue_size ?? null,
      });
    };
    const id = setInterval(read, 3000);
    read();
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [scanId, router, supabase]);

  const startedLabel = startedAt
    ? new Date(startedAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 32px",
          height: 72,
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 600 }}>{projectName}</div>
          <div className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-3)" }}>
            {domain}
            {startedLabel ? ` · scanning since ${startedLabel}` : " · scanning"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flex: "none" }}>
          <span
            style={{
              height: 34,
              padding: "0 14px",
              border: "1px solid var(--rr-border)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              color: "var(--rr-text-3)",
            }}
          >
            Export
          </span>
          <button
            onClick={handleStop}
            disabled={stopping}
            style={{
              height: 34,
              padding: "0 14px",
              border: "1px solid var(--rr-border-button)",
              borderRadius: 7,
              background: "none",
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              color: "var(--rr-text)",
              cursor: stopping ? "default" : "pointer",
            }}
          >
            {stopping ? "Stopping…" : "Stop scan"}
          </button>
        </div>
      </div>

      {/* Progress block */}
      <div style={{ padding: "22px 32px 20px", borderBottom: "1px solid var(--rr-hairline)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Scanning</span>
            <span className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-2)" }}>
              {p.pagesScanned} pages · {p.percent}%
            </span>
          </div>
        </div>
        {/* 2px bar */}
        <div
          style={{
            marginTop: 12,
            height: 2,
            background: "#1b1e23",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${p.percent}%`,
              height: "100%",
              background: "var(--rr-text)",
              transition: "width 400ms linear",
            }}
          />
        </div>
        {/* Counters */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 26,
            flexWrap: "wrap",
          }}
          className="rr-mono"
        >
          {p.queueSize != null && (
            <Counter label="In queue" value={p.queueSize} />
          )}
          <Counter label="Links checked" value={p.linksScanned} />
          <Counter label="Findings so far" value={p.issuesFound} />
        </div>
      </div>

      {/* Stale divider */}
      <div
        style={{
          padding: "18px 32px 12px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          className="rr-mono"
          style={{
            fontSize: 11,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--rr-text-3)",
          }}
        >
          Last scan{previous.lastScanned ? ` · ${shortDate(previous.lastScanned)}` : ""}
        </span>
        <span style={{ fontSize: 13, color: "var(--rr-text-3)" }}>
          These figures are superseded when the scan finishes
        </span>
      </div>

      {/* Previous scan, dimmed */}
      <div style={{ opacity: 0.45, padding: "0 32px 96px", pointerEvents: "none" }}>
        <MetricStrip>
          <MetricCard label="Health score" value={previous.health ?? "—"} />
          <MetricCard label="Open fixes" value={previous.openFixes} />
          <MetricCard
            label="Median response"
            value={previous.medianResponse && previous.medianResponse > 0 ? previous.medianResponse : "—"}
            delta={previous.medianResponse && previous.medianResponse > 0 ? "ms" : undefined}
          />
          <MetricCard label="Orphaned content" value={previous.orphanCount} delta="pages" />
        </MetricStrip>
        <div style={{ marginTop: 20 }}>
          {previous.fixes.slice(0, 4).map((fix) => (
            <div
              key={fix.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 12px 15px",
                borderBottom: "1px solid var(--rr-hairline)",
              }}
            >
              <SeverityDot severity={fix.severity} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{fix.title}</div>
              <div
                className="rr-mono"
                style={{ flex: "none", fontSize: 12, color: "var(--rr-text-3)" }}
              >
                {fix.effort}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--rr-text-3)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rr-text)" }}>
        {value.toLocaleString()}
      </span>
    </span>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
