import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { ExportDataType, ExportableData } from "@/types/export";

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
  const { data: brokenRaw } = await supabase
    .from("page_links")
    .select("source_page_id, destination_url, http_status, anchor_text")
    .eq("project_id", projectId)
    .eq("is_broken", true);
  const brokenLinks = (brokenRaw ?? []).map((l) => ({
    source_url: pageUrlById.get(l.source_page_id) ?? "",
    destination_url: l.destination_url,
    http_status: l.http_status,
    anchor_text: l.anchor_text,
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
        return {
          pageUrl: p.url,
          pageTitle: p.title ?? "",
          imageSrc: img.src ?? "",
          alt: img.alt ?? "",
          hasAlt: !!(img.alt && String(img.alt).trim()),
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
