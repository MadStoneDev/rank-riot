import {
  PageWithDepth,
  PageLinkStats,
  InternalLink,
} from "@/types/site-architecture";

// Internal link-graph stats for the sitemap tool (bucket C). This is a raw-data
// view over the pages / page_links tables, not an issue recompute: it counts
// inbound/outbound internal links per page for the graph. The former orphan /
// deep-page / depth-distribution / summary helpers were deleted with the dead
// client-side recompute subsystem (F-D12) — those are now crawler-persisted
// issues (orphan_page, deep_page, weak_internal_linking) read from the issues
// table.

/**
 * Calculate inbound/outbound internal link counts per page.
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

  // Build URL-to-ID map for fallback matching (case-insensitive, trailing slash agnostic)
  const urlToId = new Map<string, string>();
  for (const page of pages) {
    urlToId.set(page.url.toLowerCase().replace(/\/$/, ""), page.id);
  }

  // Count inbound and outbound links
  internalLinks.forEach((link) => {
    // Outbound from source
    const currentOutbound = outboundCounts.get(link.source_page_id) ?? 0;
    outboundCounts.set(link.source_page_id, currentOutbound + 1);

    // Inbound to destination (by page ID or by URL fallback)
    let destId = link.destination_page_id;
    if (!destId && link.destination_url) {
      destId = urlToId.get(link.destination_url.toLowerCase().replace(/\/$/, "")) || null;
    }
    if (destId) {
      const currentInbound = inboundCounts.get(destId) ?? 0;
      inboundCounts.set(destId, currentInbound + 1);
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

export { truncateUrl } from "@/utils/url";
