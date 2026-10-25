import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExportDataType, ExportableData } from "@/types/export";
import { describeLinkError } from "@/lib/link-status";
import { fetchAllProjectPages } from "@/lib/server/project-pages";

// Server-side, PAGINATED dataset builders for exports (F-E02 / F-P01). Every
// read is chunked so a large project (up to 100k pages) never pulls its whole
// table into memory in one query. Both the single-dataset export route and the
// Export-All route build from here, so they stay consistent.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>;
type Row = Record<string, unknown>;

const CHUNK = 1000;

/** Fetch every crawled page row for a project, one page of rows at a time. */
export async function fetchAllPages(supabase: DB, projectId: string): Promise<Row[]> {
  return fetchAllProjectPages<Row>(supabase, projectId, "*");
}

async function fetchAllLinks(supabase: DB, projectId: string, columns: string, filter?: (q: any) => any): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += CHUNK) {
    let q = supabase.from("page_links").select(columns).eq("project_id", projectId);
    if (filter) q = filter(q);
    const { data, error } = await q.range(from, from + CHUNK - 1);
    if (error || !data || data.length === 0) break;
    out.push(...(data as unknown as Row[]));
    if (data.length < CHUNK) break;
  }
  return out;
}

function pageUrlMap(pages: Row[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const p of pages) m.set(p.id as string, p.url as string);
  return m;
}

async function buildIssues(supabase: DB, projectId: string): Promise<ExportableData> {
  const out: ExportableData = [];
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabase
      .from("issues")
      .select("fingerprint, issue_type, severity, description, details, created_at, is_fixed, pages(url)")
      .eq("project_id", projectId)
      .eq("is_fixed", false)
      .eq("dismissed", false)
      .range(from, from + CHUNK - 1);
    if (error || !data || data.length === 0) break;
    for (const r of data) {
      const row = r as Row & { pages?: { url?: string } | null };
      out.push({
        issue_id: row.fingerprint ?? "",
        page_url: row.pages?.url ?? "",
        issue_type: row.issue_type,
        severity: row.severity,
        description: row.description,
        details: row.details,
        first_seen: row.created_at,
        is_fixed: row.is_fixed,
      });
    }
    if (data.length < CHUNK) break;
  }
  return out;
}

function buildImagesAlt(pages: Row[]): ExportableData {
  return pages.flatMap((p) =>
    (Array.isArray(p.images) ? (p.images as Row[]) : []).map((img) => {
      const dims = img.dimensions as { width?: number; height?: number } | undefined;
      const width = img.width ?? dims?.width;
      const height = img.height ?? dims?.height;
      const altState = (img.alt_state as string | undefined) ?? null;
      return {
        pageUrl: p.url,
        pageTitle: p.title ?? "",
        imageSrc: img.src ?? "",
        alt: img.alt ?? "",
        hasAlt: altState ? altState !== "absent" : !!(img.alt && String(img.alt).trim()),
        alt_state: altState,
        width,
        height,
        missingDimensions: !width || !height,
        fileSizeBytes: img.file_size_bytes ?? null,
        format: img.format ?? "",
        loading: img.loading ?? "",
      };
    }),
  );
}

async function buildBrokenLinks(supabase: DB, projectId: string, pages: Row[]): Promise<ExportableData> {
  const urlById = pageUrlMap(pages);
  const links = await fetchAllLinks(
    supabase,
    projectId,
    "source_page_id, destination_url, http_status, anchor_text, is_broken, link_error",
    (q) => q.or("is_broken.eq.true,http_status.in.(401,403,429,503,999),link_error.not.is.null"),
  );
  const groups = new Map<string, { destination_url: string; http_status: number | null; link_state: string; anchor_text: string | null; sources: Set<string> }>();
  for (const l of links) {
    const sourceUrl = urlById.get(l.source_page_id as string) ?? "";
    const dest = l.destination_url as string;
    const g = groups.get(dest);
    if (g) {
      g.sources.add(sourceUrl);
    } else {
      const reason = l.link_error ? describeLinkError(l.link_error as string) : "";
      const linkState = l.is_broken
        ? reason ? `broken (${reason})` : "broken"
        : reason ? `couldn't verify (${reason})` : "blocked (couldn't verify)";
      groups.set(dest, { destination_url: dest, http_status: (l.http_status as number) ?? null, link_state: linkState, anchor_text: (l.anchor_text as string) ?? null, sources: new Set([sourceUrl]) });
    }
  }
  return Array.from(groups.values()).map((g) => ({
    destination_url: g.destination_url,
    http_status: g.http_status,
    link_state: g.link_state,
    found_on_pages: g.sources.size,
    example_source_url: Array.from(g.sources)[0] ?? "",
    anchor_text: g.anchor_text,
  }));
}

async function buildLinks(supabase: DB, projectId: string, pages: Row[], type: "internal" | "external"): Promise<ExportableData> {
  const urlById = pageUrlMap(pages);
  const links = await fetchAllLinks(
    supabase,
    projectId,
    "source_page_id, destination_url, anchor_text, is_followed, http_status, rel_attributes",
    (q) => q.eq("link_type", type),
  );
  return links.map((l) => ({
    source_url: urlById.get(l.source_page_id as string) ?? "",
    destination_url: l.destination_url,
    anchor_text: l.anchor_text,
    is_followed: l.is_followed,
    http_status: l.http_status,
    rel_attributes: l.rel_attributes,
  }));
}

async function buildAnchorDistribution(supabase: DB, projectId: string, pages: Row[]): Promise<ExportableData> {
  const external = await buildLinks(supabase, projectId, pages, "external");
  const counts = new Map<string, { destination_url: string; anchor_text: string; count: number }>();
  for (const l of external) {
    const dest = String(l.destination_url ?? "");
    const anchor = (l.anchor_text as string) || "(empty)";
    const key = `${dest}\u0000${anchor}`;
    const g = counts.get(key);
    if (g) g.count++;
    else counts.set(key, { destination_url: dest, anchor_text: anchor, count: 1 });
  }
  return Array.from(counts.values());
}

async function buildScanHistory(supabase: DB, projectId: string): Promise<ExportableData> {
  const { data: scansRaw } = await supabase
    .from("scans")
    .select("id, completed_at, pages_scanned, issues_found")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });
  const scanRows = (scansRaw ?? []) as Row[];
  const scanIds = scanRows.map((s) => s.id as string);
  const overallByScan = new Map<string, number>();
  if (scanIds.length > 0) {
    const { data: scoresRaw } = await supabase.from("scan_scores").select("scan_id, overall").in("scan_id", scanIds);
    for (const s of (scoresRaw ?? []) as Row[]) overallByScan.set(s.scan_id as string, s.overall as number);
  }
  return scanRows.map((s) => ({
    scan_date: s.completed_at,
    health: overallByScan.get(s.id as string) ?? null,
    pages: s.pages_scanned ?? 0,
    issues: s.issues_found ?? 0,
  }));
}

function buildRedirects(pages: Row[]): ExportableData {
  return pages.filter((p) => {
    const s = p.http_status as number | null;
    return (!!s && s >= 300 && s < 400) || !!p.redirect_url;
  });
}

/** Datasets that are just a column view over the pages rows. */
const PAGE_VIEW_TYPES = new Set<ExportDataType>([
  "pages", "seo-metadata", "headings", "schema-data", "performance", "technical-health",
]);

/**
 * Build one export dataset for a project, server-side and paginated. `pages`
 * may be passed in to avoid refetching when several datasets are built together
 * (Export-All); otherwise it is fetched on demand.
 */
export async function buildDataset(
  supabase: DB,
  projectId: string,
  dataType: ExportDataType,
  pages?: Row[],
): Promise<ExportableData> {
  const getPages = async () => pages ?? (await fetchAllPages(supabase, projectId));
  switch (dataType) {
    case "issues":
      return buildIssues(supabase, projectId);
    case "redirects":
      return buildRedirects(await getPages());
    case "images-alt":
      return buildImagesAlt(await getPages());
    case "broken-links":
      return buildBrokenLinks(supabase, projectId, await getPages());
    case "internal-links":
      return buildLinks(supabase, projectId, await getPages(), "internal");
    case "external-links":
      return buildLinks(supabase, projectId, await getPages(), "external");
    case "anchor-distribution":
      return buildAnchorDistribution(supabase, projectId, await getPages());
    case "scan-history":
      return buildScanHistory(supabase, projectId);
    default:
      // The remaining types are column views over the page rows.
      if (PAGE_VIEW_TYPES.has(dataType)) return (await getPages()) as ExportableData;
      return [];
  }
}
