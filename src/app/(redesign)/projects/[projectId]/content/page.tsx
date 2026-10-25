import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { PageRows, type PageRowItem } from "@/components/redesign/PageRows";
import { ReportExport } from "@/components/redesign/ReportExport";
import { fetchAllProjectPages } from "@/lib/server/project-pages";
import { flagFor, type PageFlag } from "@/lib/fixes";
import { displayGroupFor } from "@/lib/issue-category";
import { SEVERITY_RANK as SEV_RANK } from "@/types/severity";

interface ContentRow {
  id: string;
  url: string;
  title: string | null;
  word_count: number | null;
}

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

  // Pages paginated so every issue's page resolves and the "with content
  // issues" count is complete, not capped at the first 1000 pages (F-P01).
  const [pages, { data: issueRows }] = await Promise.all([
    fetchAllProjectPages<ContentRow>(
      supabase,
      projectId,
      "id, url, title, word_count, meta_description, h1s, h2s, canonical_url, has_robots_noindex, has_robots_nofollow",
    ),
    supabase
      .from("issues")
      .select("page_id, issue_type, severity")
      .eq("project_id", projectId)
      .eq("is_fixed", false)
      .eq("dismissed", false),
  ]);

  const contentIssues = (issueRows ?? []).filter(
    (r) => displayGroupFor(r.issue_type) === "Content" && r.page_id,
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
            projectId={projectId}
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
