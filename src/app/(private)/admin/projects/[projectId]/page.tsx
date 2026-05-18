import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow, format } from "date-fns";
import {
  IconFile,
  IconLink,
  IconAlertTriangle,
  IconExternalLink,
  IconArrowLeft,
} from "@tabler/icons-react";
import StatCard from "@/components/ui/StatCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  return {
    title: `${project?.name || "Project"} | Admin | RankRiot`,
  };
}

export default async function AdminProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  // Get owner info
  const { data: owner } = await admin
    .from("profiles")
    .select("id, email, full_name, subscription_tier")
    .eq("id", project.user_id)
    .single();

  // Get counts
  const [
    { count: pageCount },
    { count: linkCount },
    { count: issueCount },
    { count: brokenLinkCount },
  ] = await Promise.all([
    admin
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId),
    admin
      .from("page_links")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId),
    admin
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_fixed", false),
    admin
      .from("page_links")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_broken", true),
  ]);

  // Get all scans for this project
  const { data: scans } = await admin
    .from("scans")
    .select(
      "id, scan_type, status, started_at, completed_at, pages_scanned, links_scanned, issues_found, summary_stats",
    )
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(20);

  // Get recent issues with page info
  const { data: recentIssues } = await admin
    .from("issues")
    .select("id, issue_type, severity, description, page_id, created_at")
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get page URLs for issues
  const issuePageIds = [
    ...new Set((recentIssues || []).map((i) => i.page_id).filter(Boolean)),
  ];
  const { data: issuePages } =
    issuePageIds.length > 0
      ? await admin
          .from("pages")
          .select("id, url, title")
          .in("id", issuePageIds)
      : { data: [] };

  const pageMap = new Map((issuePages || []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-3"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {project.name}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
              >
                {project.url}
                <IconExternalLink className="h-3.5 w-3.5" />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Owner</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {owner?.full_name || owner?.email || project.user_id.slice(0, 8)}
            </p>
            {owner?.email && (
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {owner.email}
              </p>
            )}
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Plan</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {owner?.subscription_tier || "free"}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">
              Scan Frequency
            </p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {project.scan_frequency || "manual"}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Created</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {project.created_at
                ? format(new Date(project.created_at), "MMM d, yyyy")
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pages"
          value={pageCount || 0}
          icon={<IconFile className="w-5 h-5 text-[var(--color-primary)]" />}
        />
        <StatCard
          label="Links"
          value={(linkCount || 0).toLocaleString()}
          icon={<IconLink className="w-5 h-5 text-[var(--color-secondary)]" />}
        />
        <StatCard
          label="Open Issues"
          value={issueCount || 0}
          icon={
            <IconAlertTriangle className="w-5 h-5 text-[var(--color-score-warning)]" />
          }
        />
        <StatCard
          label="Broken Links"
          value={brokenLinkCount || 0}
          icon={
            <IconLink className="w-5 h-5 text-[var(--color-score-critical)]" />
          }
        />
      </div>

      {/* Scan History */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-default)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Scan History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Pages</th>
                <th className="px-5 py-2 font-medium">Links</th>
                <th className="px-5 py-2 font-medium">Issues</th>
                <th className="px-5 py-2 font-medium">Started</th>
                <th className="px-5 py-2 font-medium">Duration</th>
                <th className="px-5 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(scans || []).map((scan) => {
                const duration =
                  scan.started_at && scan.completed_at
                    ? Math.round(
                        (new Date(scan.completed_at).getTime() -
                          new Date(scan.started_at).getTime()) /
                          1000,
                      )
                    : null;
                const stats =
                  scan.summary_stats &&
                  typeof scan.summary_stats === "object"
                    ? (scan.summary_stats as Record<string, any>)
                    : null;
                const errorMsg = stats?.error_message || null;

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-2.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                      {scan.pages_scanned || 0}
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                      {scan.links_scanned || 0}
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                      {scan.issues_found || 0}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {scan.started_at
                        ? format(
                            new Date(scan.started_at),
                            "MMM d, HH:mm:ss",
                          )
                        : "-"}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {duration !== null ? formatDuration(duration) : "-"}
                    </td>
                    <td className="px-5 py-2.5">
                      {errorMsg ? (
                        <p
                          className="text-[10px] text-[var(--color-score-critical)] max-w-[300px] break-words"
                          title={errorMsg}
                        >
                          {errorMsg.length > 120
                            ? errorMsg.slice(0, 120) + "..."
                            : errorMsg}
                        </p>
                      ) : stats ? (
                        <div className="text-[10px] text-[var(--color-text-muted)] space-y-0.5">
                          {stats.pages_found != null && (
                            <p>
                              {stats.pages_found} stored, {stats.links_created || 0}{" "}
                              links
                              {stats.pages_removed > 0 &&
                                `, ${stats.pages_removed} cleaned`}
                            </p>
                          )}
                          {stats.overall_score != null && (
                            <p>Audit score: {stats.overall_score}/100</p>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {(scans || []).length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No scans yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Issues */}
      {(recentIssues || []).length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border-default)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Recent Issues ({issueCount || 0} open)
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {(recentIssues || []).map((issue) => {
              const page = issue.page_id
                ? pageMap.get(issue.page_id)
                : null;

              return (
                <div
                  key={issue.id}
                  className="px-5 py-3 flex items-start gap-3"
                >
                  <SeverityDot severity={issue.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {issue.issue_type}
                      </span>
                      {page && (
                        <span
                          className="text-[10px] text-[var(--color-primary)] truncate max-w-[300px]"
                          title={page.url}
                        >
                          {page.url}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                    {issue.created_at
                      ? formatDistanceToNow(new Date(issue.created_at), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: {
      bg: "bg-[var(--color-score-good)]/15",
      text: "text-[var(--color-score-good)]",
      label: "Completed",
    },
    failed: {
      bg: "bg-[var(--color-score-critical)]/15",
      text: "text-[var(--color-score-critical)]",
      label: "Failed",
    },
    in_progress: {
      bg: "bg-[var(--color-score-warning)]/15",
      text: "text-[var(--color-score-warning)]",
      label: "Running",
    },
  };
  const c = config[status] || config.completed;
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-[var(--color-severity-critical)]",
    high: "bg-[var(--color-severity-high)]",
    medium: "bg-[var(--color-severity-medium)]",
    low: "bg-[var(--color-severity-low)]",
  };
  return (
    <span
      className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${colors[severity] || colors.low}`}
    />
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}
