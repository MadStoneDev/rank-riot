import { getIssueAdvice } from "@/utils/issue-advice";

// Frontend fix-grouping layer for the redesigned Scan report. A "fix" is the
// headline unit: a group of issues that share one remedy ("Write meta
// descriptions for 12 posts"), not a raw finding. This is computed read-time
// from the issues table; once the grouping rules settle it can move to the
// crawler. Raw issues live one level down (a fix expands to its pages).

export type FixSeverity = "critical" | "warning" | "low";
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
};

function toFixSeverity(sev: string): FixSeverity {
  if (sev === "critical" || sev === "high") return "critical";
  if (sev === "medium") return "warning";
  return "low";
}

const SEV_RANK: Record<FixSeverity, number> = {
  critical: 0,
  warning: 1,
  low: 2,
};

// Group open-issue rows into fixes, most severe first.
export function computeFixes(
  rows: { issue_type: string; severity: string }[],
): Fix[] {
  const groups = new Map<
    string,
    { count: number; severity: FixSeverity }
  >();

  for (const row of rows) {
    const g = groups.get(row.issue_type) ?? {
      count: 0,
      severity: "low" as FixSeverity,
    };
    g.count += 1;
    const s = toFixSeverity(row.severity);
    if (SEV_RANK[s] < SEV_RANK[g.severity]) g.severity = s;
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
    (a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || b.count - a.count,
  );
}
