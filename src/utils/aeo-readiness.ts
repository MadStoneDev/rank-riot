/**
 * AEO (Answer Engine Optimization) / GEO (Generative Engine Optimization) Readiness Scoring
 *
 * Evaluates how well a page is optimized for AI-powered search engines and answer boxes.
 *
 * Scoring philosophy: a well-built page with solid fundamentals (structured data,
 * meta tags, good content) should score 60-70%. Specialized schemas like FAQ,
 * HowTo, and Speakable are bonuses that push toward 100%.
 */

export interface AeoSignal {
  name: string;
  score: number;
  maxScore: number;
  present: boolean;
  description: string;
}

export interface AeoResult {
  totalScore: number;
  maxPossible: number;
  percent: number;
  signals: AeoSignal[];
  recommendations: string[];
}

export interface AeoPageInput {
  schema_types?: string[] | null;
  structured_data?: any;
  open_graph?: any;
  twitter_card?: any;
  meta_description?: string | null;
  word_count?: number | null;
  title?: string | null;
  h1s?: string[] | null;
}

export function calculateAeoReadiness(page: AeoPageInput): AeoResult {
  const signals: AeoSignal[] = [];
  const recommendations: string[] = [];

  const schemaTypes = Array.isArray(page.schema_types) ? page.schema_types : [];
  const schemaTypesLower = schemaTypes.map((s) => s.toLowerCase());

  // ── FUNDAMENTALS (up to 65 points) ──────────────────────────────────

  // Structured data presence (+15) — any JSON-LD schema shows investment in machine-readability
  const hasAnySchema = schemaTypes.length > 0;
  signals.push({
    name: "Structured Data",
    score: hasAnySchema ? 15 : 0,
    maxScore: 15,
    present: hasAnySchema,
    description: "JSON-LD structured data makes content machine-readable for AI engines",
  });
  if (!hasAnySchema) recommendations.push("Add JSON-LD structured data (Organization, LocalBusiness, Product, etc.)");

  // Open Graph (+10)
  const hasOG =
    page.open_graph && typeof page.open_graph === "object" && Object.keys(page.open_graph).length > 0;
  signals.push({
    name: "Open Graph",
    score: hasOG ? 10 : 0,
    maxScore: 10,
    present: !!hasOG,
    description: "OG tags help AI engines understand page content and context",
  });
  if (!hasOG) recommendations.push("Add Open Graph meta tags (og:title, og:description, og:image)");

  // Meta description (+10) — commonly used as answer summaries
  const hasMeta = !!(page.meta_description && page.meta_description.trim());
  const metaLen = page.meta_description?.trim().length ?? 0;
  const metaScore = hasMeta ? (metaLen >= 50 && metaLen <= 160 ? 10 : 6) : 0;
  signals.push({
    name: "Meta Description",
    score: metaScore,
    maxScore: 10,
    present: hasMeta,
    description: hasMeta
      ? `${metaLen} chars — ${metaLen >= 50 && metaLen <= 160 ? "ideal length" : "consider 50-160 characters"}`
      : "Missing — AI engines use meta descriptions as answer summaries",
  });
  if (!hasMeta) recommendations.push("Add a descriptive meta description (50-160 characters)");
  else if (metaLen < 50 || metaLen > 160) recommendations.push("Adjust meta description to 50-160 characters for optimal AI extraction");

  // Content depth (+15): 1000+ = 15, 500+ = 10, 300+ = 5
  const wordCount = page.word_count || 0;
  const wordScore = wordCount >= 1000 ? 15 : wordCount >= 500 ? 10 : wordCount >= 300 ? 5 : 0;
  signals.push({
    name: "Content Depth",
    score: wordScore,
    maxScore: 15,
    present: wordScore > 0,
    description: `${wordCount} words — AI engines prefer comprehensive, in-depth content`,
  });
  if (wordScore === 0) recommendations.push("Increase content depth (aim for 300+ words, ideally 500+)");
  else if (wordScore <= 5) recommendations.push("Consider expanding to 500+ words for better AI engine coverage");

  // Page title (+5)
  const hasTitle = !!(page.title && page.title.trim());
  signals.push({
    name: "Page Title",
    score: hasTitle ? 5 : 0,
    maxScore: 5,
    present: hasTitle,
    description: "Clear page titles help AI engines categorize and reference content",
  });
  if (!hasTitle) recommendations.push("Add a descriptive page title");

  // Heading structure (+5) — H1 present signals clear content hierarchy
  const h1s = Array.isArray(page.h1s) ? page.h1s : [];
  const hasH1 = h1s.length > 0;
  signals.push({
    name: "Heading Structure",
    score: hasH1 ? 5 : 0,
    maxScore: 5,
    present: hasH1,
    description: "Clear heading hierarchy helps AI engines parse and extract content sections",
  });
  if (!hasH1) recommendations.push("Add an H1 heading to establish clear content structure");

  // Twitter Card (+5)
  const hasTwitter =
    page.twitter_card && typeof page.twitter_card === "object" && Object.keys(page.twitter_card).length > 0;
  signals.push({
    name: "Twitter Card",
    score: hasTwitter ? 5 : 0,
    maxScore: 5,
    present: !!hasTwitter,
    description: "Twitter Card meta tags provide additional structured context for AI engines",
  });
  if (!hasTwitter) recommendations.push("Add Twitter Card meta tags");

  // ── SCHEMA BONUSES (up to 35 points) ───────────────────────────────

  // Breadcrumb schema (+5)
  const hasBreadcrumb = schemaTypesLower.some((t) => t.includes("breadcrumb"));
  signals.push({
    name: "Breadcrumb Schema",
    score: hasBreadcrumb ? 5 : 0,
    maxScore: 5,
    present: hasBreadcrumb,
    description: "BreadcrumbList schema aids site hierarchy understanding",
  });
  if (!hasBreadcrumb) recommendations.push("Add BreadcrumbList schema for site hierarchy");

  // FAQ schema (+10)
  const hasFAQ = schemaTypesLower.some((t) => t.includes("faq"));
  signals.push({
    name: "FAQ Schema",
    score: hasFAQ ? 10 : 0,
    maxScore: 10,
    present: hasFAQ,
    description: "FAQPage schema helps AI engines extract Q&A pairs for featured snippets",
  });
  if (!hasFAQ) recommendations.push("Add FAQPage schema to pages with question-answer content");

  // Article schema (+5)
  const hasArticle = schemaTypesLower.some(
    (t) => t.includes("article") || t.includes("newsarticle") || t.includes("blogposting"),
  );
  signals.push({
    name: "Article Schema",
    score: hasArticle ? 5 : 0,
    maxScore: 5,
    present: hasArticle,
    description: "Article schema helps AI engines understand content type and authorship",
  });
  if (!hasArticle) recommendations.push("Add Article or BlogPosting schema for editorial content");

  // HowTo schema (+5)
  const hasHowTo = schemaTypesLower.some((t) => t.includes("howto"));
  signals.push({
    name: "HowTo Schema",
    score: hasHowTo ? 5 : 0,
    maxScore: 5,
    present: hasHowTo,
    description: "HowTo schema enables step-by-step result extraction",
  });
  if (!hasHowTo) recommendations.push("Add HowTo schema for instructional or process content");

  // Speakable (+5)
  const hasSpeakable = schemaTypesLower.some((t) => t.includes("speakable"));
  signals.push({
    name: "Speakable",
    score: hasSpeakable ? 5 : 0,
    maxScore: 5,
    present: hasSpeakable,
    description: "Speakable markup identifies content suitable for voice assistants",
  });
  if (!hasSpeakable) recommendations.push("Add Speakable schema for voice search optimization");

  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const maxPossible = signals.reduce((sum, s) => sum + s.maxScore, 0);

  return {
    totalScore,
    maxPossible,
    percent: maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0,
    signals,
    recommendations,
  };
}

/**
 * Calculate aggregate AEO readiness across all pages
 */
export function calculateAggregateAeo(pages: AeoPageInput[]): {
  averageScore: number;
  averagePercent: number;
  signalCoverage: Record<string, number>;
  topRecommendations: string[];
} {
  if (pages.length === 0) {
    return { averageScore: 0, averagePercent: 0, signalCoverage: {}, topRecommendations: [] };
  }

  const results = pages.map(calculateAeoReadiness);
  const avgScore = Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length);
  const avgPercent = Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length);

  // Count how many pages have each signal
  const signalCoverage: Record<string, number> = {};
  results.forEach((r) => {
    r.signals.forEach((s) => {
      if (!signalCoverage[s.name]) signalCoverage[s.name] = 0;
      if (s.present) signalCoverage[s.name]++;
    });
  });

  // Most common recommendations
  const recCounts = new Map<string, number>();
  results.forEach((r) => {
    r.recommendations.forEach((rec) => {
      recCounts.set(rec, (recCounts.get(rec) || 0) + 1);
    });
  });
  const topRecommendations = Array.from(recCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([rec, count]) => `${rec} (${count} pages)`);

  return { averageScore: avgScore, averagePercent: avgPercent, signalCoverage, topRecommendations };
}
