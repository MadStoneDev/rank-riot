import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import {
  IconLink,
  IconAlertTriangle,
  IconSettings,
  IconFile,
} from "@tabler/icons-react";

import ScanHistory from "@/components/projects/ScanHistory";
import ScanProgress from "@/components/projects/ScanProgress";
import StartScanButton from "@/components/projects/StartScanButton";
import ContentIntelligence from "@/components/projects/ContentIntelligence";
import SiteArchitecture from "@/components/projects/SiteArchitecture";
import TechnicalHealth from "@/components/projects/TechnicalHealth";
import MediaAnalysis from "@/components/projects/MediaAnalysis";
import ExportButton from "@/components/export/ExportButton";

import { Database } from "../../../database.types";
import { PAGES_EXPORT_COLUMNS, ISSUES_EXPORT_COLUMNS } from "@/types/export";
import { DEFAULT_THRESHOLDS, PageWithKeywords } from "@/types/content-intelligence";
import {
  findDuplicates,
  findSimilarContent,
  calculateSummary,
} from "@/utils/content-intelligence";
import { DEFAULT_SITE_ARCHITECTURE_THRESHOLDS } from "@/types/site-architecture";
import {
  calculateDepthDistribution,
  findOrphanPages,
  findDeepPages,
  calculateLinkStats,
  getPagesByLinkCount,
  calculateSiteArchitectureSummary,
} from "@/utils/site-architecture";
import { DEFAULT_TECHNICAL_THRESHOLDS } from "@/types/technical-health";
import {
  buildStatusDistribution,
  findRedirectPages,
  findSlowPages,
  findLargePages,
  findNonIndexablePages,
  calculateTechnicalHealthSummary,
} from "@/utils/technical-health";
import {
  parseImagesFromPages,
  calculateAltTextCoverage,
  findImagesMissingAlt,
  getPagesByImageCount,
  getPagesWithMissingAlt,
  calculateMediaAnalysisSummary,
} from "@/utils/media-analysis";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

// Generate dynamic metadata based on project name
export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Fetch project data
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  // Use project name in title if available, otherwise fallback
  const projectName = project?.name || "Project";

  return {
    title: `${projectName} | RankRiot`,
  };
}

export default async function ProjectDetailPage({
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

  if (!project) {
    notFound();
  }

  // Get project statistics
  const { count: pagesCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { count: issuesCount } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_fixed", false);

  const { count: brokenLinksCount } = await supabase
    .from("page_links")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_broken", true);

  // Get the latest scan
  const { data: latestScan } = await supabase
    .from("scans")
    .select("*")
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Get recent issues
  const { data: recentIssues } = await supabase
    .from("issues")
    .select(
      `
      *,
      pages(url, title)
    `,
    )
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get scan history
  const { data: scanHistory } = await supabase
    .from("scans")
    .select(
      "id, status, started_at, completed_at, pages_scanned, issues_found, links_scanned, project_id",
    )
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(10);

  // Content Intelligence Data
  // Thin content pages (< 300 words)
  const { data: thinContentPages } = await supabase
    .from("pages")
    .select("id, url, title, word_count")
    .eq("project_id", projectId)
    .lt("word_count", DEFAULT_THRESHOLDS.thinContentWords)
    .order("word_count", { ascending: true });

  // Missing meta descriptions
  const { data: missingMetaPages } = await supabase
    .from("pages")
    .select("id, url, title")
    .eq("project_id", projectId)
    .or("meta_description.is.null,meta_description.eq.");

  // Missing titles
  const { data: missingTitlePages } = await supabase
    .from("pages")
    .select("id, url, title")
    .eq("project_id", projectId)
    .or("title.is.null,title.eq.");

  // Get all pages for duplicate detection
  const { data: allPagesForDuplicates } = await supabase
    .from("pages")
    .select("id, url, title, meta_description")
    .eq("project_id", projectId);

  // Get pages with keywords for similar content detection
  const { data: pagesWithKeywords } = await supabase
    .from("pages")
    .select("id, url, title, keywords")
    .eq("project_id", projectId)
    .not("keywords", "is", null);

  // Process duplicate titles and descriptions
  const duplicateTitles = allPagesForDuplicates
    ? findDuplicates(
        allPagesForDuplicates.map((p) => ({
          id: p.id,
          url: p.url,
          title: p.title,
        })),
        (p) => p.title
      )
    : [];

  const duplicateDescriptions = allPagesForDuplicates
    ? findDuplicates(
        allPagesForDuplicates.map((p) => ({
          id: p.id,
          url: p.url,
          title: p.title,
          meta_description: p.meta_description,
        })),
        (p) => (p as any).meta_description
      )
    : [];

  // Find similar content
  const similarContent = pagesWithKeywords
    ? findSimilarContent(pagesWithKeywords as PageWithKeywords[])
    : [];

  // Build content intelligence data
  const contentIntelligenceData = {
    thinContent: thinContentPages || [],
    missingMetaDescriptions: missingMetaPages || [],
    missingTitles: missingTitlePages || [],
    duplicateTitles,
    duplicateDescriptions,
    similarContent,
    summary: { critical: 0, warnings: 0, passed: 0, total: 0 },
  };

  // Calculate summary
  contentIntelligenceData.summary = calculateSummary(contentIntelligenceData);

  // Site Architecture Data
  // Get pages with depth
  const { data: pagesWithDepth } = await supabase
    .from("pages")
    .select("id, url, title, depth")
    .eq("project_id", projectId);

  // Get internal links for orphan/linking analysis
  const { data: internalLinks } = await supabase
    .from("page_links")
    .select("source_page_id, destination_page_id")
    .eq("project_id", projectId)
    .eq("link_type", "internal");

  // Process site architecture data
  const depthDistribution = pagesWithDepth
    ? calculateDepthDistribution(pagesWithDepth)
    : [];

  const orphanPages = pagesWithDepth && internalLinks
    ? findOrphanPages(pagesWithDepth, internalLinks)
    : [];

  const deepPages = pagesWithDepth
    ? findDeepPages(pagesWithDepth, DEFAULT_SITE_ARCHITECTURE_THRESHOLDS.deepPageThreshold)
    : [];

  const linkStats = pagesWithDepth && internalLinks
    ? calculateLinkStats(pagesWithDepth, internalLinks)
    : [];

  const pagesWithMostLinks = getPagesByLinkCount(linkStats, "most", 10);
  const pagesWithFewestLinks = getPagesByLinkCount(linkStats, "fewest", 10);

  // Build site architecture data
  const siteArchitectureData = {
    depthDistribution,
    orphanPages,
    deepPages,
    pagesWithMostLinks,
    pagesWithFewestLinks,
    summary: { totalPages: 0, avgDepth: 0, maxDepth: 0, orphanCount: 0, deepPageCount: 0 },
  };

  // Calculate site architecture summary
  siteArchitectureData.summary = calculateSiteArchitectureSummary(siteArchitectureData);

  // Technical Health Data
  // Get pages with technical data
  const { data: pagesWithTechnical } = await supabase
    .from("pages")
    .select("id, url, title, http_status, redirect_url, is_indexable, has_robots_noindex, canonical_url, load_time_ms, first_byte_time_ms, size_bytes")
    .eq("project_id", projectId);

  // Get broken links with source page info
  const { data: brokenLinksData } = await supabase
    .from("page_links")
    .select("id, destination_url, http_status, anchor_text, source_page_id")
    .eq("project_id", projectId)
    .eq("is_broken", true);

  // Get source page info for broken links
  const brokenLinksWithSource = brokenLinksData
    ? await Promise.all(
        brokenLinksData.map(async (link) => {
          const sourcePage = pagesWithTechnical?.find(p => p.id === link.source_page_id);
          return {
            id: link.id,
            source_page_id: link.source_page_id,
            source_url: sourcePage?.url || "",
            source_title: sourcePage?.title || null,
            destination_url: link.destination_url,
            http_status: link.http_status,
            anchor_text: link.anchor_text,
          };
        })
      )
    : [];

  // Process technical health data
  const statusDistribution = pagesWithTechnical
    ? buildStatusDistribution(pagesWithTechnical)
    : [];

  const redirectPages = pagesWithTechnical
    ? findRedirectPages(pagesWithTechnical)
    : [];

  const slowPages = pagesWithTechnical
    ? findSlowPages(pagesWithTechnical, DEFAULT_TECHNICAL_THRESHOLDS.slowPageMs)
    : [];

  const largePages = pagesWithTechnical
    ? findLargePages(pagesWithTechnical, DEFAULT_TECHNICAL_THRESHOLDS.largePageBytes)
    : [];

  const nonIndexablePages = pagesWithTechnical
    ? findNonIndexablePages(pagesWithTechnical)
    : [];

  // Build technical health data
  const technicalHealthData = {
    statusDistribution,
    redirectPages,
    brokenLinks: brokenLinksWithSource,
    slowPages,
    largePages,
    nonIndexablePages,
    summary: { critical: 0, warnings: 0, passed: 0 },
  };

  // Calculate technical health summary
  technicalHealthData.summary = calculateTechnicalHealthSummary(technicalHealthData);

  // Media Analysis Data
  // Get pages with images
  const { data: pagesWithImagesRaw } = await supabase
    .from("pages")
    .select("id, url, title, images")
    .eq("project_id", projectId)
    .not("images", "is", null);

  // Process media analysis data
  const pagesWithImagesParsed = pagesWithImagesRaw
    ? parseImagesFromPages(pagesWithImagesRaw as any)
    : [];

  const altCoverage = calculateAltTextCoverage(pagesWithImagesParsed);
  const imagesMissingAltList = findImagesMissingAlt(pagesWithImagesParsed);
  const pagesWithMostImages = getPagesByImageCount(pagesWithImagesParsed, 10);
  const pagesWithMissingAlt = getPagesWithMissingAlt(pagesWithImagesParsed);

  // Build media analysis data
  const mediaAnalysisData = {
    totalImages: altCoverage.total,
    imagesWithAlt: altCoverage.withAlt,
    imagesMissingAlt: altCoverage.missing,
    altCoveragePercent: altCoverage.percent,
    pagesWithMostImages,
    imagesMissingAltList,
    pagesWithMissingAlt,
    summary: { critical: 0, warnings: 0, passed: 0 },
  };

  // Calculate media analysis summary
  mediaAnalysisData.summary = calculateMediaAnalysisSummary(mediaAnalysisData);

  // Export Data Preparation
  // Get all pages for export
  const { data: allPagesForExport } = await supabase
    .from("pages")
    .select("url, title, meta_description, word_count, http_status, load_time_ms, depth, is_indexable")
    .eq("project_id", projectId)
    .order("url");

  // Get all issues for export
  const { data: allIssuesForExport } = await supabase
    .from("issues")
    .select(`
      issue_type,
      severity,
      description,
      created_at,
      pages(url)
    `)
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false });

  // Format issues for export
  const formattedIssuesForExport = (allIssuesForExport || []).map((issue: any) => ({
    page_url: issue.pages?.url || "",
    issue_type: issue.issue_type,
    severity: issue.severity,
    description: issue.description,
    created_at: issue.created_at,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
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

        <div className="flex flex-wrap items-center gap-3">
          <StartScanButton projectId={projectId} />

          <ExportButton
            data={allPagesForExport || []}
            columns={PAGES_EXPORT_COLUMNS}
            filename={`${project.name.replace(/\s+/g, "-").toLowerCase()}-pages`}
            label="Export Pages"
          />

          <ExportButton
            data={formattedIssuesForExport}
            columns={ISSUES_EXPORT_COLUMNS}
            filename={`${project.name.replace(/\s+/g, "-").toLowerCase()}-issues`}
            label="Export Issues"
          />

          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {latestScan && latestScan.status === "in_progress" && (
        <ScanProgress scanId={latestScan.id} projectId={projectId} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/projects/${projectId}/pages`}
          className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Pages</p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {pagesCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Total pages scanned
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <IconFile className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Broken Links</p>
              <h2 className={`text-3xl font-bold mt-2 ${
                brokenLinksCount && brokenLinksCount > 0
                  ? "text-red-600"
                  : "text-neutral-900"
              }`}>
                {brokenLinksCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Links returning 404 status
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <IconLink className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Issues</p>
              <h2 className={`text-3xl font-bold mt-2 ${
                issuesCount && issuesCount > 0
                  ? "text-yellow-600"
                  : "text-neutral-900"
              }`}>
                {issuesCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                SEO issues detected
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <IconAlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Intelligence Section */}
      <ContentIntelligence data={contentIntelligenceData} projectId={projectId} />

      {/* Site Architecture Section */}
      <SiteArchitecture data={siteArchitectureData} projectId={projectId} />

      {/* Technical Health Section */}
      <TechnicalHealth data={technicalHealthData} projectId={projectId} />

      {/* Media Analysis Section */}
      <MediaAnalysis data={mediaAnalysisData} projectId={projectId} />

      {/* Scan History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/*<div className="bg-white rounded-lg shadow overflow-hidden">*/}
        {/*  <div className="px-6 py-4 border-b border-neutral-200">*/}
        {/*    <h3 className="text-lg font-medium text-neutral-900">*/}
        {/*      Recent Issues*/}
        {/*    </h3>*/}
        {/*  </div>*/}

        {/*  {recentIssues && recentIssues.length > 0 ? (*/}
        {/*    <div className="divide-y divide-neutral-200">*/}
        {/*      {recentIssues.map((issue: any) => (*/}
        {/*        <div key={issue.id} className="p-4">*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div*/}
        {/*              className={`mt-1 flex-shrink-0 rounded-full p-1 ${*/}
        {/*                issue.severity === "critical"*/}
        {/*                  ? "bg-red-100"*/}
        {/*                  : issue.severity === "high"*/}
        {/*                    ? "bg-orange-100"*/}
        {/*                    : issue.severity === "medium"*/}
        {/*                      ? "bg-yellow-100"*/}
        {/*                      : "bg-blue-100"*/}
        {/*              }`}*/}
        {/*            >*/}
        {/*              <IconAlertTriangle*/}
        {/*                className={`h-4 w-4 ${*/}
        {/*                  issue.severity === "critical"*/}
        {/*                    ? "text-red-600"*/}
        {/*                    : issue.severity === "high"*/}
        {/*                      ? "text-orange-600"*/}
        {/*                      : issue.severity === "medium"*/}
        {/*                        ? "text-yellow-600"*/}
        {/*                        : "text-blue-600"*/}
        {/*                }`}*/}
        {/*              />*/}
        {/*            </div>*/}
        {/*            <div className="ml-3 flex-1">*/}
        {/*              <h4 className="text-sm font-medium text-neutral-900">*/}
        {/*                {issue.issue_type*/}
        {/*                  .replace(/_/g, " ")*/}
        {/*                  .replace(/\b[a-z]/g, (c: string) => c.toUpperCase())}*/}
        {/*              </h4>*/}
        {/*              <p className="mt-1 text-sm text-neutral-500">*/}
        {/*                {issue.description}*/}
        {/*              </p>*/}
        {/*              <p*/}
        {/*                className={`mt-1 flex items-center gap-1 text-xs text-neutral-500`}*/}
        {/*              >*/}
        {/*                Page:{" "}*/}
        {/*                <a*/}
        {/*                  href={issue.pages.url}*/}
        {/*                  target="_blank"*/}
        {/*                  rel="noopener noreferrer"*/}
        {/*                  className="hover:underline truncate inline-block max-w-xs"*/}
        {/*                >*/}
        {/*                  {issue.pages.title || issue.pages.url}*/}
        {/*                </a>*/}
        {/*              </p>*/}
        {/*            </div>*/}
        {/*            <div className="ml-3 flex-shrink-0">*/}
        {/*              <span*/}
        {/*                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${*/}
        {/*                  issue.severity === "critical"*/}
        {/*                    ? "bg-red-100 text-red-800"*/}
        {/*                    : issue.severity === "high"*/}
        {/*                      ? "bg-orange-100 text-orange-800"*/}
        {/*                      : issue.severity === "medium"*/}
        {/*                        ? "bg-yellow-100 text-yellow-800"*/}
        {/*                        : "bg-blue-100 text-blue-800"*/}
        {/*                }`}*/}
        {/*              >*/}
        {/*                {issue.severity}*/}
        {/*              </span>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  ) : (*/}
        {/*    <div className="p-6 text-center">*/}
        {/*      <p className="text-neutral-500">*/}
        {/*        No issues detected in the latest scan.*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  )}*/}

        {/*  {recentIssues && recentIssues.length > 0 && (*/}
        {/*    <div className="px-6 py-4 border-t border-neutral-200">*/}
        {/*      <Link*/}
        {/*        href={`/projects/${projectId}/issues`}*/}
        {/*        className="text-secondary hover:text-secondary text-sm font-medium"*/}
        {/*      >*/}
        {/*        View all issues*/}
        {/*      </Link>*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</div>*/}

        <ScanHistory
          initialScans={(scanHistory as Scan[]) || []}
          projectId={projectId}
        />
      </div>
    </div>
  );
}

