import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  MetricCard,
  MetricStrip,
  SeverityDot,
} from "@/components/redesign/primitives";
import { computeFixes } from "@/lib/fixes";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ScanInProgress } from "@/components/redesign/ScanInProgress";
import { ReportExport } from "@/components/redesign/ReportExport";
import { rescanProject } from "@/app/(redesign)/actions";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function formatScanned(iso?: string | null): string {
  if (!iso) return "not scanned yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "not scanned yet";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function FixesPage({
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

  const { data: latestScan } = await supabase
    .from("scans")
    .select("completed_at, pages_scanned, summary_stats")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // A scan currently running takes over the whole screen (Screen 6).
  const { data: runningScan } = await supabase
    .from("scans")
    .select("id, started_at, pages_scanned, links_scanned, issues_found, summary_stats")
    .eq("project_id", projectId)
    .in("status", ["in_progress", "pending"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Open issues (not fixed, not dismissed) → fixes, and the raw rows for export.
  const { data: issueRows } = await supabase
    .from("issues")
    .select("issue_type, severity, description, details, created_at, is_fixed, pages(url)")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .eq("dismissed", false);

  const fixes = computeFixes(issueRows ?? []);
  const issueExport = (issueRows ?? []).map((r) => {
    const row = r as typeof r & { pages?: { url?: string } | null };
    return {
      page_url: row.pages?.url ?? "",
      issue_type: row.issue_type,
      severity: row.severity,
      description: row.description,
      details: row.details,
      created_at: row.created_at,
      is_fixed: row.is_fixed,
    };
  });
  const criticalCount = fixes.filter((f) => f.severity === "critical").length;
  const orphanCount = (issueRows ?? []).filter(
    (r) => r.issue_type === "orphan_page",
  ).length;

  const { count: pagesCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .like("url", "http%");

  const { data: ttfbRows } = await supabase
    .from("pages")
    .select("first_byte_time_ms")
    .eq("project_id", projectId)
    .like("url", "http%")
    .not("first_byte_time_ms", "is", null);
  const medianTtfb = median(
    (ttfbRows ?? [])
      .map((r) => r.first_byte_time_ms as number)
      .filter((v) => typeof v === "number" && v > 0),
  );

  const summary = (latestScan?.summary_stats ?? {}) as {
    seo_score?: { overall?: number };
  };
  const health = summary.seo_score?.overall ?? null;

  const metaLine = `${project.url} · scanned ${formatScanned(
    latestScan?.completed_at,
  )} · ${pagesCount ?? 0} pages`;

  if (runningScan) {
    const stats = (runningScan.summary_stats ?? {}) as {
      current_progress?: number;
      estimated_total?: number;
      queue_size?: number;
    };
    const pages = runningScan.pages_scanned ?? 0;
    const percent =
      typeof stats.current_progress === "number"
        ? Math.min(100, Math.round(stats.current_progress))
        : stats.estimated_total && stats.estimated_total > 0
          ? Math.min(95, Math.round((pages / stats.estimated_total) * 100))
          : Math.min(90, Math.round((pages / Math.max(1, pages * 1.3)) * 100)) || 5;

    return (
      <ScanInProgress
        projectId={projectId}
        scanId={runningScan.id}
        projectName={project.name}
        domain={hostOf(project.url)}
        startedAt={runningScan.started_at}
        initial={{
          pagesScanned: pages,
          linksScanned: runningScan.links_scanned ?? 0,
          issuesFound: runningScan.issues_found ?? 0,
          percent,
          queueSize: stats.queue_size ?? null,
        }}
        previous={{
          health,
          openFixes: fixes.length,
          medianResponse: medianTtfb,
          orphanCount,
          lastScanned: latestScan?.completed_at ?? null,
          fixes: fixes.map((f) => ({
            id: f.id,
            severity: f.severity,
            title: f.title,
            effort: f.effort,
          })),
        }}
      />
    );
  }

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 600 }}>{project.name}</div>
          <div
            className="rr-mono"
            style={{
              fontSize: 12,
              color: "var(--rr-text-3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {metaLine}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <ReportExport
            dataType="issues"
            data={issueExport}
            filenamePrefix={`${project.name}-issues`}
            projectName={project.name}
            projectUrl={project.url}
          />
          <form action={rescanProject}>
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="submit"
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
              Rescan
            </button>
          </form>
        </div>
      </div>

      {/* Metric strip */}
        <div style={{ padding: "24px 32px 0" }}>
          <MetricStrip>
            <MetricCard
              label="Health score"
              value={health ?? "—"}
            />
            <MetricCard
              label="Open fixes"
              value={fixes.length}
              delta={criticalCount > 0 ? `${criticalCount} critical` : undefined}
              deltaTone={criticalCount > 0 ? "critical" : "muted"}
            />
            <MetricCard
              label="Median response"
              value={medianTtfb > 0 ? medianTtfb : "—"}
              delta={medianTtfb > 0 ? "ms" : undefined}
            />
            <MetricCard label="Orphaned content" value={orphanCount} delta="pages" />
          </MetricStrip>
        </div>

        {/* Section nav + fixes list */}
        <div style={{ padding: "22px 32px 64px" }}>
          <ReportTabs projectId={projectId} />
          {fixes.length === 0 ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--rr-text-3)",
                fontSize: 13,
              }}
            >
              No open fixes — everything&rsquo;s clean.
            </div>
          ) : (
            <div>
              {fixes.map((fix) => (
                <div
                  key={fix.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 12px 15px",
                    borderBottom: "1px solid var(--rr-hairline)",
                    flexWrap: "wrap",
                  }}
                >
                  <SeverityDot severity={fix.severity} />
                  <div
                    style={{
                      flex: "0 1 330px",
                      minWidth: 0,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {fix.title}
                  </div>
                  <div
                    style={{
                      flex: "1 1 240px",
                      minWidth: 0,
                      fontSize: 13,
                      color: "var(--rr-text-2)",
                    }}
                  >
                    {fix.impact}
                  </div>
                  <div
                    className="rr-mono"
                    style={{
                      flex: "none",
                      marginLeft: "auto",
                      textAlign: "right",
                      fontSize: 12,
                      color: "var(--rr-text-3)",
                    }}
                  >
                    {fix.effort}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
