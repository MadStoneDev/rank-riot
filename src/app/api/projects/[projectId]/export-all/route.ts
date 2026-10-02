import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { ExportDataType, ExportableData } from "@/types/export";
import { describeLinkError } from "@/lib/link-status";

// Assembles every exportable dataset for a project in one call, so the redesign
// can offer a single "Export all" (ZIP of one CSV per dataset) — the classic
// Export-Everything, which lost its home when the classic report was retired.
// Most datasets are different column views of the same page rows, so one pages
// fetch feeds several entries.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: pagesRaw } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", projectId)
    .like("url", "http%");
  const pages = (pagesRaw ?? []) as Record<string, unknown>[];

  const { data: issuesRaw } = await supabase
    .from("issues")
    .select("issue_type, severity, description, details, created_at, is_fixed, pages(url)")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .eq("dismissed", false);
  const issues = (issuesRaw ?? []).map((r) => {
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

  // Broken internal links, resolved to their source page URL.
  const pageUrlById = new Map<string, string>();
  for (const p of pages) pageUrlById.set(p.id as string, p.url as string);
  // Include both genuinely broken links and bot-blocked ones (couldn't verify),
  // labelled via link_state so a blocked 403/999 isn't mistaken for dead (P0.4).
  const { data: brokenRaw } = await supabase
    .from("page_links")
    .select("source_page_id, destination_url, http_status, anchor_text, is_broken, link_error")
    .eq("project_id", projectId)
    .or("is_broken.eq.true,http_status.in.(401,403,429,503,999),link_error.not.is.null");
  // Group by destination so a single dead/blocked footer link doesn't produce
  // one row per page it appears on — report it once with "found on N pages"
  // (P0 gap #3, mirrors the image dedupe in P1.9).
  const brokenGroups = new Map<
    string,
    {
      destination_url: string;
      http_status: number | null;
      link_state: string;
      anchor_text: string | null;
      sources: Set<string>;
    }
  >();
  for (const l of brokenRaw ?? []) {
    const sourceUrl = pageUrlById.get(l.source_page_id) ?? "";
    const g = brokenGroups.get(l.destination_url);
    if (g) {
      g.sources.add(sourceUrl);
    } else {
      // State label: a recorded network reason (DNS/timeout/TLS) wins, else
      // broken vs. bot-blocked by status.
      const reason = l.link_error ? describeLinkError(l.link_error) : "";
      const linkState = l.is_broken
        ? reason
          ? `broken (${reason})`
          : "broken"
        : reason
          ? `couldn't verify (${reason})`
          : "blocked (couldn't verify)";
      brokenGroups.set(l.destination_url, {
        destination_url: l.destination_url,
        http_status: l.http_status,
        link_state: linkState,
        anchor_text: l.anchor_text,
        sources: new Set([sourceUrl]),
      });
    }
  }
  const brokenLinks = Array.from(brokenGroups.values()).map((g) => ({
    destination_url: g.destination_url,
    http_status: g.http_status,
    link_state: g.link_state,
    found_on_pages: g.sources.size,
    example_source_url: Array.from(g.sources)[0] ?? "",
    anchor_text: g.anchor_text,
  }));

  // Redirects: pages whose status is 3xx or that carry a redirect target.
  const redirects = pages.filter((p) => {
    const s = p.http_status as number | null;
    return (!!s && s >= 300 && s < 400) || !!p.redirect_url;
  });

  // Per-image rows (flattened) for the images/alt dataset.
  const imagesAlt = pages.flatMap((p) =>
    (Array.isArray(p.images) ? (p.images as Record<string, unknown>[]) : []).map(
      (img) => {
        const dims = img.dimensions as { width?: number; height?: number } | undefined;
        const width = img.width ?? dims?.width;
        const height = img.height ?? dims?.height;
        const altState = (img.alt_state as string | undefined) ?? null;
        return {
          pageUrl: p.url,
          pageTitle: p.title ?? "",
          imageSrc: img.src ?? "",
          alt: img.alt ?? "",
          // "Has Alt" means the alt ATTRIBUTE is present (incl. decorative
          // alt=""); only alt_state 'absent' is a genuine miss (P0.2).
          hasAlt: altState
            ? altState !== "absent"
            : !!(img.alt && String(img.alt).trim()),
          alt_state: altState,
          width,
          height,
          missingDimensions: !width || !height,
          fileSizeBytes: img.file_size_bytes ?? null,
          format: img.format ?? "",
          loading: img.loading ?? "",
        };
      },
    ),
  );

  const all: { dataType: ExportDataType; data: ExportableData; label?: string }[] = [
    { dataType: "issues", data: issues },
    { dataType: "pages", data: pages },
    { dataType: "seo-metadata", data: pages },
    { dataType: "headings", data: pages },
    { dataType: "schema-data", data: pages },
    { dataType: "performance", data: pages },
    { dataType: "technical-health", data: pages },
    { dataType: "redirects", data: redirects },
    { dataType: "images-alt", data: imagesAlt },
    { dataType: "broken-links", data: brokenLinks },
  ];
  const entries = all.filter((e) => e.data.length > 0);

  return NextResponse.json({ projectName: project.name, entries });
}
