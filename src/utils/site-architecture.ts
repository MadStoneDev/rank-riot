import {
  PageWithDepth,
  DepthDistribution,
  OrphanPage,
  PageLinkStats,
  InternalLink,
  SiteArchitectureData,
  DEFAULT_SITE_ARCHITECTURE_THRESHOLDS,
} from "@/types/site-architecture";

/**
 * Calculate depth distribution from pages
 */
export function calculateDepthDistribution(
  pages: PageWithDepth[]
): DepthDistribution[] {
  const depthMap = new Map<number, PageWithDepth[]>();

  pages.forEach((page) => {
    const depth = page.depth ?? 0;
    if (!depthMap.has(depth)) {
      depthMap.set(depth, []);
    }
    depthMap.get(depth)!.push(page);
  });

  return Array.from(depthMap.entries())
    .map(([depth, pages]) => ({
      depth,
      count: pages.length,
      pages: pages.sort((a, b) => (a.url > b.url ? 1 : -1)),
    }))
    .sort((a, b) => a.depth - b.depth);
}

/**
 * Find orphan pages (pages with no inbound internal links)
 */
export function findOrphanPages(
  pages: PageWithDepth[],
  internalLinks: InternalLink[]
): OrphanPage[] {
  // Get all page IDs that have inbound links
  const pagesWithInboundLinks = new Set(
    internalLinks
      .filter((link) => link.destination_page_id !== null)
      .map((link) => link.destination_page_id)
  );

  // Find pages that don't have any inbound links (excluding homepage at depth 0)
  return pages
    .filter(
      (page) =>
        !pagesWithInboundLinks.has(page.id) && (page.depth ?? 0) > 0
    )
    .map((page) => ({
      id: page.id,
      url: page.url,
      title: page.title,
    }));
}

/**
 * Find deep pages (pages at depth >= threshold)
 */
export function findDeepPages(
  pages: PageWithDepth[],
  threshold: number = DEFAULT_SITE_ARCHITECTURE_THRESHOLDS.deepPageThreshold
): PageWithDepth[] {
  return pages
    .filter((page) => (page.depth ?? 0) >= threshold)
    .sort((a, b) => (b.depth ?? 0) - (a.depth ?? 0));
}

/**
 * Calculate link statistics per page
 */
export function calculateLinkStats(
  pages: PageWithDepth[],
  internalLinks: InternalLink[]
): PageLinkStats[] {
  const inboundCounts = new Map<string, number>();
  const outboundCounts = new Map<string, number>();

  // Initialize all pages with 0 counts
  pages.forEach((page) => {
    inboundCounts.set(page.id, 0);
    outboundCounts.set(page.id, 0);
  });

  // Count inbound and outbound links
  internalLinks.forEach((link) => {
    // Outbound from source
    const currentOutbound = outboundCounts.get(link.source_page_id) ?? 0;
    outboundCounts.set(link.source_page_id, currentOutbound + 1);

    // Inbound to destination
    if (link.destination_page_id) {
      const currentInbound = inboundCounts.get(link.destination_page_id) ?? 0;
      inboundCounts.set(link.destination_page_id, currentInbound + 1);
    }
  });

  return pages.map((page) => ({
    id: page.id,
    url: page.url,
    title: page.title,
    inboundCount: inboundCounts.get(page.id) ?? 0,
    outboundCount: outboundCounts.get(page.id) ?? 0,
  }));
}

/**
 * Get pages sorted by link count (most or fewest)
 */
export function getPagesByLinkCount(
  stats: PageLinkStats[],
  type: "most" | "fewest",
  limit: number = 10
): PageLinkStats[] {
  const sorted = [...stats].sort((a, b) => {
    const totalA = a.inboundCount + a.outboundCount;
    const totalB = b.inboundCount + b.outboundCount;
    return type === "most" ? totalB - totalA : totalA - totalB;
  });

  return sorted.slice(0, limit);
}

/**
 * Calculate site architecture summary
 */
export function calculateSiteArchitectureSummary(
  data: Omit<SiteArchitectureData, "summary">
): SiteArchitectureData["summary"] {
  const totalPages = data.depthDistribution.reduce(
    (sum, d) => sum + d.count,
    0
  );

  const depths = data.depthDistribution.flatMap((d) =>
    Array(d.count).fill(d.depth)
  );

  const avgDepth =
    depths.length > 0
      ? depths.reduce((sum, d) => sum + d, 0) / depths.length
      : 0;

  const maxDepth =
    data.depthDistribution.length > 0
      ? Math.max(...data.depthDistribution.map((d) => d.depth))
      : 0;

  return {
    totalPages,
    avgDepth: Math.round(avgDepth * 10) / 10,
    maxDepth,
    orphanCount: data.orphanPages.length,
    deepPageCount: data.deepPages.length,
  };
}

/**
 * Truncate URL for display
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path.length <= maxLength) return path;
    return path.substring(0, maxLength - 3) + "...";
  } catch {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  }
}
