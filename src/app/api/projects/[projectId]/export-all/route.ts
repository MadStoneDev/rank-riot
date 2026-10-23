import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { ExportDataType, ExportableData } from "@/types/export";
import { buildDataset, fetchAllPages } from "@/lib/server/export-datasets";

// Assembles every exportable dataset for a project in one call, so the redesign
// can offer a single "Export all" (ZIP of one CSV per dataset). The datasets
// are built by the shared, PAGINATED builder (export-datasets.ts) — the same
// one the single-dataset export route uses — so large projects don't pull a
// whole table in one query (F-P01) and the two stay consistent.
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

  // Fetch the page rows once (paginated) and feed every page-derived dataset.
  const pages = await fetchAllPages(supabase, projectId);

  const types: ExportDataType[] = [
    "issues",
    "pages",
    "seo-metadata",
    "headings",
    "schema-data",
    "performance",
    "technical-health",
    "redirects",
    "images-alt",
    "broken-links",
    "scan-history",
  ];

  const all: { dataType: ExportDataType; data: ExportableData }[] = [];
  for (const dataType of types) {
    const data = await buildDataset(supabase, projectId, dataType, pages);
    all.push({ dataType, data });
  }
  const entries = all.filter((e) => e.data.length > 0);

  return NextResponse.json({ projectName: project.name, entries });
}
