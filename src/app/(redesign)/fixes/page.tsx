import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SeverityDot } from "@/components/redesign/primitives";
import { computeFixes, type FixSeverity } from "@/lib/fixes";

const SEV_RANK: Record<FixSeverity, number> = { critical: 0, warning: 1, low: 2 };

// Global Fixes: every open fix across all of the user's projects, most severe
// first, each linking to that project's report.
export default async function GlobalFixesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const list = projects ?? [];
  const ids = list.map((p) => p.id);
  const nameById = new Map(list.map((p) => [p.id, p.name]));

  const { data: issues } = ids.length
    ? await supabase
        .from("issues")
        .select("project_id, issue_type, severity")
        .in("project_id", ids)
        .eq("is_fixed", false)
        .eq("dismissed", false)
    : { data: [] as { project_id: string; issue_type: string; severity: string }[] };

  const byProject = new Map<string, { issue_type: string; severity: string }[]>();
  for (const it of issues ?? []) {
    const arr = byProject.get(it.project_id) ?? [];
    arr.push({ issue_type: it.issue_type, severity: it.severity });
    byProject.set(it.project_id, arr);
  }

  const rows = [...byProject.entries()]
    .flatMap(([projectId, rs]) =>
      computeFixes(rs).map((fix) => ({ projectId, fix })),
    )
    .sort(
      (a, b) =>
        SEV_RANK[a.fix.severity] - SEV_RANK[b.fix.severity] ||
        b.fix.count - a.fix.count,
    );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          padding: "16px 32px",
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Fixes</h1>
        <span className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-3)" }}>
          {rows.length} across {list.length} {list.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div style={{ padding: "8px 32px 96px" }}>
        {rows.length === 0 ? (
          <div style={{ padding: "48px 0", color: "var(--rr-text-2)", fontSize: 13 }}>
            Nothing to fix across your projects.
          </div>
        ) : (
          rows.map(({ projectId, fix }) => (
            <Link
              key={`${projectId}:${fix.id}`}
              href={`/projects/${projectId}/fixes`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 12px",
                borderBottom: "1px solid var(--rr-hairline)",
                color: "inherit",
                textDecoration: "none",
                flexWrap: "wrap",
              }}
            >
              <SeverityDot severity={fix.severity} />
              <div style={{ flex: "0 1 360px", minWidth: 0, fontSize: 14, fontWeight: 600 }}>
                {fix.title}
              </div>
              <div style={{ flex: "1 1 160px", minWidth: 0, fontSize: 13, color: "var(--rr-text-2)" }}>
                {nameById.get(projectId)}
              </div>
              <div
                className="rr-mono"
                style={{ flex: "none", marginLeft: "auto", fontSize: 12, color: "var(--rr-text-3)" }}
              >
                {fix.effort}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
