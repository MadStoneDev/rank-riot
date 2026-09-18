import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { ReportHeader } from "@/components/redesign/ReportHeader";
import { MetricCard, MetricStrip } from "@/components/redesign/primitives";
import { PageRows, type PageRowItem } from "@/components/redesign/PageRows";
import { flagFor, type PageFlag, type FixSeverity } from "@/lib/fixes";

// Answer-engine / AI-readiness signals: structured data and lead answers.
const AEO_ISSUE_TYPES = new Set([
  "missing_structured_data",
  "faq_without_schema",
  "missing_answer_block",
  "missing_podcast_schema",
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

function schemaTypesOf(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];
}

export default async function AeoPage({
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
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) notFound();

  const [{ data: pages }, { data: issueRows }] = await Promise.all([
    supabase
      .from("pages")
      .select("id, url, title, schema_types")
      .eq("project_id", projectId)
      .like("url", "http%"),
    supabase
      .from("issues")
      .select("page_id, issue_type, severity")
      .eq("project_id", projectId)
      .eq("is_fixed", false)
      .eq("dismissed", false),
  ]);

  const all = pages ?? [];
  const withSchema = all.filter((p) => schemaTypesOf(p.schema_types).length > 0).length;
  const coverage = all.length > 0 ? Math.round((withSchema / all.length) * 100) : 0;

  const aeoIssues = (issueRows ?? []).filter(
    (r) => AEO_ISSUE_TYPES.has(r.issue_type) && r.page_id,
  );
  const flagsByPage = new Map<string, PageFlag[]>();
  const typeCounts = new Map<string, number>();
  for (const r of aeoIssues) {
    const arr = flagsByPage.get(r.page_id!) ?? [];
    arr.push(flagFor(r.issue_type, r.severity));
    flagsByPage.set(r.page_id!, arr);
    typeCounts.set(r.issue_type, (typeCounts.get(r.issue_type) ?? 0) + 1);
  }

  const pageById = new Map(all.map((p) => [p.id, p]));
  const rows: PageRowItem[] = [];
  for (const [pageId, flags] of flagsByPage) {
    const p = pageById.get(pageId);
    if (!p) continue;
    flags.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
    const types = schemaTypesOf(p.schema_types);
    rows.push({
      id: pageId,
      title: p.title || "Untitled page",
      path: pathOf(p.url),
      meta: types.length > 0 ? types.slice(0, 2).join(", ") : "no schema",
      flags,
    });
  }
  rows.sort((a, b) => b.flags.length - a.flags.length);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ReportHeader
        projectName={project.name}
        meta={`${all.length} pages · ${coverage}% with schema`}
        projectId={projectId}
      />
      <div style={{ padding: "18px 32px 0" }}>
        <ReportTabs projectId={projectId} />
      </div>
      <div style={{ padding: "20px 32px 0" }}>
        <MetricStrip>
          <MetricCard label="Schema coverage" value={`${coverage}%`} />
          <MetricCard
            label="No schema"
            value={typeCounts.get("missing_structured_data") ?? 0}
          />
          <MetricCard
            label="FAQ w/o schema"
            value={typeCounts.get("faq_without_schema") ?? 0}
          />
          <MetricCard
            label="No answer block"
            value={typeCounts.get("missing_answer_block") ?? 0}
          />
        </MetricStrip>
      </div>
      <div style={{ padding: "20px 32px 96px" }}>
        <PageRows
          projectId={projectId}
          rows={rows}
          emptyText="No answer-engine gaps — schema and lead answers look covered."
        />
      </div>
    </div>
  );
}
