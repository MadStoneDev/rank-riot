import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPageScore } from "@/utils/page-score";
import {
  computeSections,
  type PageForSections,
} from "@/lib/page-detail-sections";

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

// Page-detail sections as JSON, so the Pages tab can open the desktop slide-over
// without a full navigation. Same computation as the full-screen detail route.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; pageId: string }> },
) {
  const { projectId, pageId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ownership check via the project.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: page } = await supabase
    .from("pages")
    .select(
      "id, url, title, meta_description, canonical_url, has_robots_noindex, has_robots_nofollow, is_indexable, http_status, h1s, h2s, h3s, h4s, h5s, h6s, word_count, images, open_graph, twitter_card, structured_data, schema_types, first_byte_time_ms, size_bytes, load_time_ms, inlink_count",
    )
    .eq("id", pageId)
    .eq("project_id", projectId)
    .single();
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: outLinks } = await supabase
    .from("page_links")
    .select("is_broken")
    .eq("project_id", projectId)
    .eq("source_page_id", pageId);

  const outbound = outLinks?.length ?? 0;
  const broken = (outLinks ?? []).filter((l) => l.is_broken === true).length;
  const inbound = page.inlink_count ?? 0;

  const score = getPageScore({
    url: page.url,
    title: page.title,
    meta_description: page.meta_description,
    h1s: page.h1s as unknown[] | null,
    h2s: page.h2s as unknown[] | null,
    word_count: page.word_count,
    canonical_url: page.canonical_url,
    has_robots_noindex: page.has_robots_noindex,
    is_indexable: page.is_indexable,
    http_status: page.http_status,
    images: page.images as { src: string; alt: string }[] | null,
    open_graph: page.open_graph as Record<string, unknown> | null,
    twitter_card: page.twitter_card as Record<string, unknown> | null,
    structured_data: page.structured_data,
  });

  const sections = computeSections(page as PageForSections, {
    inbound,
    outbound,
    broken,
  });

  return NextResponse.json({
    id: page.id,
    title: page.title || "Untitled page",
    url: page.url,
    path: pathOf(page.url),
    score,
    sections,
  });
}
