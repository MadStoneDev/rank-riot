import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDistanceToNow, format } from "date-fns";

export const metadata: Metadata = {
  title: "Scan Detail | Admin | RankRiot",
};

export default async function AdminScanDetailPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  const admin = createAdminClient();

  const { data: scan } = await admin
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single();

  if (!scan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Scan not found
        </h1>
        <Link
          href="/admin/scans"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to scans
        </Link>
      </div>
    );
  }

  const { data: project } = await admin
    .from("projects")
    .select("id, name, url, user_id")
    .eq("id", scan.project_id)
    .single();

  const { data: logs } = await admin
    .from("scan_logs")
    .select("*")
    .eq("scan_id", scanId)
    .order("timestamp", { ascending: true });

  const duration =
    scan.started_at && scan.completed_at
      ? Math.round(
          (new Date(scan.completed_at).getTime() -
            new Date(scan.started_at).getTime()) /
            1000,
        )
      : null;

  const stats =
    scan.summary_stats && typeof scan.summary_stats === "object"
      ? (scan.summary_stats as Record<string, any>)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/scans"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-1 inline-block"
          >
            &larr; Back to scans
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Scan Detail
          </h1>
        </div>
        <StatusBadge status={scan.status} />
      </div>

      {/* Overview Card */}
      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Project</p>
            <Link
              href={`/admin/projects/${scan.project_id}`}
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {project?.name || scan.project_id.slice(0, 8)}
            </Link>
            {project?.url && (
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {project.url}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Type</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {scan.scan_type || "seo"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Started</p>
            <p className="text-sm text-[var(--color-text-primary)]">
              {scan.started_at
                ? format(new Date(scan.started_at), "MMM d, HH:mm:ss")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
            <p className="text-sm text-[var(--color-text-primary)]">
              {duration !== null ? formatDuration(duration) : "In progress..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Pages Scanned</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {scan.pages_scanned || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Links Checked</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {scan.links_scanned || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Issues Found</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {scan.issues_found || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Scan ID</p>
            <p className="text-xs font-mono text-[var(--color-text-muted)] break-all">
              {scanId}
            </p>
          </div>
        </div>

        {stats?.error_message && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--color-score-critical)]/10 border border-[var(--color-score-critical)]/20">
            <p className="text-xs font-medium text-[var(--color-score-critical)]">
              Error: {stats.error_message}
            </p>
          </div>
        )}
      </div>

      {/* Crawl Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Crawl Log
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            {(logs || []).length} entries
          </span>
        </div>

        {!logs || logs.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
            {scan.status === "in_progress"
              ? "Log entries will appear as the scan progresses..."
              : "No log entries recorded for this scan. (Logs are available for scans started after the logging system was added.)"}
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-[var(--color-surface-elevated)]">
                <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                  <th className="px-3 py-2 w-[140px]">Time</th>
                  <th className="px-3 py-2 w-[60px]">Level</th>
                  <th className="px-3 py-2 w-[80px]">Stage</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {logs.map((log: any) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-[var(--color-surface-hover)] ${
                      log.level === "error"
                        ? "bg-[var(--color-score-critical)]/5"
                        : log.level === "warn"
                          ? "bg-[var(--color-score-warning)]/5"
                          : ""
                    }`}
                  >
                    <td className="px-3 py-1.5 text-[var(--color-text-muted)] whitespace-nowrap">
                      {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                    </td>
                    <td className="px-3 py-1.5">
                      <LogLevelBadge level={log.level} />
                    </td>
                    <td className="px-3 py-1.5">
                      <StageBadge stage={log.stage} />
                    </td>
                    <td className="px-3 py-1.5 text-[var(--color-text-primary)]">
                      <span className="break-all">{log.message}</span>
                      {log.metadata && (
                        <details className="mt-1">
                          <summary className="text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-primary)]">
                            metadata
                          </summary>
                          <pre className="mt-1 p-2 rounded bg-[var(--color-surface-elevated)] text-xs overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-[var(--color-score-good)]/10 text-[var(--color-score-good)]",
    failed: "bg-[var(--color-score-critical)]/10 text-[var(--color-score-critical)]",
    in_progress: "bg-[var(--color-score-warning)]/10 text-[var(--color-score-warning)]",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"}`}
    >
      {status === "in_progress" ? "Running" : status}
    </span>
  );
}

function LogLevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    info: "text-[var(--color-primary)]",
    warn: "text-[var(--color-score-warning)]",
    error: "text-[var(--color-score-critical)]",
  };
  return (
    <span className={`font-semibold uppercase ${styles[level] || "text-[var(--color-text-muted)]"}`}>
      {level}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    init: "bg-blue-500/10 text-blue-400",
    sitemap: "bg-purple-500/10 text-purple-400",
    crawl: "bg-emerald-500/10 text-emerald-400",
    store: "bg-amber-500/10 text-amber-400",
    analysis: "bg-indigo-500/10 text-indigo-400",
    complete: "bg-green-500/10 text-green-400",
  };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-xs font-medium ${styles[stage] || "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"}`}
    >
      {stage}
    </span>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
