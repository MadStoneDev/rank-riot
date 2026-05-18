import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow, format } from "date-fns";
import { IconArrowLeft, IconUser, IconCreditCard, IconNote } from "@tabler/icons-react";
import RoleManager from "@/components/admin/RoleManager";
import SubscriptionManager from "@/components/admin/SubscriptionManager";
import AdminNotes from "@/components/admin/AdminNotes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single();

  return {
    title: `${profile?.full_name || profile?.email || "User"} | Admin | RankRiot`,
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const admin = createAdminClient();

  // Fetch user profile
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  // Fetch user's projects with page/issue counts
  const { data: projects } = await admin
    .from("projects")
    .select("id, name, url, scan_frequency, last_scan_at, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const projectIds = (projects || []).map((p) => p.id);

  // Fetch page counts and issue counts per project in parallel
  const [pageCounts, issueCounts] = await Promise.all([
    projectIds.length > 0
      ? Promise.all(
          projectIds.map(async (pid) => {
            const { count } = await admin
              .from("pages")
              .select("*", { count: "exact", head: true })
              .eq("project_id", pid);
            return [pid, count || 0] as const;
          }),
        )
      : Promise.resolve([]),
    projectIds.length > 0
      ? Promise.all(
          projectIds.map(async (pid) => {
            const { count } = await admin
              .from("issues")
              .select("*", { count: "exact", head: true })
              .eq("project_id", pid)
              .eq("is_fixed", false);
            return [pid, count || 0] as const;
          }),
        )
      : Promise.resolve([]),
  ]);

  const pageCountMap = new Map(pageCounts);
  const issueCountMap = new Map(issueCounts);

  // Fetch recent scans for the user's projects
  const { data: scans } =
    projectIds.length > 0
      ? await admin
          .from("scans")
          .select(
            "id, project_id, scan_type, status, started_at, completed_at, pages_scanned, links_scanned, issues_found, summary_stats",
          )
          .in("project_id", projectIds)
          .order("started_at", { ascending: false })
          .limit(20)
      : { data: [] };

  // Build project name map for scans table
  const projectNameMap = new Map(
    (projects || []).map((p) => [p.id, p.name]),
  );

  // Fetch admin notes for this user
  const { data: notes } = await admin
    .from("admin_notes")
    .select("id, author_id, content, created_at")
    .eq("target_type", "user")
    .eq("target_id", userId)
    .order("created_at", { ascending: false });

  // Get author emails for notes
  const authorIds = [
    ...new Set((notes || []).map((n) => n.author_id).filter(Boolean)),
  ];
  const { data: authorProfiles } =
    authorIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, email")
          .in("id", authorIds)
      : { data: [] };

  const authorMap = new Map(
    (authorProfiles || []).map((a) => [a.id, a.email]),
  );

  const notesWithAuthors = (notes || []).map((n) => ({
    ...n,
    author_email: authorMap.get(n.author_id) || undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-3"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {profile.full_name || "Unnamed User"}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IconUser className="h-4 w-4 text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Profile Info
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Full Name</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {profile.full_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Email</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5 break-all">
              {profile.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">User ID</p>
            <p className="text-[var(--color-text-secondary)] font-mono text-xs mt-0.5 break-all">
              {profile.id}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-xs">Created</p>
            <p className="text-[var(--color-text-primary)] font-medium mt-0.5">
              {profile.created_at
                ? format(new Date(profile.created_at), "MMM d, yyyy")
                : "-"}
            </p>
            {profile.created_at && (
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {formatDistanceToNow(new Date(profile.created_at), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>
        {profile.updated_at && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
            Last updated{" "}
            {formatDistanceToNow(new Date(profile.updated_at), {
              addSuffix: true,
            })}
          </p>
        )}
      </div>

      {/* Role Management */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Role
        </h2>
        <RoleManager userId={profile.id} currentRole={profile.role || "user"} />
      </div>

      {/* Subscription Card */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IconCreditCard className="h-4 w-4 text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Subscription
          </h2>
        </div>
        <SubscriptionManager
          userId={profile.id}
          currentTier={profile.subscription_tier || "free"}
          currentStatus={profile.subscription_status || "active"}
          paddleCustomerId={profile.paddle_customer_id || null}
          subscriptionPeriodEnd={profile.subscription_period_end || null}
        />
      </div>

      {/* User's Projects */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-default)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Projects ({(projects || []).length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-5 py-2 font-medium">URL</th>
                <th className="px-5 py-2 font-medium">Scan Frequency</th>
                <th className="px-5 py-2 font-medium">Last Scan</th>
                <th className="px-5 py-2 font-medium">Pages</th>
                <th className="px-5 py-2 font-medium">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {(projects || []).map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-[var(--color-surface-hover)]"
                >
                  <td className="px-5 py-2.5">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-[var(--color-primary)] hover:underline font-medium"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5 text-[var(--color-text-secondary)] text-xs truncate max-w-[250px]">
                    {project.url}
                  </td>
                  <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                    {project.scan_frequency || "manual"}
                  </td>
                  <td className="px-5 py-2.5 text-xs text-[var(--color-text-muted)]">
                    {project.last_scan_at
                      ? formatDistanceToNow(new Date(project.last_scan_at), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </td>
                  <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                    {pageCountMap.get(project.id) || 0}
                  </td>
                  <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">
                    {issueCountMap.get(project.id) || 0}
                  </td>
                </tr>
              ))}
              {(projects || []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No projects
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-default)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Recent Scans
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="px-5 py-2 font-medium">Project</th>
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Pages</th>
                <th className="px-5 py-2 font-medium">Links</th>
                <th className="px-5 py-2 font-medium">Issues</th>
                <th className="px-5 py-2 font-medium">Started</th>
                <th className="px-5 py-2 font-medium">Duration</th>
                <th className="px-5 py-2 font-medium">Error</th>
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
                    ? (scan.summary_stats as Record<string, unknown>)
                    : null;
                const errorMsg =
                  (stats?.error_message as string) || null;

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-2.5 text-[var(--color-text-primary)]">
                      {projectNameMap.get(scan.project_id) || scan.project_id.slice(0, 8)}
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
                          className="text-[10px] text-[var(--color-score-critical)] max-w-[200px] break-words"
                          title={errorMsg}
                        >
                          {errorMsg.length > 80
                            ? errorMsg.slice(0, 80) + "..."
                            : errorMsg}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {(scans || []).length === 0 && (
                <tr>
                  <td
                    colSpan={9}
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

      {/* Admin Notes */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IconNote className="h-4 w-4 text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Admin Notes
          </h2>
        </div>
        <AdminNotes
          targetType="user"
          targetId={userId}
          initialNotes={notesWithAuthors}
        />
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
