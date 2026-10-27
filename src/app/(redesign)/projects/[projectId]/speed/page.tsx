import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { SpeedTable, type SpeedRow } from "@/components/redesign/SpeedTable";
import { ReportExport } from "@/components/redesign/ReportExport";
import { fetchAllProjectPages } from "@/lib/server/project-pages";
import { flagFor, type PageFlag } from "@/lib/fixes";

interface SpeedPageRow {
  id: string;
  url: string;
  title: string | null;
  first_byte_time_ms: number | null;
  load_time_ms: number | null;
  size_bytes: number | null;
  scan_method: string | null;
}

// The speed report is sourced from the crawler's facts (F-D12). Per-page flags
// come only from the persisted slow_page / large_page_size issues — the page no
// longer recomputes "slow" from metrics with its own thresholds. TTFB / load /
// size are shown as plain, sortable raw-data columns. slow_server_response is a
// single site-level issue, surfaced as one banner. Only HTTP-timed pages carry
// comparable timing, so medians and the heaviest-page figure are computed over
// HTTP pages (matching the crawler, which raises slow_page/large_page_size for
// HTTP-timed pages only).
const SPEED_ISSUE_TYPES = ["slow_page", "large_page_size"] as const;
const ROW_LIMIT = 200;

interface SlowServerDetails {
  median_ttfb_ms?: number;
  pages_measured?: number;
  pages_over_600ms?: number;
}

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

  // Paginated so medians cover every page, not just the first 1000 PostgREST
  // would otherwise return (F-P01).
  const all = await fetchAllProjectPages<SpeedPageRow>(
    supabase,
    projectId,
    // word_count/js_count/css_count are unused here but kept so the client-side
    // "performance" export (fed `all`) keeps its columns.
    "id, url, title, first_byte_time_ms, load_time_ms, size_bytes, word_count, js_count, css_count, scan_method",
  );

  // Persisted speed issues: per-page slow_page / large_page_size become row
  // flags; the single slow_server_response becomes the site-level banner.
  const { data: issueRows } = await supabase
    .from("issues")
    .select("page_id, issue_type, severity, details")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .eq("dismissed", false)
    .in("issue_type", [...SPEED_ISSUE_TYPES, "slow_server_response"]);

  const flagsByPage = new Map<string, PageFlag[]>();
  let slowServer: SlowServerDetails | null = null;
  for (const r of issueRows ?? []) {
    if (r.issue_type === "slow_server_response") {
      slowServer = (r.details ?? {}) as SlowServerDetails;
      continue;
    }
    if (!r.page_id) continue;
    const list = flagsByPage.get(r.page_id) ?? [];
    list.push(flagFor(r.issue_type, r.severity));
    flagsByPage.set(r.page_id, list);
  }

  const isHttp = (p: SpeedPageRow) => p.scan_method === "http";

  // Medians / heaviest over HTTP-timed pages only (headless size is the rendered
  // DOM length, headless TTFB a different vantage — not comparable, PF-01/PF-03).
  const httpTtfbs = all
    .filter(isHttp)
    .map((p) => p.first_byte_time_ms ?? 0)
    .filter((v) => v > 0);
  const httpSizes = all
    .filter(isHttp)
    .map((p) => p.size_bytes ?? 0)
    .filter((v) => v > 0);
  const medianTtfb = median(httpTtfbs);
  const medianSize = median(httpSizes);
  const heaviest = httpSizes.length ? Math.max(...httpSizes) : 0;
  const flaggedCount = flagsByPage.size;

  // One row per page that carries a flag or any timing signal. Ordered for the
  // cap so the most relevant rows survive truncation: flagged first, then HTTP
  // pages by TTFB (slowest first), then headless pages (incomparable timing).
  const candidates = all
    .map((p) => {
      const flags = flagsByPage.get(p.id) ?? [];
      return {
        page: p,
        flags,
        hasTiming:
          (p.first_byte_time_ms ?? 0) > 0 ||
          (p.load_time_ms ?? 0) > 0 ||
          (p.size_bytes ?? 0) > 0,
      };
    })
    .filter((c) => c.flags.length > 0 || c.hasTiming);

  candidates.sort((a, b) => {
    const af = a.flags.length > 0 ? 1 : 0;
    const bf = b.flags.length > 0 ? 1 : 0;
    if (af !== bf) return bf - af; // flagged first
    const ah = isHttp(a.page) ? 1 : 0;
    const bh = isHttp(b.page) ? 1 : 0;
    if (ah !== bh) return bh - ah; // HTTP (comparable) before headless
    return (b.page.first_byte_time_ms ?? 0) - (a.page.first_byte_time_ms ?? 0);
  });

  const total = candidates.length;
  const rows: SpeedRow[] = candidates.slice(0, ROW_LIMIT).map((c) => ({
    id: c.page.id,
    title: c.page.title || "Untitled page",
    path: pathOf(c.page.url),
    ttfbMs: c.page.first_byte_time_ms,
    loadMs: c.page.load_time_ms,
    sizeBytes: c.page.size_bytes,
    isHttp: isHttp(c.page),
    flags: c.flags,
  }));
  const truncated = total > rows.length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ReportHeader
        projectName={project.name}
        meta={`${all.length} pages`}
        projectId={projectId}
        exportSlot={
          <ReportExport
            projectId={projectId}
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

      {slowServer && (
        <div style={{ padding: "20px 32px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 9,
              border: "1px solid var(--rr-warn)",
              background: "color-mix(in srgb, var(--rr-warn) 8%, transparent)",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 8,
                height: 8,
                marginTop: 6,
                borderRadius: "50%",
                background: "var(--rr-warn)",
                flex: "none",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-warn)" }}>
                Slow server response
              </div>
              <div style={{ fontSize: 13, color: "var(--rr-text-2)", marginTop: 3 }}>
                {slowServer.median_ttfb_ms
                  ? `Median server response time (TTFB) is ${slowServer.median_ttfb_ms} ms across ${slowServer.pages_measured ?? "the"} pages${
                      slowServer.pages_over_600ms
                        ? ` (${slowServer.pages_over_600ms} over 600 ms)`
                        : ""
                    }. This is server response time, not page weight — usually a hosting, caching or backend fix.`
                  : "The site's median server response time (TTFB) is slow. This is a server/hosting fix, not a per-page one."}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 32px 0" }}>
        <MetricStrip>
          <MetricCard
            label="Median TTFB"
            value={medianTtfb > 0 ? medianTtfb : "—"}
            delta={medianTtfb > 0 ? "ms" : undefined}
          />
          <MetricCard
            label="Flagged pages"
            value={flaggedCount}
            delta={flaggedCount > 0 ? "to fix" : undefined}
            deltaTone={flaggedCount > 0 ? "critical" : "muted"}
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

      <div style={{ padding: "20px 32px 8px", fontSize: 12, color: "var(--rr-text-3)" }}>
        Flags come from the crawler&apos;s slow_page and large_page_size checks
        (HTTP-timed pages). TTFB, load and size are raw measurements.
        {truncated
          ? ` Showing the ${rows.length} most relevant of ${total} timed pages.`
          : ""}
      </div>
      <div style={{ padding: "0 32px 96px" }}>
        <SpeedTable projectId={projectId} rows={rows} />
      </div>
    </div>
  );
}
