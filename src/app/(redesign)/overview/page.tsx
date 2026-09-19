import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { computeFixes, type FixSeverity } from "@/lib/fixes";
import { getPlanLimits, toPlanId } from "@/lib/subscription-limits";
import { startQuickScan, rescanProject } from "../actions";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function shortDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const SEV_RANK: Record<FixSeverity, number> = { critical: 0, warning: 1, low: 2 };

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, url, created_at, project_type")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = projects ?? [];
  const ids = list.map((p) => p.id);

  const [{ data: scans }, { data: issues }, { data: profile }] = await Promise.all([
    ids.length
      ? supabase
          .from("scans")
          .select("project_id, status, completed_at, started_at, summary_stats")
          .in("project_id", ids)
          .order("started_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
    ids.length
      ? supabase
          .from("issues")
          .select("project_id, issue_type, severity")
          .in("project_id", ids)
          .eq("is_fixed", false)
          .eq("dismissed", false)
      : Promise.resolve({ data: [] as never[] }),
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single(),
  ]);

  // Latest completed scan + any-scan-exists, per project.
  const latestCompleted = new Map<string, { completed_at: string | null; summary_stats: unknown }>();
  const everScanned = new Set<string>();
  const scanning = new Set<string>();
  for (const s of scans ?? []) {
    everScanned.add(s.project_id);
    if ((s.status === "in_progress" || s.status === "pending")) scanning.add(s.project_id);
    if (s.status === "completed" && !latestCompleted.has(s.project_id)) {
      latestCompleted.set(s.project_id, {
        completed_at: s.completed_at,
        summary_stats: s.summary_stats,
      });
    }
  }

  // Fixes per project (grouped) → count + worst severity.
  const issuesByProject = new Map<string, { issue_type: string; severity: string }[]>();
  for (const it of issues ?? []) {
    const arr = issuesByProject.get(it.project_id) ?? [];
    arr.push({ issue_type: it.issue_type, severity: it.severity });
    issuesByProject.set(it.project_id, arr);
  }

  const rows = list.map((p) => {
    const fixes = computeFixes(issuesByProject.get(p.id) ?? []);
    const worst = fixes.reduce<FixSeverity | null>(
      (acc, f) => (acc === null || SEV_RANK[f.severity] < SEV_RANK[acc] ? f.severity : acc),
      null,
    );
    const completed = latestCompleted.get(p.id);
    const summary = (completed?.summary_stats ?? {}) as {
      seo_score?: { overall?: number };
    };
    return {
      id: p.id,
      name: p.name,
      host: hostOf(p.url),
      health: summary.seo_score?.overall ?? null,
      openFixes: fixes.length,
      worst,
      lastScanned: completed?.completed_at ?? null,
      hasScanned: everScanned.has(p.id) || latestCompleted.has(p.id),
      scanning: scanning.has(p.id),
      href:
        p.project_type === "audit"
          ? `/projects/${p.id}`
          : `/projects/${p.id}/fixes`,
    };
  });

  const plan = toPlanId(profile?.subscription_tier);
  const maxProjects = getPlanLimits(plan).maxProjects;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header + scan box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          padding: "16px 32px",
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Projects</h1>
          <span className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-3)" }}>
            {list.length} of {maxProjects}
          </span>
        </div>
        <form action={startQuickScan} className="rr-scanbox" style={{ flex: "1 1 320px", maxWidth: 440 }}>
          <input
            name="url"
            type="text"
            required
            placeholder="Enter a URL to scan"
            className="rr-mono"
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 7,
              border: "1px solid var(--rr-border)",
              background: "var(--rr-surface)",
              color: "var(--rr-text)",
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 7,
              background: "var(--rr-accent)",
              color: "var(--rr-accent-ink)",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              flex: "none",
            }}
          >
            Scan
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ padding: "8px 32px 96px" }}>
        {list.length === 0 ? (
          <div style={{ padding: "48px 0", color: "var(--rr-text-2)", fontSize: 13 }}>
            No projects yet. Enter a URL above to run your first scan.
          </div>
        ) : (
          <>
            <div
              className="rr-proj-head rr-mono"
              style={{
                padding: "12px 12px",
                borderBottom: "1px solid var(--rr-hairline-strong)",
                fontSize: 11,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--rr-text-3)",
              }}
            >
              <div className="rr-proj-main">Project</div>
              <div className="rr-proj-health">Health</div>
              <div className="rr-proj-fixes">Open fixes</div>
              <div className="rr-proj-scanned">Last scanned</div>
            </div>

            {rows.map((r) => {
              const main = (
                <div
                  className="rr-proj-main"
                  style={{ display: "flex", alignItems: "baseline", gap: 12 }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    className="rr-mono"
                    style={{
                      fontSize: 12,
                      color: "var(--rr-text-3)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.host}
                  </span>
                  {r.scanning && (
                    <span
                      aria-label="Scanning"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--rr-text-2)",
                        flex: "none",
                      }}
                    />
                  )}
                </div>
              );

              if (!r.hasScanned) {
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "13px 12px",
                      borderBottom: "1px solid var(--rr-hairline)",
                    }}
                  >
                    {main}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
                      <span style={{ fontSize: 13, color: "var(--rr-text-3)" }}>
                        Not scanned yet
                      </span>
                      <form action={rescanProject}>
                        <input type="hidden" name="projectId" value={r.id} />
                        <button
                          type="submit"
                          style={{
                            height: 28,
                            padding: "0 12px",
                            borderRadius: 6,
                            border: "1px solid var(--rr-border-button)",
                            background: "none",
                            color: "var(--rr-text)",
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          Scan
                        </button>
                      </form>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={r.id}
                  href={r.href}
                  className="rr-proj-row"
                  style={{
                    padding: "13px 12px",
                    borderBottom: "1px solid var(--rr-hairline)",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  {main}
                  <div
                    className="rr-proj-health rr-mono"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {r.health ?? "—"}
                  </div>
                  <div
                    className="rr-proj-fixes rr-mono"
                    style={{
                      fontSize: 13,
                      color:
                        r.openFixes === 0
                          ? "var(--rr-text-3)"
                          : r.worst === "critical"
                            ? "var(--rr-crit)"
                            : r.worst === "warning"
                              ? "var(--rr-warn)"
                              : "var(--rr-text-2)",
                    }}
                  >
                    {r.openFixes === 0 ? "—" : r.openFixes}
                  </div>
                  <div
                    className="rr-proj-scanned rr-mono"
                    style={{ fontSize: 12, color: "var(--rr-text-3)" }}
                  >
                    {shortDate(r.lastScanned)}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
