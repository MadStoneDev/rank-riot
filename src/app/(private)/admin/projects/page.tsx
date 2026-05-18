import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow, format } from "date-fns";

export const metadata: Metadata = {
  title: "Projects | Admin | RankRiot",
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() || "";
  const admin = createAdminClient();

  // Fetch projects
  let query = admin
    .from("projects")
    .select("id, name, url, user_id, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%`,
    );
  }

  const { data: projects } = await query;

  // Batch-fetch owner profiles
  const userIds = [...new Set((projects || []).map((p) => p.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, email, full_name, subscription_tier")
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  // Batch-fetch page counts per project
  const projectIds = (projects || []).map((p) => p.id);
  const { data: pages } =
    projectIds.length > 0
      ? await admin
          .from("pages")
          .select("id, project_id")
          .in("project_id", projectIds)
      : { data: [] };

  const pageCountMap = new Map<string, number>();
  for (const page of pages || []) {
    pageCountMap.set(
      page.project_id,
      (pageCountMap.get(page.project_id) || 0) + 1,
    );
  }

  // Batch-fetch latest scan per project
  const { data: latestScans } =
    projectIds.length > 0
      ? await admin
          .from("scans")
          .select("project_id, started_at, status")
          .in("project_id", projectIds)
          .order("started_at", { ascending: false })
      : { data: [] };

  const lastScanMap = new Map<
    string,
    { date: string; status: string }
  >();
  for (const scan of latestScans || []) {
    if (!lastScanMap.has(scan.project_id)) {
      lastScanMap.set(scan.project_id, {
        date: scan.started_at,
        status: scan.status,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Projects
        </h1>
        <span className="text-sm text-[var(--color-text-muted)]">
          {(projects || []).length} total
        </span>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search by name or URL..."
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Projects Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-3 font-medium">Project Name</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Pages</th>
                <th className="px-5 py-3 font-medium">Last Scan</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(projects || []).map((project) => {
                const owner = profileMap.get(project.user_id);
                const pageCount = pageCountMap.get(project.id) || 0;
                const lastScan = lastScanMap.get(project.id);

                return (
                  <tr
                    key={project.id}
                    className="hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:underline truncate max-w-[200px] block"
                      >
                        {project.url}
                      </a>
                    </td>
                    <td className="px-5 py-2.5">
                      {owner ? (
                        <Link
                          href={`/admin/users/${project.user_id}`}
                          className="hover:underline"
                        >
                          <p className="text-xs font-medium text-[var(--color-text-primary)]">
                            {owner.full_name || "No name"}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            {owner.email}
                          </p>
                        </Link>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <PlanBadge tier={owner?.subscription_tier} />
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                      {pageCount}
                    </td>
                    <td className="px-5 py-2.5">
                      {lastScan ? (
                        <div>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {lastScan.status === "in_progress"
                              ? "Running now"
                              : formatDistanceToNow(
                                  new Date(lastScan.date),
                                  { addSuffix: true },
                                )}
                          </span>
                          <span className="ml-1.5">
                            <StatusBadge status={lastScan.status} />
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Never
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {project.created_at
                        ? format(new Date(project.created_at), "MMM d, yyyy")
                        : "-"}
                    </td>
                  </tr>
                );
              })}
              {(projects || []).length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No projects found
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

function PlanBadge({ tier }: { tier: string | null | undefined }) {
  const tierColors: Record<string, string> = {
    business: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
    pro: "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]",
    starter: "bg-[var(--color-score-good)]/15 text-[var(--color-score-good)]",
    free: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
  };
  const color = tierColors[tier || "free"] || tierColors.free;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}>
      {tier || "free"}
    </span>
  );
}
