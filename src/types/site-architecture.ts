// Types for the sitemap tool's internal link-graph view (bucket C, a raw-data
// view over the pages / page_links tables — not recomputed issues). The orphan,
// deep-page, depth-distribution and summary types were removed with the dead
// client-side recompute subsystem (F-D12): those are now crawler-persisted
// issues (orphan_page, deep_page, weak_internal_linking) read from the issues
// table, not derived in the frontend.
export interface PageWithDepth {
  id: string;
  url: string;
  title: string | null;
  depth: number | null;
}

export interface PageLinkStats {
  id: string;
  url: string;
  title: string | null;
  inboundCount: number;
  outboundCount: number;
}

export interface InternalLink {
  source_page_id: string;
  destination_page_id: string | null;
  destination_url?: string;
}
