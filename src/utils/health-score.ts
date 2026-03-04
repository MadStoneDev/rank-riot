/**
 * Comprehensive project health score (0–100) computed across four dimensions:
 *   - Technical  (25%): HTTP status, indexability, load speed
 *   - Content    (25%): Titles, meta descriptions, word count, H1s
 *   - Links      (25%): Broken-link ratio
 *   - Issues     (25%): Deductions from issue severity counts
 *
 * Each dimension yields 0–100, then they are weighted-averaged.
 * A project with zero scanned pages scores 0 (no data = no health).
 */

export interface HealthInputPages {
  total: number;
  with200Status: number;
  indexable: number;
  withTitle: number;
  withMetaDescription: number;
  withAdequateContent: number; // word_count >= 300
  withH1: number;
  slowPages: number; // load_time_ms > 3000
}

export interface HealthInputLinks {
  totalLinks: number;
  brokenLinks: number;
}

export interface HealthInputIssues {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function computeHealthScore(
  pages: HealthInputPages,
  links: HealthInputLinks,
  issues: HealthInputIssues,
): number {
  if (pages.total === 0) return 0;

  const pct = (n: number) => (n / pages.total) * 100;

  // --- Technical (25%) ---
  // Average of: % with 200 status, % indexable, % not-slow
  const statusScore = pct(pages.with200Status);
  const indexableScore = pct(pages.indexable);
  const speedScore = pct(pages.total - pages.slowPages);
  const technicalScore = (statusScore + indexableScore + speedScore) / 3;

  // --- Content (25%) ---
  // Average of: % with title, % with meta desc, % adequate content, % with H1
  const titleScore = pct(pages.withTitle);
  const metaScore = pct(pages.withMetaDescription);
  const contentScore = pct(pages.withAdequateContent);
  const h1Score = pct(pages.withH1);
  const contentDimension = (titleScore + metaScore + contentScore + h1Score) / 4;

  // --- Links (25%) ---
  // If there are no links tracked yet, give neutral 80 instead of perfect 100
  let linksScore: number;
  if (links.totalLinks === 0) {
    linksScore = 80;
  } else {
    const brokenRatio = links.brokenLinks / links.totalLinks;
    // 0% broken = 100, 10%+ broken = 0 (linear scale)
    linksScore = Math.max(0, 100 - brokenRatio * 1000);
  }

  // --- Issues (25%) ---
  // Deduction from 100, similar to old formula but scaled per-page
  const issueDeduction =
    issues.critical * 10 +
    issues.high * 5 +
    issues.medium * 2 +
    issues.low * 0.5;
  const issuesScore = Math.max(0, 100 - issueDeduction);

  // --- Weighted average ---
  const score =
    technicalScore * 0.25 +
    contentDimension * 0.25 +
    linksScore * 0.25 +
    issuesScore * 0.25;

  return Math.max(0, Math.min(100, Math.round(score)));
}
