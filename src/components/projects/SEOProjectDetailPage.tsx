import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import {
  IconLink,
  IconAlertTriangle,
  IconSettings,
  IconFile,
  IconMap,
  IconHeartRateMonitor,
  IconBrain,
  IconNetwork,
  IconPhoto,
  IconBolt,
  IconCode,
} from "@tabler/icons-react";

import ScoreRing from "@/components/ui/ScoreRing";
import { SeverityBadge } from "@/components/ui/Badge";
import CategoryCard from "@/components/ui/CategoryCard";
import StatCard from "@/components/ui/StatCard";

import ScanHistory from "@/components/projects/ScanHistory";
import ScanProgress from "@/components/projects/ScanProgress";
import StartScanButton from "@/components/projects/StartScanButton";
import ContentIntelligence from "@/components/projects/ContentIntelligence";
import SiteArchitecture from "@/components/projects/SiteArchitecture";
import TechnicalHealth from "@/components/projects/TechnicalHealth";
import MediaAnalysis from "@/components/projects/MediaAnalysis";
import HistoricalTrends from "@/components/projects/HistoricalTrends";
import ExportDropdown from "@/components/export/ExportDropdown";
import FloatingExportButton from "@/components/export/FloatingExportButton";
import AeoReadinessSection from "@/components/projects/AeoReadinessSection";
import IssueAdvicePanel from "@/components/issues/IssueAdvicePanel";
import GeoReadinessSection from "@/components/projects/GeoReadinessSection";
import ChecklistView from "@/components/projects/ChecklistView";
import Backlinks, { BacklinksData, BacklinkItem } from "@/components/projects/Backlinks";
import { calculateAggregateAeo, AeoPageInput } from "@/utils/aeo-readiness";
import { sanitizeFilename } from "@/utils/export";
import { ChecklistScanData } from "@/utils/checklist";

import { Database } from "../../../database.types";
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
    .is("deleted_at", null)
    .single();

  if (!project) {
    notFound();
  }

  // Get project statistics (exclude non-HTTP URLs like mailto:, tel:, etc.)
  const { count: pagesCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .like("url", "http%");

  const { count: brokenLinksCount } = await supabase
    .from("page_links")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_broken", true);

  // Get the latest scan (fetched first so we can scope issues to it)
  const { data: latestScan } = await supabase
    .from("scans")
    .select("*")
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Find the latest completed scan to scope issues
  const latestCompletedScanId = latestScan?.status === "completed"
    ? latestScan.id
    : null;

  // Get issues count — scoped to latest completed scan if available
  let issuesCountQuery = supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_fixed", false);
  if (latestCompletedScanId) {
    issuesCountQuery = issuesCountQuery.eq("scan_id", latestCompletedScanId);
  }
  const { count: issuesCount } = await issuesCountQuery;

  // Get recent issues — scoped to latest completed scan if available
  let recentIssuesQuery = supabase
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
    .limit(50);
  if (latestCompletedScanId) {
    recentIssuesQuery = recentIssuesQuery.eq("scan_id", latestCompletedScanId);
  }
  const { data: recentIssues } = await recentIssuesQuery;

  // Get scan history
  const { data: scanHistory } = await supabase
    .from("scans")
    .select(
      "id, status, started_at, completed_at, pages_scanned, issues_found, links_scanned, project_id, summary_stats",
    )
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(10);

  // Content Intelligence Data (all queries exclude non-HTTP URLs like mailto:, tel:, etc.)
  // Thin content pages (< 300 words)
  const { data: thinContentPages } = await supabase
    .from("pages")
    .select("id, url, title, word_count")
    .eq("project_id", projectId)
    .like("url", "http%")
    .lt("word_count", DEFAULT_THRESHOLDS.thinContentWords)
    .order("word_count", { ascending: true });

  // Missing meta descriptions
  const { data: missingMetaPages } = await supabase
    .from("pages")
    .select("id, url, title")
    .eq("project_id", projectId)
    .like("url", "http%")
    .or("meta_description.is.null,meta_description.eq.''");

  // Missing titles
  const { data: missingTitlePages } = await supabase
    .from("pages")
    .select("id, url, title")
    .eq("project_id", projectId)
    .like("url", "http%")
    .or("title.is.null,title.eq.''");

  // Get all pages for duplicate detection
  const { data: allPagesForDuplicates } = await supabase
    .from("pages")
    .select("id, url, title, meta_description")
    .eq("project_id", projectId)
    .like("url", "http%");

  // Get pages with keywords for similar content detection
  const { data: pagesWithKeywords } = await supabase
    .from("pages")
    .select("id, url, title, keywords")
    .eq("project_id", projectId)
    .like("url", "http%")
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
    .eq("project_id", projectId)
    .like("url", "http%");

  // Get internal links for orphan/linking analysis
  const { data: internalLinks } = await supabase
    .from("page_links")
    .select("source_page_id, destination_page_id, destination_url")
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
    .eq("project_id", projectId)
    .like("url", "http%");

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
    .like("url", "http%")
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
  // Get all pages for export (expanded fields for all export types)
  const { data: allPagesForExport } = await supabase
    .from("pages")
    .select(`id, url, title, title_length, meta_description, meta_description_length,
      word_count, http_status, load_time_ms, depth, is_indexable,
      first_byte_time_ms, size_bytes, canonical_url,
      has_robots_noindex, has_robots_nofollow, redirect_url,
      h1s, h2s, h3s, h4s, h5s, h6s,
      images, schema_types, structured_data, open_graph, twitter_card,
      js_count, css_count, content_type,
      has_viewport_meta, has_mixed_content, heading_hierarchy_valid,
      security_headers, redirect_chain`)
    .eq("project_id", projectId)
    .like("url", "http%")
    .order("url");

  // Get all issues for export — scoped to latest completed scan if available
  let allIssuesForExportQuery = supabase
    .from("issues")
    .select(`
      issue_type,
      severity,
      description,
      details,
      created_at,
      is_fixed,
      pages(url)
    `)
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false });
  if (latestCompletedScanId) {
    allIssuesForExportQuery = allIssuesForExportQuery.eq("scan_id", latestCompletedScanId);
  }
  const { data: allIssuesForExport } = await allIssuesForExportQuery;

  // Format issues for export
  const formattedIssuesForExport = (allIssuesForExport || []).map((issue: any) => ({
    page_url: issue.pages?.url || "",
    issue_type: issue.issue_type,
    severity: issue.severity,
    description: issue.description,
    details: issue.details,
    created_at: issue.created_at,
    is_fixed: issue.is_fixed,
  }));

  // Get internal links for export
  const { data: internalLinksForExport } = await supabase
    .from("page_links")
    .select("source_page_id, destination_url, anchor_text, is_followed, http_status")
    .eq("project_id", projectId)
    .eq("link_type", "internal");

  const pagesById = new Map(
    (allPagesForExport || []).map((p: any) => [p.id, p])
  );

  const internalLinksWithSource = (internalLinksForExport || []).map((link: any) => {
    const sourcePage = pagesById.get(link.source_page_id);
    return {
      source_url: sourcePage?.url || "",
      destination_url: link.destination_url,
      anchor_text: link.anchor_text || "",
      is_followed: link.is_followed,
      http_status: link.http_status,
    };
  });

  // Get external links for export
  const { data: externalLinksForExport } = await supabase
    .from("page_links")
    .select("source_page_id, destination_url, anchor_text, is_followed, http_status, rel_attributes")
    .eq("project_id", projectId)
    .eq("link_type", "external");

  const externalLinksWithSource = (externalLinksForExport || []).map((link: any) => {
    const sourcePage = pagesById.get(link.source_page_id);
    return {
      source_url: sourcePage?.url || "",
      destination_url: link.destination_url,
      anchor_text: link.anchor_text || "",
      is_followed: link.is_followed,
      http_status: link.http_status,
      rel_attributes: link.rel_attributes,
    };
  });

  // Flatten images for per-image export
  const flattenedImages = (allPagesForExport || []).flatMap((page: any) =>
    (Array.isArray(page.images) ? page.images : []).map((img: any) => ({
      pageUrl: page.url,
      pageTitle: page.title || "",
      imageSrc: img.src || "",
      alt: img.alt || "",
      hasAlt: !!(img.alt && img.alt.trim()),
    }))
  );

  // Backlinks Data
  const { data: backlinksRaw } = await supabase
    .from("backlinks")
    .select("id, source_url, source_domain, anchor_text, is_followed, page_id, first_seen_at, last_seen_at")
    .eq("project_id", projectId)
    .order("source_domain");

  // Enrich backlinks with target page info
  const backlinksEnriched: BacklinkItem[] = (backlinksRaw || []).map((bl: any) => {
    const targetPage = bl.page_id ? pagesById.get(bl.page_id) : null;
    return {
      id: bl.id,
      source_url: bl.source_url,
      source_domain: bl.source_domain,
      anchor_text: bl.anchor_text,
      is_followed: bl.is_followed,
      page_id: bl.page_id,
      target_page_url: targetPage?.url ?? null,
      target_page_title: targetPage?.title ?? null,
      first_seen_at: bl.first_seen_at,
      last_seen_at: bl.last_seen_at,
    };
  });

  const uniqueBacklinkDomains = new Set(backlinksEnriched.map((bl) => bl.source_domain));
  const backlinksData: BacklinksData = {
    backlinks: backlinksEnriched,
    totalCount: backlinksEnriched.length,
    uniqueDomains: uniqueBacklinkDomains.size,
    followedCount: backlinksEnriched.filter((bl) => bl.is_followed).length,
    nofollowCount: backlinksEnriched.filter((bl) => !bl.is_followed).length,
  };

  // AEO/GEO Readiness
  const aeoPages: AeoPageInput[] = (allPagesForExport || []).map((p: any) => ({
    url: p.url,
    schema_types: p.schema_types,
    structured_data: p.structured_data,
    open_graph: p.open_graph,
    twitter_card: p.twitter_card,
    meta_description: p.meta_description,
    word_count: p.word_count,
    title: p.title,
    h1s: p.h1s,
    h2s: p.h2s,
  }));
  const aeoAggregate = calculateAggregateAeo(aeoPages);

  // Extract site-level data from latest scan for GEO readiness
  const siteLevelData = latestScan?.summary_stats && typeof latestScan.summary_stats === 'object' && 'site_level_data' in (latestScan.summary_stats as any)
    ? (latestScan.summary_stats as any).site_level_data
    : null;

  // Helper to safely flatten schema_types (which may contain arrays due to JSON-LD multi-type)
  const getSchemaTypes = (p: any): string[] =>
    Array.isArray(p.schema_types)
      ? p.schema_types.flatMap((t: any) => Array.isArray(t) ? t : [t]).filter((t: any) => typeof t === 'string')
      : [];

  // Build checklist scan data from all available data
  const allExportPages = allPagesForExport || [];
  const checklistScanData: ChecklistScanData = {
    totalPages: allExportPages.length,
    pagesWithTitle: allExportPages.filter((p: any) => p.title && p.title.trim()).length,
    pagesWithMetaDescription: allExportPages.filter((p: any) => p.meta_description && p.meta_description.trim()).length,
    pagesWithH1: allExportPages.filter((p: any) => Array.isArray(p.h1s) && p.h1s.length > 0).length,
    pagesWithMultipleH1: allExportPages.filter((p: any) => Array.isArray(p.h1s) && p.h1s.length > 1).length,
    pagesWithCanonical: allExportPages.filter((p: any) => p.canonical_url).length,
    pagesWithStructuredData: allExportPages.filter((p: any) => p.structured_data && (Array.isArray(p.structured_data) ? p.structured_data.length > 0 : true)).length,
    pagesWithOpenGraph: allExportPages.filter((p: any) => p.open_graph && Object.keys(p.open_graph).length > 0).length,
    pagesWithTwitterCard: allExportPages.filter((p: any) => p.twitter_card && Object.keys(p.twitter_card).length > 0).length,
    indexablePages: allExportPages.filter((p: any) => p.is_indexable).length,
    thinContentPages: (thinContentPages || []).length,
    brokenLinks: brokenLinksWithSource.length,
    totalLinks: (internalLinksForExport || []).length + (externalLinksForExport || []).length,
    totalImages: altCoverage.total,
    imagesWithAlt: altCoverage.withAlt,
    avgLoadTime: allExportPages.length > 0
      ? allExportPages.reduce((sum: number, p: any) => sum + (p.load_time_ms || 0), 0) / allExportPages.length
      : 0,
    pagesOver3s: (slowPages || []).length,
    pagesWithRobotsNoindex: allExportPages.filter((p: any) => p.has_robots_noindex).length,
    duplicateTitles: duplicateTitles.length,
    duplicateDescriptions: duplicateDescriptions.length,
    orphanPages: orphanPages.length,
    deepPages: deepPages.length,
    hasRobotsTxt: siteLevelData?.robots_txt?.exists ?? false,
    hasSitemap: siteLevelData?.sitemap_validation?.found ?? false,
    sitemapValid: siteLevelData?.sitemap_validation?.valid ?? false,
    sitemapHasLastmod: siteLevelData?.sitemap_validation?.has_lastmod ?? false,
    hasLlmsTxt: siteLevelData?.llms_txt?.exists ?? false,
    aiBotBlocked: siteLevelData?.robots_txt?.ai_bots_blocked?.length ?? 0,
    aiBotCount: (siteLevelData?.robots_txt?.ai_bots_blocked?.length ?? 0) + (siteLevelData?.robots_txt?.ai_bots_allowed?.length ?? 0),
    pagesWithViewportMeta: allExportPages.filter((p: any) => p.has_viewport_meta).length,
    pagesWithMixedContent: allExportPages.filter((p: any) => p.has_mixed_content).length,
    pagesWithValidHeadingHierarchy: allExportPages.filter((p: any) => p.heading_hierarchy_valid).length,
    pagesWithSecurityHeaders: allExportPages.filter((p: any) => p.security_headers && Object.keys(p.security_headers).length > 0).length,
    pagesWithRedirectChains: allExportPages.filter((p: any) => Array.isArray(p.redirect_chain) && p.redirect_chain.length >= 3).length,
    pagesWithFaqSchema: allExportPages.filter((p: any) => getSchemaTypes(p).some(t => t.toLowerCase().includes('faq'))).length,
    pagesWithHowToSchema: allExportPages.filter((p: any) => getSchemaTypes(p).some(t => t.toLowerCase().includes('howto'))).length,
    pagesWithBreadcrumbSchema: allExportPages.filter((p: any) => getSchemaTypes(p).some(t => t.toLowerCase().includes('breadcrumb'))).length,
    pagesWithArticleSchema: allExportPages.filter((p: any) => getSchemaTypes(p).some(t => t.toLowerCase().includes('article'))).length,
    pagesWithOrganizationSchema: allExportPages.filter((p: any) => getSchemaTypes(p).some(t => t.toLowerCase().includes('organization'))).length,
  };

  const exportFilenamePrefix = sanitizeFilename(project.name);

  // Calculate category scores for the overview
  const technicalScore = Math.round(
    100 - (technicalHealthData.summary.critical * 15 + technicalHealthData.summary.warnings * 5)
  );
  const contentScore = Math.round(
    100 - (contentIntelligenceData.summary.critical * 15 + contentIntelligenceData.summary.warnings * 5)
  );
  const mediaScore = Math.round(
    mediaAnalysisData.totalImages > 0 ? mediaAnalysisData.altCoveragePercent : 100
  );
  const aeoScore = aeoAggregate.averagePercent;
  const overallScore = Math.round(
    (Math.max(0, Math.min(100, technicalScore)) +
     Math.max(0, Math.min(100, contentScore)) +
     Math.max(0, Math.min(100, mediaScore)) +
     Math.max(0, Math.min(100, aeoScore))) / 4
  );

  // Build actionable items for category cards
  const technicalItems = [
    ...(technicalHealthData.brokenLinks.length > 0
      ? [{ type: "critical" as const, text: `${technicalHealthData.brokenLinks.length} broken links found`, detail: technicalHealthData.brokenLinks[0]?.destination_url }]
      : []),
    ...(technicalHealthData.nonIndexablePages.length > 0
      ? [{ type: "critical" as const, text: `${technicalHealthData.nonIndexablePages.length} pages not indexable` }]
      : []),
    ...(technicalHealthData.slowPages.length > 0
      ? [{ type: "warning" as const, text: `${technicalHealthData.slowPages.length} slow-loading pages` }]
      : []),
    ...(technicalHealthData.redirectPages.length > 0
      ? [{ type: "warning" as const, text: `${technicalHealthData.redirectPages.length} redirect pages` }]
      : []),
    ...(technicalHealthData.largePages.length > 0
      ? [{ type: "info" as const, text: `${technicalHealthData.largePages.length} oversized pages` }]
      : []),
  ];

  const contentItems = [
    ...(contentIntelligenceData.missingTitles.length > 0
      ? [{ type: "critical" as const, text: `${contentIntelligenceData.missingTitles.length} pages missing titles` }]
      : []),
    ...(contentIntelligenceData.missingMetaDescriptions.length > 0
      ? [{ type: "warning" as const, text: `${contentIntelligenceData.missingMetaDescriptions.length} pages missing meta descriptions` }]
      : []),
    ...(contentIntelligenceData.thinContent.length > 0
      ? [{ type: "warning" as const, text: `${contentIntelligenceData.thinContent.length} thin content pages` }]
      : []),
    ...(contentIntelligenceData.duplicateTitles.length > 0
      ? [{ type: "warning" as const, text: `${contentIntelligenceData.duplicateTitles.length} groups of duplicate titles` }]
      : []),
    ...(contentIntelligenceData.similarContent.length > 0
      ? [{ type: "info" as const, text: `${contentIntelligenceData.similarContent.length} similar content groups` }]
      : []),
  ];

  const architectureItems = [
    ...(siteArchitectureData.orphanPages.length > 0
      ? [{ type: "critical" as const, text: `${siteArchitectureData.orphanPages.length} orphan pages (no inbound links)` }]
      : []),
    ...(siteArchitectureData.deepPages.length > 0
      ? [{ type: "warning" as const, text: `${siteArchitectureData.deepPages.length} pages at depth 4+` }]
      : []),
    ...(siteArchitectureData.summary.totalPages > 0
      ? [{ type: "info" as const, text: `Avg depth: ${siteArchitectureData.summary.avgDepth}, max: ${siteArchitectureData.summary.maxDepth}` }]
      : []),
  ];

  const mediaItems = [
    ...(mediaAnalysisData.imagesMissingAlt > 0
      ? [{ type: "critical" as const, text: `${mediaAnalysisData.imagesMissingAlt} images missing alt text` }]
      : []),
    ...(mediaAnalysisData.totalImages > 0
      ? [{ type: "info" as const, text: `${mediaAnalysisData.totalImages} total images, ${mediaAnalysisData.altCoveragePercent}% coverage` }]
      : []),
  ];

  const aeoItems = [
    ...aeoAggregate.topRecommendations.slice(0, 3).map(rec => ({
      type: (aeoScore < 30 ? "critical" : aeoScore < 60 ? "warning" : "info") as "critical" | "warning" | "info",
      text: rec,
    })),
  ];

  const linkArchitectureScore = Math.max(0, Math.min(100, Math.round(
    100 - (siteArchitectureData.orphanPages.length * 10 + siteArchitectureData.deepPages.length * 3)
  )));

  // Issue severity counts
  const allIssues = recentIssues || [];
  const criticalIssueCount = technicalHealthData.summary.critical + contentIntelligenceData.summary.critical;
  const highIssueCount = technicalHealthData.summary.warnings;
  const warningIssueCount = contentIntelligenceData.summary.warnings;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{project.name}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-[var(--color-text-primary)]"
            >
              {project.url}
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StartScanButton projectId={projectId} />

          <ExportDropdown
            filenamePrefix={exportFilenamePrefix}
            projectName={project.name}
            projectUrl={project.url}
            entries={[
              { dataType: "pages", data: allPagesForExport || [], label: "Page URLs" },
              { dataType: "seo-metadata", data: allPagesForExport || [], label: "SEO Metadata" },
              { dataType: "headings", data: allPagesForExport || [], label: "Headings" },
              { dataType: "schema-data", data: allPagesForExport || [], label: "Schema Data" },
              { dataType: "performance", data: allPagesForExport || [], label: "Performance" },
              { dataType: "images-alt", data: flattenedImages, label: "Images & Alt Text" },
              { dataType: "internal-links", data: internalLinksWithSource, label: "Internal Links" },
              { dataType: "external-links", data: externalLinksWithSource, label: "External Links" },
              { dataType: "broken-links", data: brokenLinksWithSource, label: "Broken Links" },
              { dataType: "issues", data: formattedIssuesForExport, label: "Issues" },
              { dataType: "backlinks", data: backlinksEnriched, label: "Backlinks" },
            ]}
          />

          <Link
            href={`/projects/${projectId}/sitemap`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border-default)] text-sm font-medium rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <IconMap className="h-4 w-4" />
            Site Map
          </Link>

          <Link
            href={`/projects/${projectId}/schema`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border-default)] text-sm font-medium rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Schema
          </Link>

          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border-default)] text-sm font-medium rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {latestScan && latestScan.status === "in_progress" && (
        <ScanProgress scanId={latestScan.id} projectId={projectId} />
      )}

      {/* Score Overview Row */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <ScoreRing score={Math.max(0, Math.min(100, overallScore))} size="xl" label="Overall" />
            <div className="flex gap-6">
              <ScoreRing score={Math.max(0, Math.min(100, technicalScore))} size="md" label="Technical" />
              <ScoreRing score={Math.max(0, Math.min(100, contentScore))} size="md" label="Content" />
              <ScoreRing score={Math.max(0, Math.min(100, aeoScore))} size="md" label="AEO/GEO" />
            </div>
          </div>

          {/* Quick Issues Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity="critical" count={criticalIssueCount} />
            <SeverityBadge severity="high" count={highIssueCount} />
            <SeverityBadge severity="medium" count={warningIssueCount} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={`/projects/${projectId}/pages`} className="block">
          <StatCard
            label="Pages Scanned"
            value={pagesCount || 0}
            icon={<IconFile className="w-5 h-5 text-[var(--color-primary)]" />}
          />
        </Link>

        <StatCard
          label="Broken Links"
          value={brokenLinksCount || 0}
          icon={<IconLink className="w-5 h-5 text-[var(--color-severity-critical)]" />}
        />

        <StatCard
          label="SEO Issues"
          value={issuesCount || 0}
          icon={<IconAlertTriangle className="w-5 h-5 text-[var(--color-score-warning)]" />}
        />
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryCard
          title="Technical Health"
          icon={<IconHeartRateMonitor className="w-5 h-5" />}
          score={Math.max(0, Math.min(100, technicalScore))}
          items={technicalItems}
        />
        <CategoryCard
          title="Content Quality"
          icon={<IconBrain className="w-5 h-5" />}
          score={Math.max(0, Math.min(100, contentScore))}
          items={contentItems}
        />
        <CategoryCard
          title="Links & Architecture"
          icon={<IconNetwork className="w-5 h-5" />}
          score={linkArchitectureScore}
          items={architectureItems}
        />
        <CategoryCard
          title="Media & Accessibility"
          icon={<IconPhoto className="w-5 h-5" />}
          score={Math.max(0, Math.min(100, mediaScore))}
          items={mediaItems}
        />
        <CategoryCard
          title="AEO / GEO Readiness"
          icon={<IconBolt className="w-5 h-5" />}
          score={Math.max(0, Math.min(100, aeoScore))}
          items={aeoItems}
        />
        <CategoryCard
          title="Schema & Structured Data"
          icon={<IconCode className="w-5 h-5" />}
          score={Math.max(0, Math.min(100, aeoScore))}
          items={Object.entries(aeoAggregate.signalCoverage).slice(0, 3).map(([name, count]) => ({
            type: "info" as const,
            text: `${name}: ${aeoPages.length > 0 ? Math.round((count / aeoPages.length) * 100) : 0}% coverage`,
          }))}
        />
      </div>

      {/* Issue Advice Panel */}
      {recentIssues && recentIssues.length > 0 && (
        <IssueAdvicePanel
          issues={recentIssues.map((issue: any) => ({
            id: issue.id,
            issue_type: issue.issue_type,
            severity: issue.severity,
            description: issue.description,
            details: issue.details,
            page_url: issue.pages?.url,
            page_title: issue.pages?.title,
          }))}
          title="All Issues"
          maxItems={10}
          projectId={projectId}
        />
      )}

      {/* Content Intelligence Section */}
      <ContentIntelligence data={contentIntelligenceData} projectId={projectId} />

      {/* Site Architecture Section */}
      <SiteArchitecture data={siteArchitectureData} projectId={projectId} />

      {/* Technical Health Section */}
      <TechnicalHealth data={technicalHealthData} projectId={projectId} />

      {/* Media Analysis Section */}
      <MediaAnalysis data={mediaAnalysisData} projectId={projectId}>
        <Link
          href={`/projects/${projectId}/images`}
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
        >
          View All Images &rarr;
        </Link>
      </MediaAnalysis>

      {/* Backlinks Section */}
      <Backlinks data={backlinksData} projectId={projectId} />

      {/* AEO/GEO Readiness Section */}
      {aeoPages.length > 0 && (
        <AeoReadinessSection
          averagePercent={aeoAggregate.averagePercent}
          homepagePercent={aeoAggregate.homepagePercent}
          signalCoverage={aeoAggregate.signalCoverage}
          totalPages={aeoPages.length}
          topRecommendations={aeoAggregate.topRecommendations}
        />
      )}

      {/* GEO Readiness Section */}
      <GeoReadinessSection siteLevelData={siteLevelData} />

      {/* SEO Checklist */}
      <ChecklistView scanData={checklistScanData} />

      {/* Historical Trends Section */}
      <HistoricalTrends projectId={projectId} />

      {/* Scan History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ScanHistory
          initialScans={(scanHistory as Scan[]) || []}
          projectId={projectId}
        />
      </div>

      {/* Floating Export Button */}
      <FloatingExportButton
        filenamePrefix={exportFilenamePrefix}
        projectName={project.name}
        projectUrl={project.url}
        entries={[
          { dataType: "pages", data: allPagesForExport || [], label: "Page URLs" },
          { dataType: "seo-metadata", data: allPagesForExport || [], label: "SEO Metadata" },
          { dataType: "headings", data: allPagesForExport || [], label: "Headings" },
          { dataType: "schema-data", data: allPagesForExport || [], label: "Schema Data" },
          { dataType: "performance", data: allPagesForExport || [], label: "Performance" },
          { dataType: "images-alt", data: flattenedImages, label: "Images & Alt Text" },
          { dataType: "internal-links", data: internalLinksWithSource, label: "Internal Links" },
          { dataType: "external-links", data: externalLinksWithSource, label: "External Links" },
          { dataType: "broken-links", data: brokenLinksWithSource, label: "Broken Links" },
          { dataType: "issues", data: formattedIssuesForExport, label: "Issues" },
        ]}
      />
    </div>
  );
}

