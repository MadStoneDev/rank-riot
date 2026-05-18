import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Users | Admin | RankRiot",
};

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, subscription_tier, subscription_status, created_at, updated_at")
    .order("created_at", { ascending: false });

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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-3 font-medium">User</th>
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
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {profile.full_name || "No name"}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {profile.email || profile.id.slice(0, 8)}
                        </p>
                      </div>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color}`}>
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
