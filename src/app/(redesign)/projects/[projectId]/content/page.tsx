import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { PageRows, type PageRowItem } from "@/components/redesign/PageRows";
import { ReportExport } from "@/components/redesign/ReportExport";
import { flagFor, type PageFlag, type FixSeverity } from "@/lib/fixes";

// Issue types that speak to on-page content quality (as opposed to speed or AEO).
const CONTENT_ISSUE_TYPES = new Set([
  "thin_content",
  "missing_title",
  "empty_page_title",
  "missing_meta_description",
  "missing_h1",
  "multiple_h1",
  "heading_hierarchy_invalid",
  "duplicate_title",
  "duplicate_content",
  "duplicate_meta_description",
  "poor_readability",
  "missing_open_graph",
  "incomplete_open_graph",
]);

const SEV_RANK: Record<FixSeverity, number> = { critical: 0, warning: 1, low: 2 };

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export default async function ContentPage({
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

  const [{ data: pages }, { data: issueRows }] = await Promise.all([
    supabase
      .from("pages")
      .select(
        "id, url, title, word_count, meta_description, h1s, h2s, canonical_url, has_robots_noindex, has_robots_nofollow",
      )
      .eq("project_id", projectId)
      .like("url", "http%"),
    supabase
      .from("issues")
      .select("page_id, issue_type, severity")
      .eq("project_id", projectId)
      .eq("is_fixed", false)
      .eq("dismissed", false),
  ]);

  const contentIssues = (issueRows ?? []).filter(
    (r) => CONTENT_ISSUE_TYPES.has(r.issue_type) && r.page_id,
  );

  const flagsByPage = new Map<string, PageFlag[]>();
  const typeCounts = new Map<string, number>();
  for (const r of contentIssues) {
    const arr = flagsByPage.get(r.page_id!) ?? [];
    arr.push(flagFor(r.issue_type, r.severity));
    flagsByPage.set(r.page_id!, arr);
    typeCounts.set(r.issue_type, (typeCounts.get(r.issue_type) ?? 0) + 1);
  }

  const pageById = new Map((pages ?? []).map((p) => [p.id, p]));
  const rows: PageRowItem[] = [];
  for (const [pageId, flags] of flagsByPage) {
    const p = pageById.get(pageId);
    if (!p) continue;
    flags.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
    rows.push({
      id: pageId,
      title: p.title || "Untitled page",
      path: pathOf(p.url),
      meta: `${p.word_count ?? 0} words`,
      flags,
    });
  }
  // Worst pages first (most flags, then critical presence).
  rows.sort((a, b) => b.flags.length - a.flags.length);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ReportHeader
        projectName={project.name}
        meta={`${(pages ?? []).length} pages · ${rows.length} with content issues`}
        projectId={projectId}
        exportSlot={
          <ReportExport
            dataType="seo-metadata"
            data={pages ?? []}
            filenamePrefix={`${project.name}-content`}
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
            label="Thin pages"
            value={typeCounts.get("thin_content") ?? 0}
          />
          <MetricCard
            label="No meta desc"
            value={typeCounts.get("missing_meta_description") ?? 0}
          />
          <MetricCard label="No H1" value={typeCounts.get("missing_h1") ?? 0} />
          <MetricCard
            label="Duplicate titles"
            value={typeCounts.get("duplicate_title") ?? 0}
          />
        </MetricStrip>
      </div>
      <div style={{ padding: "20px 32px 96px" }}>
        <PageRows
          projectId={projectId}
          rows={rows}
          emptyText="No content issues — titles, descriptions and headings look complete."
        />
      </div>
    </div>
  );
}
