import { Metadata } from "next";
import Link from "next/link";

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
  IconFiles,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/server";

import QuickScanInput from "@/components/dashboard/QuickScanInput";
import ProjectHealthGrid from "@/components/dashboard/ProjectHealthGrid";
import QuickWinsCard from "@/components/issues/QuickWinsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { computeHealthScore } from "@/utils/health-score";

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
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const projectIds = projects?.map((p) => p.id) || [];
  const safeProjectIds = projectIds.length > 0 ? projectIds : ["__none__"];

  // Bulk-fetch all data across projects in a fixed number of queries
  const [
    { data: allPages },
    { data: allIssues },
    { data: allBrokenLinks },
    { data: allLinks },
    { data: allAuditResults },
    { data: allCompletedScans },
  ] = await Promise.all([
    supabase
      .from("pages")
      .select("project_id, http_status, is_indexable, has_robots_noindex, title, meta_description, word_count, h1s, load_time_ms, canonical_url")
      .in("project_id", safeProjectIds)
      .like("url", "http%"),
    supabase
      .from("issues")
      .select("project_id, severity")
      .in("project_id", safeProjectIds)
      .eq("is_fixed", false),
    supabase
      .from("page_links")
      .select("project_id")
      .in("project_id", safeProjectIds)
      .eq("is_broken", true),
    supabase
      .from("page_links")
      .select("project_id")
      .in("project_id", safeProjectIds),
    supabase
      .from("audit_results")
      .select("project_id, overall_score, created_at")
      .in("project_id", safeProjectIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("scans")
      .select("project_id, summary_stats, completed_at")
      .in("project_id", safeProjectIds)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
  ]);

  // Index data by project_id for O(1) lookups
  const pagesByProject = new Map<string, typeof allPages>();
  (allPages || []).forEach((p: any) => {
    if (!pagesByProject.has(p.project_id)) pagesByProject.set(p.project_id, []);
    pagesByProject.get(p.project_id)!.push(p);
  });

  const issuesByProject = new Map<string, typeof allIssues>();
  (allIssues || []).forEach((i: any) => {
    if (!issuesByProject.has(i.project_id)) issuesByProject.set(i.project_id, []);
    issuesByProject.get(i.project_id)!.push(i);
  });

  const brokenLinkCountByProject = new Map<string, number>();
  (allBrokenLinks || []).forEach((l: any) => {
    brokenLinkCountByProject.set(l.project_id, (brokenLinkCountByProject.get(l.project_id) || 0) + 1);
  });

  const totalLinkCountByProject = new Map<string, number>();
  (allLinks || []).forEach((l: any) => {
    totalLinkCountByProject.set(l.project_id, (totalLinkCountByProject.get(l.project_id) || 0) + 1);
  });

  // Latest audit result per project
  const latestAuditByProject = new Map<string, number>();
  (allAuditResults || []).forEach((ar: any) => {
    if (!latestAuditByProject.has(ar.project_id)) {
      latestAuditByProject.set(ar.project_id, ar.overall_score ?? 0);
    }
  });

  // Canonical SEO score from each project's LATEST completed scan (the same
  // value the project page shows). Only the latest scan is consulted, so a
  // stale older score is never surfaced; projects whose latest scan predates
  // persistence fall back to the live computation below.
  const seenLatestScan = new Set<string>();
  const latestSeoScoreByProject = new Map<string, number>();
  (allCompletedScans || []).forEach((s: any) => {
    if (seenLatestScan.has(s.project_id)) return;
    seenLatestScan.add(s.project_id);
    const seo =
      s.summary_stats && typeof s.summary_stats === "object"
        ? (s.summary_stats as any).seo_score
        : null;
    if (seo && typeof seo.overall === "number") {
      latestSeoScoreByProject.set(s.project_id, seo.overall);
    }
  });

  // Build health data per project using pre-fetched data
  const projectHealthData = (projects || []).map((project) => {
    if (project.project_type === "audit") {
      const pages = pagesByProject.get(project.id) || [];
      return {
        id: project.id,
        name: project.name,
        url: project.url,
        projectType: project.project_type as string,
        pagesCount: pages.length,
        issuesCount: 0,
        brokenLinksCount: 0,
        healthScore: latestAuditByProject.get(project.id) ?? 0,
      };
    }

    const pages = pagesByProject.get(project.id) || [];
    const issues = issuesByProject.get(project.id) || [];
    const brokenLinksCount = brokenLinkCountByProject.get(project.id) || 0;
    const totalLinksCount = totalLinkCountByProject.get(project.id) || 0;

    // Compute page-level signals
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
    issues.forEach((i: any) => {
      const s = i.severity?.toLowerCase();
      if (s in sev) sev[s as keyof typeof sev]++;
    });

    const healthScore =
      latestSeoScoreByProject.get(project.id) ??
      computeHealthScore(
        { total, with200Status, indexable, withTitle, withMetaDescription, withAdequateContent, withH1, slowPages },
        { totalLinks: totalLinksCount, brokenLinks: brokenLinksCount },
        sev,
      );

    return {
      id: project.id,
      name: project.name,
      url: project.url,
      projectType: project.project_type as string,
      pagesCount: total,
      issuesCount: issues.length,
      brokenLinksCount,
      healthScore,
    };
  });

  // Candidate issues for Quick Wins. Pull a generous set across critical/high/
  // medium severities so the card's quick-effort filter has enough to surface
  // (it slices to 5 after filtering).
  const { data: quickWinCandidates } = await supabase
    .from("issues")
    .select(`
      *,
      pages:page_id (url, title),
      projects:project_id (name)
    `)
    .in("project_id", projectIds.length > 0 ? projectIds : ["__none__"])
    .eq("is_fixed", false)
    .in("severity", ["critical", "high", "medium"])
    .order("created_at", { ascending: false })
    .limit(50);

  // Recent scans
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*, projects(name)")
    .in("project_id", projectIds.length > 0 ? projectIds : ["__none__"])
    .order("started_at", { ascending: false })
    .limit(5);

  const showOnboarding = !projects || projects.length === 0;

  // Compute aggregate stats
  const totalProjects = projects?.length || 0;
  const totalPagesCrawled = (allPages || []).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
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
        <div className="glass-card p-12 text-center">
          <IconFolder className="w-16 h-16 mx-auto text-[var(--color-text-muted)] mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            No projects yet
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto text-sm">
            Enter a URL above or create a new project to start scanning and
            improving your SEO.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Projects"
              value={totalProjects}
              icon={
                <IconFolder className="w-4 h-4 text-[var(--color-primary)]" />
              }
            />
            <StatCard
              label="Pages Crawled"
              value={totalPagesCrawled}
              icon={
                <IconFiles className="w-4 h-4 text-[var(--color-primary)]" />
              }
            />
          </div>

          {/* Project Health Grid */}
          <ProjectHealthGrid projects={projectHealthData} />

          {/* Quick Wins */}
          <QuickWinsCard
            issues={(quickWinCandidates || []).map((issue: any) => ({
              id: issue.id,
              issue_type: issue.issue_type,
              severity: issue.severity,
              description: issue.description,
              project_id: issue.project_id,
              project_name: issue.projects?.name || "",
              page_id: issue.page_id,
              page_url: issue.pages?.url || "",
            }))}
          />

          {/* Recent Scans (full width) */}
          <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Recent Scans
                </h3>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {recentScans && recentScans.length > 0 ? (
                  recentScans.map((scan: any) => (
                    <div key={scan.id} className="px-5 py-4">
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {scan.projects?.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant={
                                scan.status === "completed"
                                  ? "good"
                                  : scan.status === "in_progress"
                                    ? "warning"
                                    : "critical"
                              }
                              size="sm"
                            >
                              {scan.status}
                            </Badge>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {scan.pages_scanned} pages
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {scan.issues_found} issues
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 ml-4 flex-shrink-0">
                          <IconClock className="w-3 h-3" />
                          {scan.started_at &&
                            format(new Date(scan.started_at), "MMM d")}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center">
                    <IconFileSearch className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3" />
                    <p className="text-[var(--color-text-secondary)] font-medium text-sm">
                      No scans yet
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Create a project and start scanning.
                    </p>
                  </div>
                )}
              </div>
            </div>
        </>
      )}
    </div>
  );
}
