import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { IconArrowLeft } from "@tabler/icons-react";
import { calculateLinkStats } from "@/utils/site-architecture";
import SiteMapView from "@/components/projects/SiteMapView";

const PAGE_LIMIT = 200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  return { title: `Site Map — ${project?.name || "Project"} | RankRiot` };
}

export default async function SiteMapPage({
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
    .single();

  if (!project) notFound();

  // Fetch pages with depth
  const { data: allPages, count: totalCount } = await supabase
    .from("pages")
    .select("id, url, title, depth", { count: "exact" })
    .eq("project_id", projectId)
    .order("depth", { ascending: true })
    .limit(PAGE_LIMIT);

  // Fetch internal links (only between pages in our set)
  const pageIds = (allPages || []).map((p) => p.id);
  const { data: internalLinks } = await supabase
    .from("page_links")
    .select("source_page_id, destination_page_id")
    .eq("project_id", projectId)
    .eq("link_type", "internal");

  const pages = allPages || [];
  const links = internalLinks || [];

  // Calculate link stats
  const linkStats = calculateLinkStats(
    pages.map((p) => ({ id: p.id, url: p.url, title: p.title, depth: p.depth })),
    links.map((l) => ({
      source_page_id: l.source_page_id,
      destination_page_id: l.destination_page_id,
    })),
  );

  const statsMap = new Map(linkStats.map((s) => [s.id, s]));

  // Build orphan set (pages with 0 inbound, depth > 0)
  const orphanIds = new Set(
    linkStats
      .filter((s) => s.inboundCount === 0 && (pages.find((p) => p.id === s.id)?.depth ?? 0) > 0)
      .map((s) => s.id),
  );

  // Build page nodes
  const pageIdSet = new Set(pageIds);
  const pageNodes = pages.map((p) => ({
    id: p.id,
    url: p.url,
    title: p.title,
    depth: p.depth ?? 0,
    inboundCount: statsMap.get(p.id)?.inboundCount ?? 0,
    outboundCount: statsMap.get(p.id)?.outboundCount ?? 0,
    isOrphan: orphanIds.has(p.id),
  }));

  // Filter edges to only include links where both source and target are in our page set
  const linkEdges = links
    .filter((l) => l.destination_page_id && pageIdSet.has(l.source_page_id) && pageIdSet.has(l.destination_page_id!))
    .map((l) => ({
      source: l.source_page_id,
      target: l.destination_page_id!,
    }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Site Map</h1>
          <p className="text-sm text-neutral-500">
            {project.name} &mdash; Interactive link graph
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <SiteMapView
          pages={pageNodes}
          links={linkEdges}
          totalPageCount={totalCount ?? pages.length}
        />
      </div>
    </div>
  );
}
