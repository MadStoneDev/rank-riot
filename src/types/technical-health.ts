export interface PageBasicWithStatus {
  id: string;
  url: string;
  title: string | null;
  http_status: number | null;
}

export interface StatusDistribution {
  category: "2xx" | "3xx" | "4xx" | "5xx";
  count: number;
  pages: PageBasicWithStatus[];
}

export interface RedirectPage {
  id: string;
  url: string;
  title: string | null;
  redirect_url: string | null;
  http_status: number | null;
}

export interface BrokenLink {
  id: string;
  source_page_id: string;
  source_url: string;
  source_title: string | null;
  destination_url: string;
  http_status: number | null;
  anchor_text: string | null;
}

export interface SlowPage {
  id: string;
  url: string;
  title: string | null;
  load_time_ms: number | null;
  first_byte_time_ms: number | null;
}

export interface LargePage {
  id: string;
  url: string;
  title: string | null;
  size_bytes: number | null;
}

export interface NonIndexablePage {
  id: string;
  url: string;
  title: string | null;
  reason: "noindex" | "not_indexable" | "canonical_mismatch";
  canonical_url?: string | null;
}

export interface TechnicalHealthData {
  statusDistribution: StatusDistribution[];
  redirectPages: RedirectPage[];
  brokenLinks: BrokenLink[];
  slowPages: SlowPage[];
  largePages: LargePage[];
  nonIndexablePages: NonIndexablePage[];
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
}

export interface TechnicalHealthThresholds {
  slowPageMs: number;
  largePageBytes: number;
}

export const DEFAULT_TECHNICAL_THRESHOLDS: TechnicalHealthThresholds = {
  slowPageMs: 3000,
  largePageBytes: 2 * 1024 * 1024, // 2MB
};
