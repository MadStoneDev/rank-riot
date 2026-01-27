import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  IconSettings,
  IconRefresh,
  IconChartBar,
  IconAlertCircle,
  IconCircleDashedCheck,
  IconClock,
} from "@tabler/icons-react";

import AuditResults from "@/components/projects/AuditResults";
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
            <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <IconChartBar className="w-4 h-4 mr-1" />
              Audit
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-neutral-700"
            >
              {project.url}
            </a>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StartAuditButton projectId={projectId} />

          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Scan Status Banner */}
      {latestScan && latestScan.status === "in_progress" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <IconRefresh className="h-5 w-5 text-yellow-600 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Audit scan in progress...</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Analyzing your website. This usually takes 1-2 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {latestScan && latestScan.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Audit scan failed</p>
              <p className="text-sm text-red-700 mt-0.5">
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
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Audit History
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              scan.status === "completed"
                                ? "bg-green-500"
                                : scan.status === "in_progress"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium text-neutral-900 capitalize">
                            {scan.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          {scan.started_at &&
                            new Date(scan.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600">
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
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="py-12 px-6 text-center">
            <div className="p-4 bg-neutral-100 rounded-full w-fit mx-auto mb-4">
              <IconChartBar className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Audit Results Yet</h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Run your first audit scan to get comprehensive insights about your
              website's technology, performance, and quality.
            </p>
            <StartAuditButton projectId={projectId} />

            <div className="mt-8 max-w-2xl mx-auto text-left bg-neutral-50 rounded-xl p-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                What you'll get:
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Overall Quality Score</strong> - Instant assessment
                    from 0-100
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Technology Stack Detection</strong> - Framework, CMS,
                    libraries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Performance Analysis</strong> - Load times, page
                    sizes, bottlenecks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleDashedCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Actionable Recommendations</strong> - Prioritized
                    improvements
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconClock className="w-5 h-5 text-blue-500 flex-shrink-0" />
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
