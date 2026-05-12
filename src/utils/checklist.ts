// ---------------------------------------------------------------------------
// SEO / AEO / GEO Checklist — definitions + auto-evaluation logic
// ---------------------------------------------------------------------------

export type CheckStatus = "pass" | "fail" | "warning" | "not_checked";

export type ChecklistCategory =
  | "technical_seo"
  | "on_page_seo"
  | "content"
  | "links"
  | "media"
  | "schema_structured_data"
  | "aeo_readiness"
  | "geo_readiness";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: ChecklistCategory;
  importance: "critical" | "recommended" | "nice_to_have";
  autoCheck?: (data: ChecklistScanData) => CheckStatus;
}

export interface EvaluatedItem extends ChecklistItem {
  status: CheckStatus;
}

export interface ChecklistScanData {
  totalPages: number;
  pagesWithTitle: number;
  pagesWithMetaDescription: number;
  pagesWithH1: number;
  pagesWithMultipleH1: number;
  pagesWithCanonical: number;
  pagesWithStructuredData: number;
  pagesWithOpenGraph: number;
  pagesWithTwitterCard: number;
  indexablePages: number;
  thinContentPages: number;
  brokenLinks: number;
  totalLinks: number;
  totalImages: number;
  imagesWithAlt: number;
  avgLoadTime: number;
  pagesOver3s: number;
  pagesWithRobotsNoindex: number;
  duplicateTitles: number;
  duplicateDescriptions: number;
  orphanPages: number;
  deepPages: number;
  // Site-level
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  sitemapValid: boolean;
  sitemapHasLastmod: boolean;
  hasLlmsTxt: boolean;
  aiBotBlocked: number;
  aiBotCount: number;
  // New scanner fields
  pagesWithViewportMeta: number;
  pagesWithMixedContent: number;
  pagesWithValidHeadingHierarchy: number;
  pagesWithSecurityHeaders: number;
  pagesWithRedirectChains: number;
  // Schema
  pagesWithFaqSchema: number;
  pagesWithHowToSchema: number;
  pagesWithBreadcrumbSchema: number;
  pagesWithArticleSchema: number;
  pagesWithOrganizationSchema: number;
}

// ---------------------------------------------------------------------------
// Category display labels
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  technical_seo: "Technical SEO",
  on_page_seo: "On-Page SEO",
  content: "Content Quality",
  links: "Links & Navigation",
  media: "Images & Media",
  schema_structured_data: "Schema & Structured Data",
  aeo_readiness: "AEO Readiness",
  geo_readiness: "GEO Readiness",
};

export const CATEGORY_ORDER: ChecklistCategory[] = [
  "technical_seo",
  "on_page_seo",
  "content",
  "links",
  "media",
  "schema_structured_data",
  "aeo_readiness",
  "geo_readiness",
];

// ---------------------------------------------------------------------------
// Helper: threshold-based percentage check
// ---------------------------------------------------------------------------

function pctCheck(
  count: number,
  total: number,
  passThreshold = 0.95,
  warnThreshold = 0.8,
): CheckStatus {
  if (total === 0) return "not_checked";
  const ratio = count / total;
  if (ratio >= passThreshold) return "pass";
  if (ratio >= warnThreshold) return "warning";
  return "fail";
}

function inversePctCheck(
  badCount: number,
  total: number,
  passThreshold = 0.02,
  warnThreshold = 0.1,
): CheckStatus {
  if (total === 0) return "not_checked";
  const ratio = badCount / total;
  if (ratio <= passThreshold) return "pass";
  if (ratio <= warnThreshold) return "warning";
  return "fail";
}

// ---------------------------------------------------------------------------
// Checklist item definitions
// ---------------------------------------------------------------------------

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ── Technical SEO ──────────────────────────────────────────────────────
  {
    id: "tech_robots_txt",
    label: "robots.txt exists",
    description:
      "A robots.txt file tells search engines which pages they can and cannot crawl. It should be present at the root of your domain.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => (d.hasRobotsTxt ? "pass" : "fail"),
  },
  {
    id: "tech_sitemap_exists",
    label: "XML sitemap exists",
    description:
      "An XML sitemap helps search engines discover and index all important pages on your site efficiently.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => (d.hasSitemap ? "pass" : "fail"),
  },
  {
    id: "tech_sitemap_valid",
    label: "Sitemap is valid",
    description:
      "The XML sitemap should conform to the sitemap protocol and contain no structural errors.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (!d.hasSitemap) return "not_checked";
      return d.sitemapValid ? "pass" : "fail";
    },
  },
  {
    id: "tech_sitemap_lastmod",
    label: "Sitemap has lastmod dates",
    description:
      "Including <lastmod> dates in your sitemap tells crawlers when content was last updated, enabling more efficient crawl budgets.",
    category: "technical_seo",
    importance: "recommended",
    autoCheck: (d) => {
      if (!d.hasSitemap) return "not_checked";
      return d.sitemapHasLastmod ? "pass" : "warning";
    },
  },
  {
    id: "tech_status_200",
    label: "All pages return 200 status",
    description:
      "Every indexable page should return a 200 OK status code. Non-200 responses may indicate broken or misconfigured pages.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return pctCheck(d.indexablePages, d.totalPages);
    },
  },
  {
    id: "tech_no_redirect_chains",
    label: "No redirect chains (3+ hops)",
    description:
      "Redirect chains slow down page loading and dilute link equity. Redirects should resolve in a single hop.",
    category: "technical_seo",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.pagesWithRedirectChains, d.totalPages, 0, 0.05);
    },
  },
  {
    id: "tech_load_time",
    label: "Pages load under 3 seconds",
    description:
      "Page speed impacts both user experience and SEO rankings. Over 3 seconds of load time significantly increases bounce rate.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.pagesOver3s, d.totalPages, 0.05, 0.2);
    },
  },
  {
    id: "tech_viewport_meta",
    label: "Viewport meta tag on all pages",
    description:
      "The viewport meta tag ensures pages render correctly on mobile devices. Mobile-friendliness is a ranking factor.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithViewportMeta, d.totalPages),
  },
  {
    id: "tech_no_mixed_content",
    label: "No mixed content",
    description:
      "Pages served over HTTPS should not load resources (scripts, images, stylesheets) over insecure HTTP connections.",
    category: "technical_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.pagesWithMixedContent, d.totalPages, 0, 0.05);
    },
  },
  {
    id: "tech_security_headers",
    label: "Security headers present (HSTS, X-Content-Type-Options)",
    description:
      "Security headers protect users and signal trust to search engines. HSTS and X-Content-Type-Options are most important.",
    category: "technical_seo",
    importance: "recommended",
    autoCheck: (d) => pctCheck(d.pagesWithSecurityHeaders, d.totalPages, 0.9, 0.5),
  },

  // ── On-Page SEO ────────────────────────────────────────────────────────
  {
    id: "onpage_titles",
    label: "All pages have title tags",
    description:
      "The <title> tag is one of the most important on-page SEO elements. Every page should have a unique, descriptive title.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithTitle, d.totalPages),
  },
  {
    id: "onpage_title_length",
    label: "No duplicate title tags",
    description:
      "Each page should have a unique title between 30-60 characters. Duplicate titles confuse search engines and split ranking potential.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.duplicateTitles, d.totalPages, 0.02, 0.1);
    },
  },
  {
    id: "onpage_meta_descriptions",
    label: "All pages have meta descriptions",
    description:
      "Meta descriptions provide a summary for search result snippets. Missing descriptions mean Google auto-generates them, which may be less effective.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithMetaDescription, d.totalPages),
  },
  {
    id: "onpage_duplicate_descriptions",
    label: "No duplicate meta descriptions",
    description:
      "Duplicate meta descriptions waste crawl budget and reduce click-through rates. Each page should have a unique description.",
    category: "on_page_seo",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.duplicateDescriptions, d.totalPages, 0.02, 0.1);
    },
  },
  {
    id: "onpage_h1_present",
    label: "All pages have H1 tags",
    description:
      "Every page should have exactly one H1 tag that clearly describes the page content and contains relevant keywords.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithH1, d.totalPages),
  },
  {
    id: "onpage_no_multiple_h1",
    label: "No pages have multiple H1s",
    description:
      "Multiple H1 tags dilute the primary heading signal. Each page should have exactly one H1 to clearly indicate the main topic.",
    category: "on_page_seo",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.pagesWithMultipleH1, d.totalPages, 0.02, 0.1);
    },
  },
  {
    id: "onpage_heading_hierarchy",
    label: "Valid heading hierarchy (no skipped levels)",
    description:
      "Headings should follow a logical hierarchy (H1 > H2 > H3). Skipping levels (e.g., H1 to H3) hurts accessibility and SEO semantics.",
    category: "on_page_seo",
    importance: "recommended",
    autoCheck: (d) =>
      pctCheck(d.pagesWithValidHeadingHierarchy, d.totalPages, 0.9, 0.7),
  },
  {
    id: "onpage_canonicals",
    label: "All pages have canonical URLs",
    description:
      "Canonical tags prevent duplicate content issues by telling search engines which version of a page is the primary one.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithCanonical, d.totalPages),
  },
  {
    id: "onpage_no_noindex",
    label: "No unintentional noindex pages",
    description:
      "Pages with a noindex directive will not appear in search results. Verify that only pages you intentionally want excluded are noindexed.",
    category: "on_page_seo",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      // A small number of noindex pages is normal (privacy policy, login, etc.)
      return inversePctCheck(d.pagesWithRobotsNoindex, d.totalPages, 0.1, 0.25);
    },
  },

  // ── Content Quality ────────────────────────────────────────────────────
  {
    id: "content_no_thin",
    label: "No thin content pages (<300 words)",
    description:
      "Pages with very little content may be seen as low-quality by search engines. Aim for at least 300 words of meaningful content on each page.",
    category: "content",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.thinContentPages, d.totalPages, 0.1, 0.25);
    },
  },
  {
    id: "content_no_duplicate_titles",
    label: "No duplicate titles across pages",
    description:
      "Duplicate titles across different pages indicate content overlap and confuse search engines about which page to rank for a given query.",
    category: "content",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return d.duplicateTitles === 0
        ? "pass"
        : d.duplicateTitles <= 3
          ? "warning"
          : "fail";
    },
  },
  {
    id: "content_no_duplicate_descriptions",
    label: "No duplicate meta descriptions across pages",
    description:
      "Duplicate meta descriptions waste an opportunity to differentiate pages in search results. Each page should have its own unique description.",
    category: "content",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return d.duplicateDescriptions === 0
        ? "pass"
        : d.duplicateDescriptions <= 3
          ? "warning"
          : "fail";
    },
  },
  {
    id: "content_depth",
    label: "Adequate content depth on key pages",
    description:
      "Key landing pages should have substantial content that thoroughly covers the topic. This signals expertise and authority to search engines.",
    category: "content",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      const thinRatio = d.thinContentPages / d.totalPages;
      if (thinRatio <= 0.05) return "pass";
      if (thinRatio <= 0.15) return "warning";
      return "fail";
    },
  },

  // ── Links & Navigation ─────────────────────────────────────────────────
  {
    id: "links_no_broken",
    label: "No broken internal links",
    description:
      "Broken links (404s) frustrate users and waste crawl budget. All internal links should resolve to valid pages.",
    category: "links",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalLinks === 0) return "not_checked";
      return inversePctCheck(d.brokenLinks, d.totalLinks, 0.01, 0.05);
    },
  },
  {
    id: "links_no_orphans",
    label: "No orphan pages",
    description:
      "Orphan pages have no internal links pointing to them, making them nearly invisible to search engine crawlers and users.",
    category: "links",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.orphanPages, d.totalPages, 0.02, 0.1);
    },
  },
  {
    id: "links_no_deep_pages",
    label: "No pages deeper than depth 4",
    description:
      "Pages buried deep in the site hierarchy are harder for crawlers to discover and typically receive less link equity.",
    category: "links",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return inversePctCheck(d.deepPages, d.totalPages, 0.05, 0.15);
    },
  },
  {
    id: "links_click_depth",
    label: "All important pages within 3 clicks of homepage",
    description:
      "Users and crawlers should be able to reach any important page within 3 clicks from the homepage. Flat site architecture improves indexation.",
    category: "links",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      // deepPages represents pages at depth > 4
      const deepRatio = d.deepPages / d.totalPages;
      if (deepRatio <= 0.02) return "pass";
      if (deepRatio <= 0.1) return "warning";
      return "fail";
    },
  },

  // ── Images & Media ─────────────────────────────────────────────────────
  {
    id: "media_alt_text",
    label: "All images have alt text",
    description:
      "Alt text describes images for screen readers and search engines. Missing alt text is an accessibility violation and missed SEO opportunity.",
    category: "media",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalImages === 0) return "not_checked";
      return pctCheck(d.imagesWithAlt, d.totalImages, 0.95, 0.8);
    },
  },
  {
    id: "media_lazy_loading",
    label: "Images use lazy loading",
    description:
      'Lazy loading defers off-screen images until they are needed, improving initial page load time. Use loading="lazy" on below-the-fold images.',
    category: "media",
    importance: "recommended",
    autoCheck: () => "not_checked", // Would need specific scan data
  },
  {
    id: "media_modern_formats",
    label: "Modern image formats (WebP/AVIF)",
    description:
      "Modern formats like WebP and AVIF offer significantly better compression than JPEG/PNG while maintaining quality, improving load times.",
    category: "media",
    importance: "nice_to_have",
    autoCheck: () => "not_checked", // Would need specific scan data
  },

  // ── Schema & Structured Data ───────────────────────────────────────────
  {
    id: "schema_json_ld",
    label: "JSON-LD structured data present",
    description:
      "JSON-LD structured data helps search engines understand your content. It enables rich results like star ratings, FAQs, and breadcrumbs in SERPs.",
    category: "schema_structured_data",
    importance: "critical",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return pctCheck(d.pagesWithStructuredData, d.totalPages, 0.5, 0.2);
    },
  },
  {
    id: "schema_organization",
    label: "Organization schema on homepage",
    description:
      "Organization schema identifies your brand to search engines and can enable a Knowledge Panel. It should appear on at least your homepage.",
    category: "schema_structured_data",
    importance: "recommended",
    autoCheck: (d) => (d.pagesWithOrganizationSchema > 0 ? "pass" : "fail"),
  },
  {
    id: "schema_breadcrumb",
    label: "Breadcrumb schema present",
    description:
      "BreadcrumbList schema enables breadcrumb-style navigation in search results, helping users understand your site structure.",
    category: "schema_structured_data",
    importance: "recommended",
    autoCheck: (d) => {
      if (d.totalPages === 0) return "not_checked";
      return pctCheck(d.pagesWithBreadcrumbSchema, d.totalPages, 0.3, 0.1);
    },
  },
  {
    id: "schema_faq",
    label: "FAQ schema where applicable",
    description:
      "FAQPage schema can trigger FAQ rich results in SERPs, increasing visibility and click-through rates on pages with Q&A content.",
    category: "schema_structured_data",
    importance: "nice_to_have",
    autoCheck: (d) => (d.pagesWithFaqSchema > 0 ? "pass" : "warning"),
  },
  {
    id: "schema_article",
    label: "Article schema on blog posts",
    description:
      "Article schema helps search engines identify and display blog posts, news articles, and editorial content as rich results.",
    category: "schema_structured_data",
    importance: "recommended",
    autoCheck: (d) => (d.pagesWithArticleSchema > 0 ? "pass" : "warning"),
  },
  {
    id: "schema_howto",
    label: "HowTo schema where applicable",
    description:
      "HowTo schema enables step-by-step rich results for instructional content, driving engagement and traffic from search.",
    category: "schema_structured_data",
    importance: "nice_to_have",
    autoCheck: (d) => (d.pagesWithHowToSchema > 0 ? "pass" : "not_checked"),
  },

  // ── AEO Readiness ──────────────────────────────────────────────────────
  {
    id: "aeo_open_graph",
    label: "Open Graph tags on all pages",
    description:
      "Open Graph meta tags control how your content appears when shared on social media and referenced by AI systems. They are essential for content attribution.",
    category: "aeo_readiness",
    importance: "critical",
    autoCheck: (d) => pctCheck(d.pagesWithOpenGraph, d.totalPages, 0.9, 0.6),
  },
  {
    id: "aeo_twitter_card",
    label: "Twitter Card tags on all pages",
    description:
      "Twitter Card meta tags enable rich link previews on Twitter/X and are increasingly used as metadata signals by AI answer engines.",
    category: "aeo_readiness",
    importance: "recommended",
    autoCheck: (d) => pctCheck(d.pagesWithTwitterCard, d.totalPages, 0.9, 0.6),
  },
  {
    id: "aeo_faq_content",
    label: "FAQ / Q&A content patterns detected",
    description:
      "Content structured as questions and answers is more likely to be surfaced by answer engines (Google SGE, Perplexity, ChatGPT). FAQ schema reinforces this signal.",
    category: "aeo_readiness",
    importance: "recommended",
    autoCheck: (d) => (d.pagesWithFaqSchema > 0 ? "pass" : "warning"),
  },
  {
    id: "aeo_question_headings",
    label: "Question-based headings present",
    description:
      "Headings phrased as questions (Who, What, Where, When, Why, How) align with natural-language queries used in answer engines.",
    category: "aeo_readiness",
    importance: "nice_to_have",
    autoCheck: () => "not_checked", // Would need heading content analysis
  },
  {
    id: "aeo_structured_answers",
    label: "Structured data reinforces content",
    description:
      "Pages with both structured data and well-organized content are more likely to be selected as authoritative answers by AI systems.",
    category: "aeo_readiness",
    importance: "recommended",
    autoCheck: (d) => pctCheck(d.pagesWithStructuredData, d.totalPages, 0.4, 0.15),
  },

  // ── GEO Readiness ──────────────────────────────────────────────────────
  {
    id: "geo_llms_txt",
    label: "llms.txt file exists",
    description:
      "An llms.txt file tells large language models how to represent and cite your site. It improves how your content appears in AI-generated answers.",
    category: "geo_readiness",
    importance: "critical",
    autoCheck: (d) => (d.hasLlmsTxt ? "pass" : "fail"),
  },
  {
    id: "geo_no_ai_bots_blocked",
    label: "No AI bots blocked in robots.txt",
    description:
      "Blocking AI crawlers (GPTBot, ClaudeBot, etc.) prevents your content from being included in AI training and answer generation. Allow them unless you have a specific reason not to.",
    category: "geo_readiness",
    importance: "critical",
    autoCheck: (d) => {
      if (!d.hasRobotsTxt) return "not_checked";
      if (d.aiBotCount === 0) return "not_checked";
      if (d.aiBotBlocked === 0) return "pass";
      if (d.aiBotBlocked < d.aiBotCount) return "warning";
      return "fail";
    },
  },
  {
    id: "geo_entity_schema",
    label: "Entity schema completeness",
    description:
      "Complete entity schema (Organization, Person, Product) helps AI models build accurate knowledge graph entries for your brand and offerings.",
    category: "geo_readiness",
    importance: "recommended",
    autoCheck: (d) => {
      const hasOrg = d.pagesWithOrganizationSchema > 0;
      const hasArticle = d.pagesWithArticleSchema > 0;
      const hasFaq = d.pagesWithFaqSchema > 0;
      const count = [hasOrg, hasArticle, hasFaq].filter(Boolean).length;
      if (count >= 3) return "pass";
      if (count >= 1) return "warning";
      return "fail";
    },
  },
  {
    id: "geo_structured_data_coverage",
    label: "Structured data on majority of pages",
    description:
      "Broad structured data coverage helps generative engines understand your site holistically, increasing the chance of being cited as a source.",
    category: "geo_readiness",
    importance: "recommended",
    autoCheck: (d) => pctCheck(d.pagesWithStructuredData, d.totalPages, 0.5, 0.2),
  },
  {
    id: "geo_content_attributability",
    label: "Content is clearly attributable",
    description:
      "AI systems prefer citing content with clear authorship (Organization/Person schema), dates, and structured markup. Ensure your content includes author and publication metadata.",
    category: "geo_readiness",
    importance: "nice_to_have",
    autoCheck: (d) => {
      const hasOrg = d.pagesWithOrganizationSchema > 0;
      const hasArticle = d.pagesWithArticleSchema > 0;
      if (hasOrg && hasArticle) return "pass";
      if (hasOrg || hasArticle) return "warning";
      return "fail";
    },
  },
];

// ---------------------------------------------------------------------------
// Evaluation functions
// ---------------------------------------------------------------------------

/**
 * Run autoCheck for every checklist item against the scan data.
 */
export function evaluateChecklist(
  items: ChecklistItem[],
  data: ChecklistScanData,
): EvaluatedItem[] {
  return items.map((item) => ({
    ...item,
    status: item.autoCheck ? item.autoCheck(data) : "not_checked",
  }));
}

/**
 * Get the score for a single category.
 */
export function getCategoryScore(
  items: EvaluatedItem[],
  category: ChecklistCategory,
): { passed: number; total: number; percent: number } {
  const catItems = items.filter((i) => i.category === category);
  const checked = catItems.filter((i) => i.status !== "not_checked");
  const passed = checked.filter((i) => i.status === "pass").length;
  const total = checked.length;
  return {
    passed,
    total,
    percent: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}

/**
 * Get the overall score across all categories.
 */
export function getOverallScore(
  items: EvaluatedItem[],
): { passed: number; total: number; percent: number } {
  const checked = items.filter((i) => i.status !== "not_checked");
  const passed = checked.filter((i) => i.status === "pass").length;
  const total = checked.length;
  return {
    passed,
    total,
    percent: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}
