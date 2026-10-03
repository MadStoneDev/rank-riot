import { getIssueAdvice } from "@/utils/issue-advice";
import { type Severity, SEVERITY_RANK, normalizeSeverity } from "@/types/severity";

// Frontend fix-grouping layer for the redesigned Scan report. A "fix" is the
// headline unit: a group of issues that share one remedy ("Write meta
// descriptions for 12 posts"), not a raw finding. This is computed read-time
// from the issues table; once the grouping rules settle it can move to the
// crawler. Raw issues live one level down (a fix expands to its pages).

// Severity is the shared canonical scale now (critical > high > medium > low);
// FixSeverity remains as an alias so existing imports keep working (P1.3).
export type FixSeverity = Severity;
export type FixCategory = "Fixes" | "Speed" | "Content" | "AEO";

export interface Fix {
  id: string; // the underlying issue_type
  severity: FixSeverity;
  count: number;
  title: string;
  impact: string;
  effort: string; // "Yoast · 20 min"
  category: FixCategory;
}

interface Recipe {
  title: (n: number) => string;
  impact: string;
  effort: string;
  category: FixCategory;
}

const plural = (n: number, one: string, many: string) =>
  n === 1 ? one : many;

// One recipe per issue_type the crawler emits. Missing types fall back to the
// remediation advice copy so nothing renders as a bare type name.
const FIX_RECIPES: Record<string, Recipe> = {
  server_error: {
    title: (n) => `Fix ${n} server ${plural(n, "error", "errors")} (5xx)`,
    impact: "Visitors and search engines can't load these pages at all.",
    effort: "Server · 1–2 h",
    category: "Fixes",
  },
  not_found: {
    title: (n) => `Resolve ${n} broken ${plural(n, "page", "pages")} (404)`,
    impact: "Linked-to URLs that no longer exist waste crawl budget.",
    effort: "WordPress · 20 min",
    category: "Fixes",
  },
  broken_internal_link: {
    title: (n) => `Fix ${n} broken internal ${plural(n, "link", "links")}`,
    impact: "Dead links frustrate visitors and leak crawl equity.",
    effort: "WordPress · 20 min",
    category: "Fixes",
  },
  orphan_page: {
    title: (n) => `Link ${n} orphaned ${plural(n, "page", "pages")} from navigation`,
    impact: "Nothing on the site points to them, so crawlers rarely reach them.",
    effort: "WordPress · 25 min",
    category: "Content",
  },
  thin_content: {
    title: (n) => `Expand ${n} thin ${plural(n, "page", "pages")}`,
    impact: "Too little content to rank or to answer a query.",
    effort: "Content · 30 min+",
    category: "Content",
  },
  missing_title: {
    title: (n) => `Add titles to ${n} ${plural(n, "page", "pages")}`,
    impact: "No <title> — the single most important on-page signal.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  empty_page_title: {
    title: (n) => `Set real titles on ${n} ${plural(n, "page", "pages")}`,
    impact: "Title is only the site name, with no page-specific text.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  missing_meta_description: {
    title: (n) => `Write meta descriptions for ${n} ${plural(n, "page", "pages")}`,
    impact: "Google is writing its own snippet on these pages.",
    effort: "Yoast · 30 min",
    category: "Content",
  },
  missing_h1: {
    title: (n) => `Add an H1 to ${n} ${plural(n, "page", "pages")}`,
    impact: "No primary heading for readers or search engines to anchor on.",
    effort: "Theme · 15 min",
    category: "Content",
  },
  heading_hierarchy_invalid: {
    title: (n) => `Fix the heading order on ${n} ${plural(n, "page", "pages")}`,
    impact: "Levels skip, so the outline reads as one flat block.",
    effort: "Theme · 15 min",
    category: "Content",
  },
  canonical_mismatch: {
    title: (n) => `Review canonicals on ${n} ${plural(n, "page", "pages")}`,
    impact: "The canonical points somewhere other than the page itself.",
    effort: "Yoast · 20 min",
    category: "Content",
  },
  slow_server_response: {
    title: () => `Speed up server response time`,
    impact: "Median TTFB is slow site-wide — a hosting or caching fix.",
    effort: "Hosting · 1–4 h",
    category: "Speed",
  },
  slow_page: {
    title: (n) => `Speed up ${n} slow ${plural(n, "page", "pages")}`,
    impact: "Full load time exceeds the 3s target.",
    effort: "Theme · 30 min",
    category: "Speed",
  },
  large_page_size: {
    title: (n) => `Trim ${n} heavy ${plural(n, "page", "pages")}`,
    impact: "Over 3 MB per page — slow on mobile.",
    effort: "Media · 30 min",
    category: "Speed",
  },
  non_modern_image_format: {
    title: (n) => `Convert ${n} ${plural(n, "image", "images")} to WebP/AVIF`,
    impact: "Legacy JPEG/PNG inflate page weight.",
    effort: "Media · 20 min",
    category: "Speed",
  },
  missing_image_dimensions: {
    title: (n) => `Set dimensions on images across ${n} ${plural(n, "page", "pages")}`,
    impact: "Missing width/height causes layout shift (CLS).",
    effort: "Theme · 20 min",
    category: "Speed",
  },
  missing_structured_data: {
    title: (n) => `Add schema to ${n} ${plural(n, "page", "pages")}`,
    impact: "No structured data for rich results or AI answers.",
    effort: "Yoast · 25 min",
    category: "AEO",
  },
  faq_without_schema: {
    title: (n) => `Add FAQ schema to ${n} answer ${plural(n, "page", "pages")}`,
    impact: "They answer questions in Q&A form; assistants can't tell.",
    effort: "Yoast · 20 min",
    category: "AEO",
  },
  missing_podcast_schema: {
    title: (n) => `Add PodcastEpisode schema to ${n} ${plural(n, "episode", "episodes")}`,
    impact: "Episode pages carry only generic schema.",
    effort: "Yoast · 20 min",
    category: "AEO",
  },
  missing_answer_block: {
    title: (n) => `Add a lead answer to ${n} ${plural(n, "page", "pages")}`,
    impact: "No direct answer under the H1 for AI engines to quote.",
    effort: "Content · 20 min",
    category: "AEO",
  },
  missing_open_graph: {
    title: (n) => `Add Open Graph tags to ${n} ${plural(n, "page", "pages")}`,
    impact: "Link shares show no title, description, or image.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  incomplete_open_graph: {
    title: (n) => `Add share images to ${n} ${plural(n, "page", "pages")}`,
    impact: "Open Graph is present but has no og:image.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  oversized_images: {
    title: (n) => `Compress ${n} oversized ${plural(n, "image", "images")}`,
    impact: "Images over 200 KB slow the page, especially on mobile.",
    effort: "Media · 20 min",
    category: "Speed",
  },
  missing_image_alt: {
    title: (n) => `Add alt text to images on ${n} ${plural(n, "page", "pages")}`,
    impact: "Screen readers and image search can't interpret these images.",
    effort: "Media · 20 min",
    category: "Content",
  },
  keyword_not_in_title: {
    title: (n) => `Work the target keyword into ${n} ${plural(n, "title", "titles")}`,
    impact: "The page's main keyword is missing from its title tag.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  title_too_short: {
    title: (n) => `Lengthen ${n} short ${plural(n, "title", "titles")}`,
    impact: "Very short titles waste the strongest on-page ranking signal.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  meta_description_too_long: {
    title: (n) => `Shorten ${n} long meta ${plural(n, "description", "descriptions")}`,
    impact: "Google truncates descriptions beyond ~160 characters.",
    effort: "Yoast · 20 min",
    category: "Content",
  },
  duplicate_title: {
    title: (n) => `Make ${n} duplicate ${plural(n, "title", "titles")} unique`,
    impact: "Pages sharing a title compete with each other in search.",
    effort: "Yoast · 20 min",
    category: "Content",
  },
  duplicate_meta_description: {
    title: (n) =>
      `Make ${n} duplicate meta ${plural(n, "description", "descriptions")} unique`,
    impact: "Duplicate descriptions weaken the snippet on each page.",
    effort: "Yoast · 20 min",
    category: "Content",
  },
  duplicate_content: {
    title: (n) => `Resolve duplicate content on ${n} ${plural(n, "page", "pages")}`,
    impact: "Identical content splits ranking signals between the pages.",
    effort: "Content · 30 min",
    category: "Content",
  },
  multiple_h1: {
    title: (n) => `Fix multiple H1s on ${n} ${plural(n, "page", "pages")}`,
    impact: "More than one H1 blurs the page's main topic.",
    effort: "Theme · 15 min",
    category: "Content",
  },
  missing_canonical: {
    title: (n) => `Add a canonical URL to ${n} ${plural(n, "page", "pages")}`,
    impact: "Without a canonical, duplicate URLs can split ranking.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  noindex: {
    title: (n) => `Review noindex on ${n} ${plural(n, "page", "pages")}`,
    impact: "These pages are blocked from Google's index — confirm that's intended.",
    effort: "Yoast · 10 min",
    category: "Content",
  },
  pages_not_in_sitemap: {
    title: (n) => `Add ${n} ${plural(n, "page", "pages")} to the sitemap`,
    impact: "Pages missing from the XML sitemap are slower for crawlers to find.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
  url_structure_issues: {
    title: (n) => `Clean up ${n} problem ${plural(n, "URL", "URLs")}`,
    impact: "Overlong or parameter-heavy URLs are harder to crawl and share.",
    effort: "WordPress · 30 min",
    category: "Content",
  },
  poor_readability: {
    title: (n) => `Improve readability on ${n} ${plural(n, "page", "pages")}`,
    impact: "Dense, complex text is hard to read and lowers engagement.",
    effort: "Content · 30 min",
    category: "Content",
  },
  missing_twitter_card: {
    title: (n) => `Add Twitter Card tags to ${n} ${plural(n, "page", "pages")}`,
    impact: "Shares on X show no preview card.",
    effort: "Yoast · 15 min",
    category: "Content",
  },
};


// Short flag labels for the Pages tab — name the fault, never the type name.
const FLAG_LABELS: Record<string, string> = {
  missing_title: "No title",
  empty_page_title: "Site-name title",
  missing_meta_description: "No meta description",
  missing_h1: "No H1",
  multiple_h1: "Multiple H1",
  heading_hierarchy_invalid: "Heading order",
  thin_content: "Thin content",
  orphan_page: "Orphan",
  broken_internal_link: "Broken link",
  canonical_mismatch: "Canonical mismatch",
  missing_structured_data: "No schema",
  faq_without_schema: "FAQ without schema",
  missing_podcast_schema: "No podcast schema",
  missing_answer_block: "No answer block",
  missing_open_graph: "No Open Graph",
  incomplete_open_graph: "No share image",
  missing_twitter_card: "No Twitter card",
  missing_viewport_meta: "No viewport",
  mixed_content: "Mixed content",
  missing_image_dimensions: "Layout shift risk",
  non_modern_image_format: "Legacy images",
  large_page_size: "Heavy page",
  slow_page: "Slow",
  not_found: "404",
  server_error: "5xx",
  url_structure_issues: "URL issues",
  missing_hreflang: "No hreflang",
  poor_readability: "Hard to read",
  oversized_images: "Oversized images",
  missing_image_alt: "Missing alt text",
  keyword_not_in_title: "Keyword not in title",
  title_too_short: "Title too short",
  title_too_long: "Title too long",
  meta_description_too_long: "Meta too long",
  duplicate_title: "Duplicate title",
  duplicate_content: "Duplicate content",
  duplicate_meta_description: "Duplicate meta",
  missing_canonical: "No canonical",
  noindex: "Noindex",
  pages_not_in_sitemap: "Not in sitemap",
};

export interface PageFlag {
  label: string;
  severity: Severity;
}

export function flagFor(issueType: string, severity: string): PageFlag {
  const label =
    FLAG_LABELS[issueType] ??
    issueType.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return { label, severity: normalizeSeverity(severity) };
}

// Group open-issue rows into fixes, most severe first. Severity is carried
// through on the canonical scale — no lossy high→critical/medium→warning
// collapse, so a "high" issue reads as "high" here, in Compare and in exports.
export function computeFixes(
  rows: { issue_type: string; severity: string }[],
): Fix[] {
  const groups = new Map<
    string,
    { count: number; severity: Severity }
  >();

  for (const row of rows) {
    const g = groups.get(row.issue_type) ?? {
      count: 0,
      severity: "low" as Severity,
    };
    g.count += 1;
    const s = normalizeSeverity(row.severity);
    if (SEVERITY_RANK[s] < SEVERITY_RANK[g.severity]) g.severity = s;
    groups.set(row.issue_type, g);
  }

  const fixes: Fix[] = [];
  for (const [issueType, g] of groups) {
    const recipe = FIX_RECIPES[issueType];
    if (recipe) {
      fixes.push({
        id: issueType,
        severity: g.severity,
        count: g.count,
        title: recipe.title(g.count),
        impact: recipe.impact,
        effort: recipe.effort,
        category: recipe.category,
      });
    } else {
      // Fall back to advice copy so unknown types still read as a fix.
      const advice = getIssueAdvice(issueType);
      fixes.push({
        id: issueType,
        severity: g.severity,
        count: g.count,
        title: advice
          ? `${advice.title} — ${g.count}`
          : `${issueType} (${g.count})`,
        impact: advice?.description ?? "",
        effort: advice?.estimatedEffort ?? "",
        category: "Fixes",
      });
    }
  }

  return fixes.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.count - a.count,
  );
}
