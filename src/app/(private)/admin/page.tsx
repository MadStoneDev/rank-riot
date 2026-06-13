import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  IconUsers,
  IconFolder,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import StatCard from "@/components/ui/StatCard";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Admin Overview | RankRiot",
};

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    { count: totalUsers },
    { count: totalProjects },
    { data: activeScans },
    { data: recentScans },
    { count: failedLast24h },
    { count: completedLast24h },
    { count: totalPages },
    { count: totalIssues },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    admin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    admin
      .from("scans")
      .select("id, project_id, status, started_at, pages_scanned")
      .eq("status", "in_progress"),
    admin
      .from("scans")
      .select(
        "id, project_id, scan_type, status, started_at, completed_at, pages_scanned, links_scanned, issues_found, summary_stats",
      )
      .order("started_at", { ascending: false })
      .limit(30),
    admin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("started_at", twentyFourHoursAgo.toISOString()),
    admin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("started_at", twentyFourHoursAgo.toISOString()),
    admin
      .from("pages")
      .select("*", { count: "exact", head: true }),
    admin
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("is_fixed", false),
  ]);

  // Get project info for recent scans
  const projectIds = [
    ...new Set((recentScans || []).map((s) => s.project_id)),
  ];
  const { data: projects } = projectIds.length > 0
    ? await admin
        .from("projects")
        .select("id, name, url, user_id")
        .in("id", projectIds)
    : { data: [] };

  const projectMap = new Map(
    (projects || []).map((p) => [p.id, p]),
  );

  // Get user info for projects
  const userIds = [
    ...new Set((projects || []).map((p) => p.user_id)),
  ];
  const { data: users } = userIds.length > 0
    ? await admin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds)
    : { data: [] };

  const userMap = new Map(
    (users || []).map((u) => [u.id, u]),
  );

  const failureRate =
    (completedLast24h || 0) + (failedLast24h || 0) > 0
      ? Math.round(
          ((failedLast24h || 0) /
            ((completedLast24h || 0) + (failedLast24h || 0))) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        System Overview
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={totalUsers || 0}
          icon={<IconUsers className="w-5 h-5 text-[var(--color-primary)]" />}
        />
        <StatCard
          label="Total Projects"
          value={totalProjects || 0}
          icon={<IconFolder className="w-5 h-5 text-[var(--color-secondary)]" />}
        />
        <StatCard
          label="Active Scans"
          value={(activeScans || []).length}
          icon={
            <IconRefresh className="w-5 h-5 text-[var(--color-score-warning)]" />
          }
        />
        <StatCard
          label="Total Pages Crawled"
          value={(totalPages || 0).toLocaleString()}
          icon={
            <IconClock className="w-5 h-5 text-[var(--color-text-muted)]" />
          }
        />
      </div>

      {/* 24h Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Completed (24h)"
          value={completedLast24h || 0}
          icon={
            <IconCheck className="w-5 h-5 text-[var(--color-score-good)]" />
          }
        />
        <StatCard
          label="Failed (24h)"
          value={failedLast24h || 0}
          icon={
            <IconX className="w-5 h-5 text-[var(--color-score-critical)]" />
          }
        />
        <StatCard
          label="Failure Rate (24h)"
          value={`${failureRate}%`}
          icon={
            <IconAlertTriangle
              className={`w-5 h-5 ${
                failureRate > 20
                  ? "text-[var(--color-score-critical)]"
                  : failureRate > 5
                    ? "text-[var(--color-score-warning)]"
                    : "text-[var(--color-score-good)]"
              }`}
            />
          }
        />
      </div>

      {/* Active Scans */}
      {(activeScans || []).length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border-default)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Active Scans
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {(activeScans || []).map((scan) => {
              const project = projectMap.get(scan.project_id);
              return (
                <div
                  key={scan.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/projects/${scan.project_id}`}
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {project?.name || scan.project_id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {scan.pages_scanned || 0} pages scanned
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconRefresh className="w-4 h-4 animate-spin text-[var(--color-score-warning)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {scan.started_at
                        ? formatDistanceToNow(new Date(scan.started_at), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Recent Scans
          </h2>
          <Link
            href="/admin/scans"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-2 font-medium">Project</th>
                <th className="px-5 py-2 font-medium">User</th>
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Pages</th>
                <th className="px-5 py-2 font-medium">Links</th>
                <th className="px-5 py-2 font-medium">Issues</th>
                <th className="px-5 py-2 font-medium">Started</th>
                <th className="px-5 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(recentScans || []).map((scan) => {
                const project = projectMap.get(scan.project_id);
                const user = project
                  ? userMap.get(project.user_id)
                  : null;
                const duration =
                  scan.started_at && scan.completed_at
                    ? Math.round(
                        (new Date(scan.completed_at).getTime() -
                          new Date(scan.started_at).getTime()) /
                          1000,
                      )
                    : null;
                const errorMsg =
                  scan.status === "failed" &&
                  scan.summary_stats &&
                  typeof scan.summary_stats === "object"
                    ? (scan.summary_stats as any).error_message
                    : null;

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/admin/projects/${scan.project_id}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {project?.name || scan.project_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-text-muted)]">
                      {user?.email || user?.full_name || "-"}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusBadge status={scan.status} />
                      {errorMsg && (
                        <p
                          className="text-xs text-[var(--color-score-critical)] mt-0.5 max-w-[200px] truncate"
                          title={errorMsg}
                        >
                          {errorMsg}
                        </p>
                      )}
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
                        ? formatDistanceToNow(new Date(scan.started_at), {
                            addSuffix: true,
                          })
                        : "-"}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {duration !== null ? formatDuration(duration) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
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
