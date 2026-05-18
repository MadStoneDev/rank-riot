import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Scan Log | Admin | RankRiot",
};

export default async function AdminScansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("scans")
    .select(
      "id, project_id, scan_type, status, started_at, completed_at, pages_scanned, links_scanned, issues_found, summary_stats",
    )
    .order("started_at", { ascending: false })
    .limit(100);

  if (filterStatus && ["completed", "failed", "in_progress"].includes(filterStatus)) {
    query = query.eq("status", filterStatus);
  }

  const { data: scans } = await query;

  // Get project + user info
  const projectIds = [...new Set((scans || []).map((s) => s.project_id))];
  const { data: projects } =
    projectIds.length > 0
      ? await admin
          .from("projects")
          .select("id, name, url, user_id")
          .in("id", projectIds)
      : { data: [] };

  const projectMap = new Map((projects || []).map((p) => [p.id, p]));

  const userIds = [...new Set((projects || []).map((p) => p.user_id))];
  const { data: users } =
    userIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds)
      : { data: [] };

  const userMap = new Map((users || []).map((u) => [u.id, u]));

  const statusCounts = {
    all: (scans || []).length,
    completed: 0,
    failed: 0,
    in_progress: 0,
  };
  // Count from unfiltered would be better, but this is good enough for the filter tabs
  if (!filterStatus) {
    for (const s of scans || []) {
      if (s.status in statusCounts)
        statusCounts[s.status as keyof typeof statusCounts]++;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Scan Log
        </h1>
        <span className="text-sm text-[var(--color-text-muted)]">
          Last 100 scans
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: undefined, label: "All" },
            { key: "in_progress", label: "Running" },
            { key: "failed", label: "Failed" },
            { key: "completed", label: "Completed" },
          ] as const
        ).map((tab) => (
          <Link
            key={tab.label}
            href={
              tab.key ? `/admin/scans?status=${tab.key}` : "/admin/scans"
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterStatus === tab.key ||
              (!filterStatus && tab.key === undefined)
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Scans Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Pages</th>
                <th className="px-5 py-3 font-medium">Links</th>
                <th className="px-5 py-3 font-medium">Issues</th>
                <th className="px-5 py-3 font-medium">Started</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(scans || []).map((scan) => {
                const project = projectMap.get(scan.project_id);
                const user = project ? userMap.get(project.user_id) : null;
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
                      <Link
                        href={`/admin/projects/${scan.project_id}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {project?.name || scan.project_id.slice(0, 8)}
                      </Link>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[200px]">
                        {project?.url || ""}
                      </p>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {user?.email || "-"}
                    </td>
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
                        ? formatDistanceToNow(new Date(scan.started_at), {
                            addSuffix: true,
                          })
                        : "-"}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {duration !== null ? formatDuration(duration) : "-"}
                    </td>
                    <td className="px-5 py-2.5">
                      {errorMsg ? (
                        <p
                          className="text-[10px] text-[var(--color-score-critical)] max-w-[250px] truncate"
                          title={errorMsg}
                        >
                          {errorMsg}
                        </p>
                      ) : stats?.pages_found ? (
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {stats.pages_found} stored, {stats.links_created || 0} links
                          {stats.pages_removed > 0 &&
                            `, ${stats.pages_removed} removed`}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {(scans || []).length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No scans found
                  </td>
                </tr>
              )}
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
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}
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
