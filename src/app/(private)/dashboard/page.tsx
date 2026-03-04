import { Metadata } from "next";
import Link from "next/link";
import { Database } from "../../../../database.types";

export const metadata: Metadata = {
  title: "Dashboard | RankRiot",
  description:
    "View your SEO dashboard with project statistics, recent scans, and issue tracking all in one place.",
};

import {
  IconFolder,
  IconPlus,
  IconClock,
  IconFileSearch,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/server";

import QuickScanInput from "@/components/dashboard/QuickScanInput";
import ProjectHealthGrid from "@/components/dashboard/ProjectHealthGrid";
import NeedsAttentionCard from "@/components/dashboard/NeedsAttentionCard";
import QuickActions from "@/components/dashboard/QuickActions";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { computeHealthScore } from "@/utils/health-score";

type Issue = Database["public"]["Tables"]["issues"]["Row"] & {
  pages?: { url: string; title: string | null };
  projects?: { name: string };
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const projectIds = projects?.map((p) => p.id) || [];

  // Build health data per project
  const projectHealthData = await Promise.all(
    (projects || []).map(async (project) => {
      const [
        { count: pagesCount },
        { count: issuesCount },
        { count: brokenLinksCount },
        { count: totalLinksCount },
        { data: pageData },
        { data: severityCounts },
      ] = await Promise.all([
        supabase
          .from("pages")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id),
        supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .eq("is_fixed", false),
        supabase
          .from("page_links")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .eq("is_broken", true),
        supabase
          .from("page_links")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id),
        supabase
          .from("pages")
          .select("http_status, is_indexable, title, meta_description, word_count, h1s, load_time_ms")
          .eq("project_id", project.id),
        supabase
          .from("issues")
          .select("severity")
          .eq("project_id", project.id)
          .eq("is_fixed", false),
      ]);

      // Compute page-level signals
      const pages = pageData || [];
      const total = pages.length;
      const with200Status = pages.filter((p: any) => p.http_status >= 200 && p.http_status < 300).length;
      const indexable = pages.filter((p: any) => p.is_indexable === true).length;
      const withTitle = pages.filter((p: any) => p.title && p.title.trim().length > 0).length;
      const withMetaDescription = pages.filter((p: any) => p.meta_description && p.meta_description.trim().length > 0).length;
      const withAdequateContent = pages.filter((p: any) => (p.word_count || 0) >= 300).length;
      const withH1 = pages.filter((p: any) => Array.isArray(p.h1s) && p.h1s.length > 0).length;
      const slowPages = pages.filter((p: any) => (p.load_time_ms || 0) > 3000).length;

      // Issue severity breakdown
      const sev = { critical: 0, high: 0, medium: 0, low: 0 };
      (severityCounts || []).forEach((i: any) => {
        const s = i.severity?.toLowerCase();
        if (s in sev) sev[s as keyof typeof sev]++;
      });

      const healthScore = computeHealthScore(
        { total, with200Status, indexable, withTitle, withMetaDescription, withAdequateContent, withH1, slowPages },
        { totalLinks: totalLinksCount || 0, brokenLinks: brokenLinksCount || 0 },
        sev,
      );

      return {
        id: project.id,
        name: project.name,
        url: project.url,
        pagesCount: pagesCount || 0,
        issuesCount: issuesCount || 0,
        brokenLinksCount: brokenLinksCount || 0,
        healthScore,
      };
    }),
  );

  // Get top critical/high issues across all projects
  const { data: criticalIssues } = await supabase
    .from("issues")
    .select(`
      *,
      pages:page_id (url, title),
      projects:project_id (name)
    `)
    .in("project_id", projectIds.length > 0 ? projectIds : ["__none__"])
    .eq("is_fixed", false)
    .in("severity", ["critical", "high"])
    .order("created_at", { ascending: false })
    .limit(8);

  const attentionIssues = (criticalIssues || []).map((issue: Issue) => ({
    id: issue.id,
    severity: issue.severity,
    description: issue.description,
    projectId: issue.project_id,
    projectName: issue.projects?.name || "",
    pageId: issue.page_id,
    pageUrl: issue.pages?.url || "",
  }));

  // Recent scans
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*, projects(name)")
    .in("project_id", projectIds.length > 0 ? projectIds : ["__none__"])
    .order("started_at", { ascending: false })
    .limit(5);

  const showOnboarding = !projects || projects.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Welcome back! Here&apos;s your SEO command centre.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Quick Scan */}
      <QuickScanInput />

      {showOnboarding && <OnboardingFlow />}

      {showOnboarding ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <IconFolder className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            No projects yet
          </h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Enter a URL above or create a new project to start scanning and improving your SEO.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <>
          {/* Project Health Grid */}
          <ProjectHealthGrid projects={projectHealthData} />

          {/* Needs Attention + Recent Scans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeedsAttentionCard issues={attentionIssues} />

            {/* Recent Scans */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Recent Scans
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {recentScans && recentScans.length > 0 ? (
                  recentScans.map((scan: any) => (
                    <div key={scan.id} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-neutral-900 truncate">
                            {scan.projects?.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                                scan.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : scan.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  scan.status === "completed"
                                    ? "bg-green-500"
                                    : scan.status === "in_progress"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                              />
                              {scan.status}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {scan.pages_scanned} pages
                            </span>
                            <span className="text-xs text-neutral-500">
                              {scan.issues_found} issues
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1 ml-4 flex-shrink-0">
                          <IconClock className="w-3 h-3" />
                          {scan.started_at &&
                            format(new Date(scan.started_at), "MMM d")}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <IconFileSearch className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500 font-medium">No scans yet</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      Create a project and start scanning.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
