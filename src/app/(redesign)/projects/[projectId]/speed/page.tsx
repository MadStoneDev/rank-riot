import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { PageRows, type PageRowItem } from "@/components/redesign/PageRows";
import { ReportExport } from "@/components/redesign/ReportExport";
import type { PageFlag } from "@/lib/fixes";

// Thresholds kept in sync with the crawler's issue detector: TTFB > 600ms
// (slow_server_response), load > 3s (slow_page), payload > 3MB (large_page_size).
const TTFB_SLOW_MS = 600;
const LOAD_SLOW_MS = 3000;
const HEAVY_BYTES = 3_000_000;

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m];
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1000)} KB`;
}

export default async function SpeedPage({
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

  const { data: pages } = await supabase
    .from("pages")
    .select(
      "id, url, title, first_byte_time_ms, load_time_ms, size_bytes, word_count, js_count, css_count",
    )
    .eq("project_id", projectId)
    .like("url", "http%");

  const all = pages ?? [];
  const ttfbs = all
    .map((p) => p.first_byte_time_ms ?? 0)
    .filter((v) => v > 0);
  const sizes = all.map((p) => p.size_bytes ?? 0).filter((v) => v > 0);
  const medianTtfb = median(ttfbs);
  const medianSize = median(sizes);
  const heaviest = sizes.length ? Math.max(...sizes) : 0;

  const rows: (PageRowItem & { sortKey: number })[] = [];
  for (const p of all) {
    const ttfb = p.first_byte_time_ms ?? 0;
    const load = p.load_time_ms ?? 0;
    const size = p.size_bytes ?? 0;
    const flags: PageFlag[] = [];
    if (ttfb > TTFB_SLOW_MS) flags.push({ label: "Slow TTFB", severity: "warning" });
    if (load > LOAD_SLOW_MS) flags.push({ label: "Slow load", severity: "warning" });
    if (size > HEAVY_BYTES) flags.push({ label: "Heavy page", severity: "warning" });
    if (flags.length === 0) continue;

    const metaParts: string[] = [];
    if (ttfb > 0) metaParts.push(`${ttfb} ms`);
    if (size > 0) metaParts.push(formatBytes(size));
    rows.push({
      id: p.id,
      title: p.title || "Untitled page",
      path: pathOf(p.url),
      meta: metaParts.join(" · "),
      flags,
      sortKey: Math.max(ttfb, load) + size / 1000,
    });
  }
  rows.sort((a, b) => b.sortKey - a.sortKey);
  const slowCount = rows.length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ReportHeader
        projectName={project.name}
        meta={`${all.length} pages`}
        projectId={projectId}
        exportSlot={
          <ReportExport
            dataType="performance"
            data={all}
            filenamePrefix={`${project.name}-performance`}
            projectName={project.name}
            projectUrl={project.url}
          />
        }
      />
      <div style={{ padding: "18px 32px 0" }}>
        <ReportTabs projectId={projectId} />
      </div>
      <div style={{ padding: "20px 32px 0" }}>
        <MetricStrip>
          <MetricCard
            label="Median TTFB"
            value={medianTtfb > 0 ? medianTtfb : "—"}
            delta={medianTtfb > 0 ? "ms" : undefined}
          />
          <MetricCard
            label="Slow pages"
            value={slowCount}
            delta={slowCount > 0 ? "to fix" : undefined}
            deltaTone={slowCount > 0 ? "critical" : "muted"}
          />
          <MetricCard
            label="Median size"
            value={medianSize > 0 ? formatBytes(medianSize) : "—"}
          />
          <MetricCard
            label="Heaviest page"
            value={heaviest > 0 ? formatBytes(heaviest) : "—"}
          />
        </MetricStrip>
      </div>
      <div style={{ padding: "20px 32px 96px" }}>
        <PageRows
          projectId={projectId}
          rows={rows}
          emptyText={`No slow or heavy pages in ${all.length} scanned.`}
        />
      </div>
    </div>
  );
}
