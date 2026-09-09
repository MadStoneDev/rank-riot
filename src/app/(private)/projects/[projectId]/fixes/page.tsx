import "@/components/redesign/tokens.css";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { plexSans, plexMono } from "@/lib/redesign-fonts";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { computeFixes } from "@/lib/fixes";
import { FixesView } from "./FixesView";

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
    .single();

  // Open issues (not fixed, not dismissed) → fixes.
  const { data: issueRows } = await supabase
    .from("issues")
    .select("issue_type, severity")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .eq("dismissed", false);

  const fixes = computeFixes(issueRows ?? []);
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

  return (
    <div
      className={`rr ${plexSans.variable} ${plexMono.variable}`}
      style={{ minHeight: "100vh" }}
    >
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
          <div style={{ display: "flex", gap: 10, flex: "none" }}>
            <Link
              href={`/projects/${projectId}`}
              style={{
                height: 34,
                padding: "0 14px",
                border: "1px solid var(--rr-border)",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "var(--rr-text)",
              }}
            >
              Classic view
            </Link>
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

        {/* Tabs + fixes list */}
        <div style={{ padding: "22px 32px 64px" }}>
          <FixesView fixes={fixes} />
        </div>
      </div>
    </div>
  );
}
