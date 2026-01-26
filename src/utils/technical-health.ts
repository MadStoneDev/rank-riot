import {
  PageBasicWithStatus,
  StatusDistribution,
  RedirectPage,
  SlowPage,
  LargePage,
  NonIndexablePage,
  TechnicalHealthData,
  DEFAULT_TECHNICAL_THRESHOLDS,
} from "@/types/technical-health";

/**
 * Categorize HTTP status code
 */
export function categorizeHttpStatus(
  status: number | null
): "2xx" | "3xx" | "4xx" | "5xx" {
  if (!status) return "5xx";
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  return "5xx";
}

/**
 * Build status distribution from pages
 */
export function buildStatusDistribution(
  pages: PageBasicWithStatus[]
): StatusDistribution[] {
  const categories: Record<"2xx" | "3xx" | "4xx" | "5xx", PageBasicWithStatus[]> = {
    "2xx": [],
    "3xx": [],
    "4xx": [],
    "5xx": [],
  };

  pages.forEach((page) => {
    const category = categorizeHttpStatus(page.http_status);
    categories[category].push(page);
  });

  return (["2xx", "3xx", "4xx", "5xx"] as const)
    .map((category) => ({
      category,
      count: categories[category].length,
      pages: categories[category].sort((a, b) =>
        (a.http_status ?? 0) - (b.http_status ?? 0)
      ),
    }))
    .filter((d) => d.count > 0);
}

/**
 * Find redirect pages
 */
export function findRedirectPages(
  pages: {
    id: string;
    url: string;
    title: string | null;
    redirect_url: string | null;
    http_status: number | null;
  }[]
): RedirectPage[] {
  return pages
    .filter((page) => page.redirect_url && page.redirect_url.length > 0)
    .map((page) => ({
      id: page.id,
      url: page.url,
      title: page.title,
      redirect_url: page.redirect_url,
      http_status: page.http_status,
    }));
}

/**
 * Find slow pages
 */
export function findSlowPages(
  pages: {
    id: string;
    url: string;
    title: string | null;
    load_time_ms: number | null;
    first_byte_time_ms: number | null;
  }[],
  threshold: number = DEFAULT_TECHNICAL_THRESHOLDS.slowPageMs
): SlowPage[] {
  return pages
    .filter((page) => page.load_time_ms && page.load_time_ms > threshold)
    .sort((a, b) => (b.load_time_ms ?? 0) - (a.load_time_ms ?? 0))
    .map((page) => ({
      id: page.id,
      url: page.url,
      title: page.title,
      load_time_ms: page.load_time_ms,
      first_byte_time_ms: page.first_byte_time_ms,
    }));
}

/**
 * Find large pages
 */
export function findLargePages(
  pages: {
    id: string;
    url: string;
    title: string | null;
    size_bytes: number | null;
  }[],
  threshold: number = DEFAULT_TECHNICAL_THRESHOLDS.largePageBytes
): LargePage[] {
  return pages
    .filter((page) => page.size_bytes && page.size_bytes > threshold)
    .sort((a, b) => (b.size_bytes ?? 0) - (a.size_bytes ?? 0))
    .map((page) => ({
      id: page.id,
      url: page.url,
      title: page.title,
      size_bytes: page.size_bytes,
    }));
}

/**
 * Find non-indexable pages
 */
export function findNonIndexablePages(
  pages: {
    id: string;
    url: string;
    title: string | null;
    is_indexable: boolean | null;
    has_robots_noindex: boolean | null;
    canonical_url: string | null;
  }[]
): NonIndexablePage[] {
  return pages
    .filter(
      (page) =>
        page.is_indexable === false ||
        page.has_robots_noindex === true ||
        (page.canonical_url && page.canonical_url !== page.url)
    )
    .map((page) => {
      let reason: NonIndexablePage["reason"] = "not_indexable";
      if (page.has_robots_noindex) {
        reason = "noindex";
      } else if (page.canonical_url && page.canonical_url !== page.url) {
        reason = "canonical_mismatch";
      }
      return {
        id: page.id,
        url: page.url,
        title: page.title,
        reason,
        canonical_url: page.canonical_url,
      };
    });
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number | null): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Format load time for display
 */
export function formatLoadTime(ms: number | null): string {
  if (!ms) return "0ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Calculate technical health summary
 */
export function calculateTechnicalHealthSummary(
  data: Omit<TechnicalHealthData, "summary">
): TechnicalHealthData["summary"] {
  let critical = 0;
  let warnings = 0;

  // 4xx and 5xx pages are critical
  data.statusDistribution.forEach((dist) => {
    if (dist.category === "4xx" || dist.category === "5xx") {
      critical += dist.count;
    }
  });

  // Broken links are critical
  critical += data.brokenLinks.length;

  // Non-indexable pages (if unintentional) are critical
  // For now we count noindex as warning, not_indexable as critical
  data.nonIndexablePages.forEach((page) => {
    if (page.reason === "not_indexable") {
      critical++;
    } else {
      warnings++;
    }
  });

  // Redirects, slow pages, large pages are warnings
  warnings += data.redirectPages.length;
  warnings += data.slowPages.length;
  warnings += data.largePages.length;

  const passed = Math.max(0, 100 - critical - warnings); // Rough estimate

  return { critical, warnings, passed };
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
