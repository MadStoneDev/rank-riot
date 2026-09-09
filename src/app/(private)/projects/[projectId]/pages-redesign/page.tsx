import "@/components/redesign/tokens.css";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { plexSans, plexMono } from "@/lib/redesign-fonts";
import { ReportTabs } from "@/components/redesign/ReportTabs";
import { getPageScore } from "@/utils/page-score";
import { flagFor, type PageFlag, type FixSeverity } from "@/lib/fixes";
import { PagesV2View, type PageRow } from "./PagesV2View";

const SEV_RANK: Record<FixSeverity, number> = {
  critical: 0,
  warning: 1,
  low: 2,
};

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export default async function PagesRedesignPage({
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

  const { data: pages } = await supabase
    .from("pages")
    .select(
      "id, url, title, page_type, inlink_count, meta_description, h1s, h2s, word_count, canonical_url, has_robots_noindex, is_indexable, http_status, images, open_graph, twitter_card, structured_data",
    )
    .eq("project_id", projectId)
    .like("url", "http%")
    .order("url", { ascending: true });

  const { data: issueRows } = await supabase
    .from("issues")
    .select("page_id, issue_type, severity")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .eq("dismissed", false);

  const flagsByPage = new Map<string, PageFlag[]>();
  for (const r of issueRows ?? []) {
    if (!r.page_id) continue;
    const arr = flagsByPage.get(r.page_id) ?? [];
    arr.push(flagFor(r.issue_type, r.severity));
    flagsByPage.set(r.page_id, arr);
  }

  const rows: PageRow[] = (pages ?? []).map((p: any) => ({
    id: p.id,
    title: p.title || "Untitled page",
    path: pathOf(p.url),
    pageType: p.page_type ?? null,
    score: getPageScore(p),
    inlinks: p.inlink_count ?? 0,
    flags: (flagsByPage.get(p.id) ?? []).sort(
      (a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity],
    ),
  }));

  const exceptionCount = rows.filter((r) => r.flags.length > 0).length;

  return (
    <div
      className={`rr ${plexSans.variable} ${plexMono.variable}`}
      style={{ minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: "0 32px",
            height: 64,
            borderBottom: "1px solid var(--rr-hairline)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{project.name}</div>
            <div
              className="rr-mono"
              style={{ fontSize: 12, color: "var(--rr-text-3)" }}
            >
              {rows.length} pages · {exceptionCount} with exceptions
            </div>
          </div>
          <Link
            href={`/projects/${projectId}`}
            style={{
              height: 34,
              padding: "0 14px",
              border: "1px solid var(--rr-border)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              color: "var(--rr-text)",
            }}
          >
            Classic view
          </Link>
        </div>

        <div style={{ padding: "18px 32px 0" }}>
          <ReportTabs projectId={projectId} />
        </div>

        <PagesV2View rows={rows} />
      </div>
    </div>
  );
}
