// Single presentation map for the scan report's display groups (F-D09).
//
// The crawler's score category is the source of truth for which group an issue
// belongs to. This file MIRRORS crawl-rank-riot/src/scoring/weights.ts
// (ISSUE_CATEGORY + SPEED_ISSUE_TYPES) — there is no shared package across the
// two repos, so the map is duplicated here and must be kept in step with the
// crawler. The display group is then a pure function of the crawler category,
// so scoring and display can never disagree.

export type ScoreCategory = "technical" | "content" | "media" | "aeo";
export type DisplayGroup = "Technical" | "Content" | "Media" | "AEO";

// Mirror of the crawler's ISSUE_CATEGORY. Unknown types default to "technical".
const ISSUE_CATEGORY: Record<string, ScoreCategory> = {
  // technical
  broken_internal_link: "technical",
  not_found: "technical",
  soft_404: "technical",
  server_error: "technical",
  redirect_chain: "technical",
  redirect_loop: "technical",
  temporary_redirect: "technical",
  too_many_redirects: "technical",
  mixed_content: "technical",
  missing_security_headers: "technical",
  missing_viewport_meta: "technical",
  missing_html_lang: "technical",
  canonical_mismatch: "technical",
  cross_domain_canonical: "technical",
  missing_canonical: "technical",
  multiple_canonical: "technical",
  orphan_page: "technical",
  slow_page: "technical",
  slow_server_response: "technical",
  large_page_size: "technical",
  url_structure_issues: "technical",
  js_rendering_dependency: "technical",
  no_resource_hints: "technical",
  hreflang_issues: "technical",
  missing_form_labels: "technical",
  no_aria_landmarks: "technical",
  missing_skip_nav: "technical",
  tabindex_misuse: "technical",
  missing_robots_txt: "technical",
  missing_sitemap: "technical",
  invalid_sitemap: "technical",
  sitemap_missing_lastmod: "technical",
  pages_not_in_sitemap: "technical",
  // content
  missing_title: "content",
  empty_page_title: "content",
  title_too_long: "content",
  title_too_short: "content",
  missing_meta_description: "content",
  meta_description_too_long: "content",
  meta_description_too_short: "content",
  missing_h1: "content",
  multiple_h1: "content",
  thin_content: "content",
  duplicate_content: "content",
  duplicate_title: "content",
  duplicate_meta_description: "content",
  poor_readability: "content",
  keyword_not_in_title: "content",
  non_descriptive_anchor_text: "content",
  heading_hierarchy_invalid: "content",
  // media
  missing_image_alt: "media",
  missing_image_dimensions: "media",
  missing_image_lazy_loading: "media",
  oversized_images: "media",
  non_modern_image_format: "media",
  // aeo
  invalid_structured_data: "aeo",
  missing_structured_data: "aeo",
  missing_open_graph: "aeo",
  incomplete_open_graph: "aeo",
  missing_twitter_card: "aeo",
  faq_without_schema: "aeo",
  missing_podcast_schema: "aeo",
  missing_answer_block: "aeo",
  missing_llms_txt: "aeo",
  empty_llms_txt: "aeo",
  ai_bots_blocked: "aeo",
};

// Mirror of the crawler's SPEED_ISSUE_TYPES — the cross-category "speed" tag
// (data only; the speed filter UI is Stage 2b).
const SPEED_ISSUE_TYPES = new Set<string>([
  "slow_page",
  "slow_server_response",
  "large_page_size",
  "oversized_images",
  "non_modern_image_format",
  "missing_image_dimensions",
]);

const GROUP_FOR_CATEGORY: Record<ScoreCategory, DisplayGroup> = {
  technical: "Technical",
  content: "Content",
  media: "Media",
  aeo: "AEO",
};

/** The crawler score category for an issue type (unknown → technical). */
export function categoryForIssueType(issueType: string): ScoreCategory {
  return ISSUE_CATEGORY[issueType] ?? "technical";
}

/** The display group for an issue type — a pure function of its crawler category. */
export function displayGroupFor(issueType: string): DisplayGroup {
  return GROUP_FOR_CATEGORY[categoryForIssueType(issueType)];
}

/** Whether an issue type is a load-performance ("speed") issue. */
export function isSpeedIssue(issueType: string): boolean {
  return SPEED_ISSUE_TYPES.has(issueType);
}
