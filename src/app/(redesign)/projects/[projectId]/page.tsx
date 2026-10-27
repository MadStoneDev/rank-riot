import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AuditReport } from "@/components/redesign/AuditReport";
import StartAuditButton from "@/components/projects/StartAuditButton";
import BotBlockedNotice, {
  type BotProtectionInfo,
} from "@/components/projects/BotBlockedNotice";

// The canonical /projects/[id] route, now in the redesign group (F-R08 follow-up).
// SEO projects go to their report (/fixes). Audit projects render their report
// here, inside the redesign chrome, with audit-specific layout (no SEO tabs) —
// the classic (private) dispatcher and AuditProjectDetailPage are retired.
export default async function ProjectPage({
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
    .select("id, name, url, project_type")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!project) notFound();

  // SEO projects live in the multi-section redesign report.
  if (project.project_type !== "audit") {
    redirect(`/projects/${projectId}/fixes`);
  }

  // Latest audit scan + its results.
  const { data: latestScan } = await supabase
    .from("scans")
    .select("id, status, started_at, completed_at, summary_stats")
    .eq("project_id", projectId)
    .eq("scan_type", "audit")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const botProtection =
    ((latestScan?.summary_stats as { bot_protection?: BotProtectionInfo } | null)
      ?.bot_protection) ?? null;

  const { data: results } =
    latestScan && latestScan.status === "completed"
      ? await supabase
          .from("audit_results")
          .select("*")
          .eq("scan_id", latestScan.id)
          .maybeSingle()
      : { data: null };

  const { data: history } = await supabase
    .from("scans")
    .select("id, status, started_at, completed_at, pages_scanned")
    .eq("project_id", projectId)
    .eq("scan_type", "audit")
    .order("started_at", { ascending: false })
    .limit(5);

  const inProgress =
    latestScan?.status === "in_progress" || latestScan?.status === "pending";
  const failed = latestScan?.status === "failed";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "20px 32px 0",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--rr-text)", margin: 0 }}>
              {project.name}
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                padding: "2px 8px",
                borderRadius: 6,
                color: "var(--rr-accent)",
                border: "1px solid var(--rr-accent)",
              }}
            >
              Audit
            </span>
          </div>
          <div className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-3)", marginTop: 4 }}>
            {project.url}
          </div>
        </div>
        <StartAuditButton projectId={projectId} />
      </div>

      <div style={{ padding: "20px 32px 96px", display: "flex", flexDirection: "column", gap: 16 }}>
        {botProtection?.blocked && (
          <BotBlockedNotice info={botProtection} projectUrl={project.url} />
        )}

        {inProgress && (
          <div
            style={{
              border: "1px solid var(--rr-hairline)",
              borderRadius: 12,
              padding: 20,
              fontSize: 14,
              color: "var(--rr-text-2)",
            }}
          >
            An audit is running. This page will show the results when it finishes —
            refresh in a minute.
          </div>
        )}

        {failed && !botProtection?.blocked && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 9,
              border: "1px solid var(--rr-crit)",
              background: "color-mix(in srgb, var(--rr-crit) 8%, transparent)",
            }}
          >
            <div aria-hidden style={{ width: 8, height: 8, marginTop: 6, borderRadius: "50%", background: "var(--rr-crit)", flex: "none" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-crit)" }}>
                Last audit failed
              </div>
              <div style={{ fontSize: 13, color: "var(--rr-text-2)", marginTop: 3 }}>
                The most recent audit didn&apos;t complete. Run it again, and if it
                keeps failing, check that the site is reachable.
              </div>
            </div>
          </div>
        )}

        {results ? (
          <AuditReport results={results} />
        ) : !inProgress && !failed ? (
          <div
            style={{
              border: "1px solid var(--rr-hairline)",
              borderRadius: 12,
              padding: 32,
              textAlign: "center",
              color: "var(--rr-text-3)",
              fontSize: 14,
            }}
          >
            No audit results yet. Run an audit to see this site&apos;s modernization,
            performance, completeness and standards scores.
          </div>
        ) : null}

        {/* History */}
        {history && history.length > 0 && (
          <div style={{ border: "1px solid var(--rr-hairline)", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--rr-text)", marginBottom: 12 }}>
              Audit history
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 13,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--rr-hairline)",
                  }}
                >
                  <span style={{ color: "var(--rr-text-2)", textTransform: "capitalize" }}>
                    {h.status}
                  </span>
                  <span className="rr-mono" style={{ color: "var(--rr-text-3)" }}>
                    {h.started_at ? new Date(h.started_at).toLocaleString() : "—"}
                    {typeof h.pages_scanned === "number" ? ` · ${h.pages_scanned} pages` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
