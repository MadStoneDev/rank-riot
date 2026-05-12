/**
 * Single source of truth for per-page SEO score calculation.
 * Used by: SEOHealthScore (page detail), PagesListClient (pages table),
 * and any other component that needs a per-page score.
 *
 * Starts at 100 and deducts for issues. Thresholds aligned with the
 * backend issue-detector so the same page shows the same problems everywhere.
 */

export interface PageScoreIssue {
  type: "critical" | "warning" | "passed";
  category: string;
  message: string;
}

export interface PageScoreResult {
  score: number;
  issues: PageScoreIssue[];
}

export interface PageScoreInput {
  url: string;
  title?: string | null;
  meta_description?: string | null;
  h1s?: any[] | null;
  h2s?: any[] | null;
  word_count?: number | null;
  canonical_url?: string | null;
  has_robots_noindex?: boolean | null;
  is_indexable?: boolean | null;
  http_status?: number | null;
  images?: { src: string; alt: string }[] | null;
  open_graph?: Record<string, any> | null;
  twitter_card?: Record<string, any> | null;
  structured_data?: any;
}

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function calculatePageScore(page: PageScoreInput): PageScoreResult {
  const issues: PageScoreIssue[] = [];
  let score = 100;

  // ── Title (max 20 points) ──
  if (!page.title) {
    issues.push({ type: "critical", category: "title", message: "Missing page title" });
    score -= 20;
  } else {
    const len = page.title.length;
    if (len < 30) {
      issues.push({ type: "critical", category: "title", message: `Title is too short (${len} chars, aim for 30-60)` });
      score -= 15;
    } else if (len > 70) {
      issues.push({ type: "warning", category: "title", message: `Title is too long (${len} chars, aim for 30-60)` });
      score -= 5;
    } else if (len >= 50 && len <= 60) {
      issues.push({ type: "passed", category: "title", message: `Title length is optimal (${len} chars)` });
    } else {
      issues.push({ type: "passed", category: "title", message: `Title is present (${len} chars)` });
    }
  }

  // ── Meta Description (max 15 points) ──
  if (!page.meta_description) {
    issues.push({ type: "critical", category: "meta", message: "Missing meta description" });
    score -= 15;
  } else {
    const len = page.meta_description.length;
    if (len < 70) {
      issues.push({ type: "critical", category: "meta", message: `Meta description is too short (${len} chars, aim for 120-155)` });
      score -= 10;
    } else if (len > 165) {
      issues.push({ type: "warning", category: "meta", message: `Meta description is too long (${len} chars, aim for 120-155)` });
      score -= 5;
    } else if (len >= 120 && len <= 155) {
      issues.push({ type: "passed", category: "meta", message: `Meta description length is optimal (${len} chars)` });
    } else {
      issues.push({ type: "passed", category: "meta", message: `Meta description is present (${len} chars)` });
    }
  }

  // ── H1 (max 15 points) ──
  const h1Count = Array.isArray(page.h1s) ? page.h1s.length : 0;
  if (h1Count === 0) {
    issues.push({ type: "critical", category: "headings", message: "Missing H1 heading" });
    score -= 15;
  } else if (h1Count > 1) {
    issues.push({ type: "warning", category: "headings", message: `Multiple H1 headings (${h1Count})` });
    score -= 5;
  } else {
    issues.push({ type: "passed", category: "headings", message: "Single H1 heading present" });
  }

  // ── H2 (max 5 points) ──
  const h2Count = Array.isArray(page.h2s) ? page.h2s.length : 0;
  if (h2Count === 0) {
    issues.push({ type: "warning", category: "headings", message: "No H2 headings found" });
    score -= 5;
  } else {
    issues.push({ type: "passed", category: "headings", message: `${h2Count} H2 heading(s) present` });
  }

  // ── Content Depth (max 10 points) ──
  const wordCount = page.word_count ?? 0;
  if (wordCount < 100) {
    issues.push({ type: "critical", category: "content", message: `Very thin content (${wordCount} words, aim for 300+)` });
    score -= 10;
  } else if (wordCount < 300) {
    issues.push({ type: "warning", category: "content", message: `Thin content (${wordCount} words, aim for 300+)` });
    score -= 5;
  } else {
    issues.push({ type: "passed", category: "content", message: `Content depth adequate (${wordCount} words)` });
  }

  // ── Indexability (max 10 points) ──
  if (page.has_robots_noindex) {
    issues.push({ type: "warning", category: "indexability", message: "Page is set to noindex" });
    score -= 10;
  } else if (page.is_indexable === false) {
    issues.push({ type: "warning", category: "indexability", message: "Page is not indexable" });
    score -= 10;
  } else {
    issues.push({ type: "passed", category: "indexability", message: "Page is indexable" });
  }

  // ── Canonical URL (max 5 points) ──
  if (page.canonical_url) {
    if (normalizeUrl(page.canonical_url) !== normalizeUrl(page.url)) {
      issues.push({ type: "warning", category: "canonical", message: "Canonical URL differs from page URL" });
      score -= 5;
    } else {
      issues.push({ type: "passed", category: "canonical", message: "Canonical URL matches page URL" });
    }
  }

  // ── HTTP Status (max 10 points) ──
  if (page.http_status && page.http_status >= 400) {
    issues.push({ type: "critical", category: "status", message: `HTTP status error (${page.http_status})` });
    score -= 10;
  } else if (page.http_status && page.http_status >= 300) {
    issues.push({ type: "warning", category: "status", message: `Page redirects (${page.http_status})` });
    score -= 5;
  } else if (page.http_status === 200) {
    issues.push({ type: "passed", category: "status", message: "HTTP status OK (200)" });
  }

  // ── Image Alt Text (max 5 points) ──
  const images = Array.isArray(page.images) ? page.images : [];
  const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === "").length;
  if (images.length > 0) {
    if (missingAlt > 0) {
      issues.push({ type: "warning", category: "images", message: `${missingAlt} image(s) missing alt text` });
      score -= Math.min(5, missingAlt);
    } else {
      issues.push({ type: "passed", category: "images", message: "All images have alt text" });
    }
  }

  // ── Open Graph (max 3 points) ──
  if (page.open_graph && Object.keys(page.open_graph).length > 0) {
    issues.push({ type: "passed", category: "social", message: "Open Graph tags present" });
  } else {
    issues.push({ type: "warning", category: "social", message: "Missing Open Graph tags" });
    score -= 3;
  }

  // ── Twitter Card (max 2 points) ──
  if (page.twitter_card && Object.keys(page.twitter_card).length > 0) {
    issues.push({ type: "passed", category: "social", message: "Twitter Card tags present" });
  } else {
    issues.push({ type: "warning", category: "social", message: "Missing Twitter Card tags" });
    score -= 2;
  }

  // ── Structured Data (informational, no deduction) ──
  const hasStructuredData = page.structured_data &&
    (Array.isArray(page.structured_data) ? page.structured_data.length > 0 : Object.keys(page.structured_data).length > 0);
  if (hasStructuredData) {
    issues.push({ type: "passed", category: "schema", message: "Structured data present" });
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Score-only version for contexts that just need the number (e.g., sorting, aggregation).
 */
export function getPageScore(page: PageScoreInput): number {
  return calculatePageScore(page).score;
}
