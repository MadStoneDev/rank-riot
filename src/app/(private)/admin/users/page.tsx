import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Users | Admin | RankRiot",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role: filterRole } = await searchParams;
  const searchQuery = q?.trim() || "";
  const admin = createAdminClient();

  // Fetch profiles
  let query = admin
    .from("profiles")
    .select(
      "id, email, full_name, role, subscription_tier, subscription_status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`,
    );
  }

  if (filterRole) {
    query = query.eq("role", filterRole);
  }

  const { data: profiles } = await query;

  // Get project counts per user
  const { data: projects } = await admin
    .from("projects")
    .select("id, user_id, name")
    .is("deleted_at", null);

  const projectCountMap = new Map<string, number>();
  const projectsByUser = new Map<string, { id: string; name: string }[]>();
  for (const p of projects || []) {
    projectCountMap.set(p.user_id, (projectCountMap.get(p.user_id) || 0) + 1);
    if (!projectsByUser.has(p.user_id)) projectsByUser.set(p.user_id, []);
    projectsByUser.get(p.user_id)!.push({ id: p.id, name: p.name });
  }

  // Get latest scan per user's projects
  const { data: latestScans } = await admin
    .from("scans")
    .select("project_id, started_at, status")
    .order("started_at", { ascending: false });

  const lastScanByUser = new Map<string, { date: string; status: string }>();
  for (const scan of latestScans || []) {
    const project = (projects || []).find((p) => p.id === scan.project_id);
    if (project && !lastScanByUser.has(project.user_id)) {
      lastScanByUser.set(project.user_id, {
        date: scan.started_at,
        status: scan.status,
      });
    }
  }

  // Collect unique roles for the filter tabs
  const knownRoles = ["admin", "moderator", "user"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Users
        </h1>
        <span className="text-sm text-[var(--color-text-muted)]">
          {(profiles || []).length} total
        </span>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <form className="flex gap-2">
          {filterRole && (
            <input type="hidden" name="role" value={filterRole} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search by email or name..."
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>

        {/* Role Filter */}
        <div className="flex gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] self-center mr-1">
            Role:
          </span>
          <Link
            href={
              searchQuery
                ? `/admin/users?q=${encodeURIComponent(searchQuery)}`
                : "/admin/users"
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              !filterRole
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            All
          </Link>
          {knownRoles.map((role) => (
            <Link
              key={role}
              href={
                searchQuery
                  ? `/admin/users?q=${encodeURIComponent(searchQuery)}&role=${role}`
                  : `/admin/users?role=${role}`
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterRole === role
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Projects</th>
                <th className="px-5 py-3 font-medium">Last Scan</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(profiles || []).map((profile) => {
                const projectCount = projectCountMap.get(profile.id) || 0;
                const userProjects = projectsByUser.get(profile.id) || [];
                const lastScan = lastScanByUser.get(profile.id);

                return (
                  <tr
                    key={profile.id}
                    className="hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/users/${profile.id}`}
                        className="hover:underline"
                      >
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {profile.full_name || "No name"}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {profile.email || profile.id.slice(0, 8)}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={profile.role} />
                    </td>
                    <td className="px-5 py-3">
                      <PlanBadge
                        tier={profile.subscription_tier}
                        status={profile.subscription_status}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        <span className="text-[var(--color-text-primary)]">
                          {projectCount}
                        </span>
                        {userProjects.slice(0, 3).map((p) => (
                          <Link
                            key={p.id}
                            href={`/admin/projects/${p.id}`}
                            className="block text-xs text-[var(--color-primary)] hover:underline truncate max-w-[200px]"
                          >
                            {p.name}
                          </Link>
                        ))}
                        {userProjects.length > 3 && (
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            +{userProjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {lastScan ? (
                        <div>
                          <span
                            className={`text-xs ${
                              lastScan.status === "failed"
                                ? "text-[var(--color-score-critical)]"
                                : lastScan.status === "completed"
                                  ? "text-[var(--color-text-secondary)]"
                                  : "text-[var(--color-score-warning)]"
                            }`}
                          >
                            {lastScan.status === "in_progress"
                              ? "Running now"
                              : formatDistanceToNow(new Date(lastScan.date), {
                                  addSuffix: true,
                                })}
                          </span>
                          {lastScan.status === "failed" && (
                            <span className="block text-[10px] text-[var(--color-score-critical)]">
                              failed
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Never
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">
                      {profile.created_at
                        ? formatDistanceToNow(new Date(profile.created_at), {
                            addSuffix: true,
                          })
                        : "-"}
                    </td>
                  </tr>
                );
              })}
              {(profiles || []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No users found
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

function RoleBadge({ role }: { role: string | null }) {
  const roleConfig: Record<string, string> = {
    admin:
      "bg-[var(--color-score-critical)]/15 text-[var(--color-score-critical)]",
    moderator:
      "bg-[var(--color-score-warning)]/15 text-[var(--color-score-warning)]",
    user: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
  };
  const color =
    roleConfig[role || "user"] || roleConfig.user;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}>
      {role || "user"}
    </span>
  );
}

function PlanBadge({
  tier,
  status,
}: {
  tier: string | null;
  status: string | null;
}) {
  const tierColors: Record<string, string> = {
    business: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
    pro: "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]",
    starter:
      "bg-[var(--color-score-good)]/15 text-[var(--color-score-good)]",
    free: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
  };

  const color =
    tierColors[tier || "free"] || tierColors.free;

  return (
    <div>
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}
      >
        {tier || "free"}
      </span>
      {status && status !== "active" && (
        <span className="block text-[10px] text-[var(--color-score-warning)] mt-0.5">
          {status}
        </span>
      )}
    </div>
  );
}
