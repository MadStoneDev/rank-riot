import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { ReportExport } from "@/components/redesign/ReportExport";

interface ScanRow {
  id: string;
  date: string;
  health: number | null;
  pages: number;
  issues: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// A minimal neutral sparkline of the health trend (oldest → newest). Progress
// and trend are a state, not an alarm, so it uses text colour, never accent.
function Sparkline({ values }: { values: number[] }) {
  const pts = values.filter((v) => typeof v === "number");
  if (pts.length < 2) return null;
  const w = 260;
  const h = 40;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = w / (pts.length - 1);
  const coords = pts.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: "block" }}>
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="var(--rr-text-2)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) notFound();

  const { data: scans } = await supabase
    .from("scans")
    .select("id, completed_at, started_at, pages_scanned, issues_found, summary_stats")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(50);

  // Newest first for display; oldest first for the trend line.
  const rows: ScanRow[] = (scans ?? []).map((s) => {
    const summary = (s.summary_stats ?? {}) as { seo_score?: { overall?: number } };
    return {
      id: s.id,
      date: formatDate(s.completed_at ?? s.started_at),
      health: summary.seo_score?.overall ?? null,
      pages: s.pages_scanned ?? 0,
      issues: s.issues_found ?? 0,
    };
  });

  const healthSeriesOldestFirst = [...rows]
    .reverse()
    .map((r) => r.health)
    .filter((v): v is number => typeof v === "number");

  const exportRows = (scans ?? []).map((s) => {
    const summary = (s.summary_stats ?? {}) as { seo_score?: { overall?: number } };
    return {
      scan_date: s.completed_at ?? s.started_at,
      health: summary.seo_score?.overall ?? null,
      pages: s.pages_scanned ?? 0,
      issues: s.issues_found ?? 0,
    };
  });

  const latest = rows[0];
  const previous = rows[1];
  const delta =
    latest?.health != null && previous?.health != null
      ? latest.health - previous.health
      : null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ReportHeader
        projectName={project.name}
        meta={`${rows.length} ${rows.length === 1 ? "scan" : "scans"} recorded`}
        projectId={projectId}
        exportSlot={
          <ReportExport
            dataType="scan-history"
            data={exportRows}
            filenamePrefix={`${project.name}-scan-history`}
            projectName={project.name}
            projectUrl={project.url}
          />
        }
      />
      <div style={{ padding: "18px 32px 0" }}>
        <ReportTabs projectId={projectId} />
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            padding: "48px 32px",
            color: "var(--rr-text-3)",
            fontSize: 13,
          }}
        >
          No completed scans yet.
        </div>
      ) : (
        <>
          <div style={{ padding: "20px 32px 0" }}>
            <MetricStrip>
              <MetricCard
                label="Latest health"
                value={latest?.health ?? "—"}
                delta={
                  delta != null
                    ? `${delta >= 0 ? "+" : ""}${delta} since last`
                    : undefined
                }
                deltaTone={delta != null && delta > 0 ? "positive" : "muted"}
              />
              <MetricCard label="Scans" value={rows.length} />
              <MetricCard label="Pages (latest)" value={latest?.pages ?? 0} />
              <MetricCard label="Findings (latest)" value={latest?.issues ?? 0} />
            </MetricStrip>
          </div>

          {healthSeriesOldestFirst.length >= 2 && (
            <div style={{ padding: "24px 32px 0" }}>
              <div
                className="rr-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--rr-text-3)",
                  marginBottom: 10,
                }}
              >
                Health trend
              </div>
              <Sparkline values={healthSeriesOldestFirst} />
            </div>
          )}

          {/* Column heads */}
          <div style={{ padding: "24px 32px 0" }}>
            <div
              className="rr-mono"
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: "0 12px 10px",
                borderBottom: "1px solid var(--rr-hairline-strong)",
                fontSize: 11,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--rr-text-3)",
              }}
            >
              <div style={{ flex: 1 }}>Scan</div>
              <div style={{ width: 80, textAlign: "right" }}>Health</div>
              <div style={{ width: 70, textAlign: "right" }}>Δ</div>
              <div style={{ width: 70, textAlign: "right" }}>Pages</div>
              <div style={{ width: 80, textAlign: "right" }}>Findings</div>
            </div>

            {rows.map((r, i) => {
              const older = rows[i + 1];
              const d =
                r.health != null && older?.health != null
                  ? r.health - older.health
                  : null;
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    padding: "13px 12px",
                    borderBottom: "1px solid var(--rr-hairline)",
                  }}
                >
                  <div className="rr-mono" style={{ flex: 1, fontSize: 13 }}>
                    {r.date}
                  </div>
                  <div
                    className="rr-mono"
                    style={{ width: 80, textAlign: "right", fontSize: 14, fontWeight: 600 }}
                  >
                    {r.health ?? "—"}
                  </div>
                  <div
                    className="rr-mono"
                    style={{
                      width: 70,
                      textAlign: "right",
                      fontSize: 13,
                      color: d != null && d > 0 ? "var(--rr-pos)" : "var(--rr-text-3)",
                    }}
                  >
                    {d == null ? "—" : `${d >= 0 ? "+" : ""}${d}`}
                  </div>
                  <div
                    className="rr-mono"
                    style={{ width: 70, textAlign: "right", fontSize: 13, color: "var(--rr-text-2)" }}
                  >
                    {r.pages}
                  </div>
                  <div
                    className="rr-mono"
                    style={{ width: 80, textAlign: "right", fontSize: 13, color: "var(--rr-text-2)" }}
                  >
                    {r.issues}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 96 }} />
        </>
      )}
    </div>
  );
}
