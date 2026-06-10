import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  IconSettings,
  IconChartBar,
  IconAlertCircle,
  IconCircleDashedCheck,
  IconClock,
} from "@tabler/icons-react";

import AuditResults from "@/components/projects/AuditResults";
import ScanProgress from "@/components/projects/ScanProgress";
import BotBlockedNotice from "@/components/projects/BotBlockedNotice";
import StartAuditButton from "@/components/projects/StartAuditButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name || "Project";
  return {
    title: `${projectName} | Audit | RankRiot`,
  };
}

export default async function AuditProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!project || project.project_type !== "audit") {
    notFound();
  }

  // Get the latest audit scan
  const { data: latestScan } = await supabase
    .from("scans")
    .select("*")
    .eq("project_id", projectId)
    .eq("scan_type", "audit")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  const botProtection = latestScan?.summary_stats && typeof latestScan.summary_stats === 'object' && 'bot_protection' in (latestScan.summary_stats as any)
    ? (latestScan.summary_stats as any).bot_protection
    : null;

  // Get audit results if scan is completed
  let auditResults = null;
  if (latestScan && latestScan.status === "completed") {
    const { data } = await supabase
      .from("audit_results")
      .select("*")
      .eq("scan_id", latestScan.id)
      .single();
    auditResults = data;
  }

  // Get scan history
  const { data: scanHistory } = await supabase
    .from("scans")
    .select("id, status, started_at, completed_at, pages_scanned, scan_type")
    .eq("project_id", projectId)
    .eq("scan_type", "audit")
    .order("started_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{project.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
              <IconChartBar className="w-4 h-4 mr-1" />
              Audit
            </span>
          </div>
          <p className="text-[var(--color-text-muted)] mt-1">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-[var(--color-text-secondary)]"
            >
              {project.url}
            </a>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StartAuditButton projectId={projectId} />

          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border-default)] text-sm font-medium rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Scan Progress (polls + auto-reloads on completion) */}
      {latestScan && latestScan.status === "in_progress" && (
        <ScanProgress scanId={latestScan.id} projectId={projectId} />
      )}

      {botProtection?.blocked && (
        <BotBlockedNotice info={botProtection} projectUrl={project.url} />
      )}

      {latestScan && latestScan.status === "failed" && (
        <div className="bg-[var(--color-score-critical-muted)] border border-[var(--color-score-critical)]/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="h-5 w-5 text-[var(--color-score-critical)] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--color-score-critical)]">Audit scan failed</p>
              <p className="text-sm text-[var(--color-score-critical)]/80 mt-0.5">
                There was an error scanning your website. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {auditResults ? (
        <>
          {/* Audit Results */}
          <AuditResults results={auditResults} />

          {/* Scan History */}
          {scanHistory && scanHistory.length > 1 && (
            <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Audit History
                </h3>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="px-6 py-4 hover:bg-[var(--color-surface-hover)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              scan.status === "completed"
                                ? "bg-[var(--color-score-good)]"
                                : scan.status === "in_progress"
                                  ? "bg-[var(--color-score-warning)]"
                                  : "bg-[var(--color-score-critical)]"
                            }`}
                          />
                          <span className="text-sm font-medium text-[var(--color-text-primary)] capitalize">
                            {scan.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {scan.started_at &&
                            new Date(scan.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {scan.pages_scanned || 0} pages scanned
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // No results yet
        <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
          <div className="py-12 px-6 text-center">
            <div className="p-4 bg-[var(--color-surface-overlay)] rounded-full w-fit mx-auto mb-4">
              <IconChartBar className="w-10 h-10 text-[var(--color-text-muted)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No Audit Results Yet</h2>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              Run your first audit scan to get comprehensive insights about your
              website's technology, performance, and quality.
            </p>
            <StartAuditButton projectId={projectId} />

            <div className="mt-8 max-w-2xl mx-auto text-left bg-[var(--color-surface-overlay)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                What you'll get:
              </h3>
              <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-[var(--color-score-good)] flex-shrink-0" />
                  <span>
                    <strong>Overall Quality Score</strong> - Instant assessment
                    from 0-100
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-[var(--color-score-good)] flex-shrink-0" />
                  <span>
                    <strong>Technology Stack Detection</strong> - Framework, CMS,
                    libraries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-[var(--color-score-good)] flex-shrink-0" />
                  <span>
                    <strong>Performance Analysis</strong> - Load times, page
                    sizes, bottlenecks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-[var(--color-score-good)] flex-shrink-0" />
                  <span>
                    <strong>Actionable Recommendations</strong> - Prioritized
                    improvements
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconClock className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>
                    <strong>Fast Results</strong> - Complete in 1-2 minutes
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
