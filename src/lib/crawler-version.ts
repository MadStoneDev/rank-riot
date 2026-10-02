// Mirrors crawl-rank-riot/src/config/versions.ts. Scans stamped with an older
// (or null) crawler_version predate the Oct 2026 parsing fixes (entity
// decoding, alt="", canonical resolution, bot-blocked links) and should be
// rescanned for accurate results (P0.6).
export const CURRENT_CRAWLER_VERSION = "2026.10.03";

/**
 * True when a scan's crawler_version is missing or older than the current
 * release, i.e. its results may contain known false positives. Versions are
 * date strings (YYYY.MM.DD), so a lexicographic compare is also chronological.
 */
export function isStaleScanVersion(
  version: string | null | undefined,
): boolean {
  if (!version) return true;
  return version < CURRENT_CRAWLER_VERSION;
}
