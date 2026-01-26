export interface PageWithDepth {
  id: string;
  url: string;
  title: string | null;
  depth: number | null;
}

export interface DepthDistribution {
  depth: number;
  count: number;
  pages: PageWithDepth[];
}

export interface OrphanPage {
  id: string;
  url: string;
  title: string | null;
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
}

export interface SiteArchitectureData {
  depthDistribution: DepthDistribution[];
  orphanPages: OrphanPage[];
  deepPages: PageWithDepth[];
  pagesWithMostLinks: PageLinkStats[];
  pagesWithFewestLinks: PageLinkStats[];
  summary: {
    totalPages: number;
    avgDepth: number;
    maxDepth: number;
    orphanCount: number;
    deepPageCount: number;
  };
}

export interface SiteArchitectureThresholds {
  deepPageThreshold: number;
  minInternalLinks: number;
}

export const DEFAULT_SITE_ARCHITECTURE_THRESHOLDS: SiteArchitectureThresholds = {
  deepPageThreshold: 4,
  minInternalLinks: 3,
};
