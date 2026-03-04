/**
 * AEO (Answer Engine Optimization) / GEO (Generative Engine Optimization) Readiness Scoring
 *
 * Evaluates how well a page is optimized for AI-powered search engines and answer boxes.
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
}

export function calculateAeoReadiness(page: AeoPageInput): AeoResult {
  const signals: AeoSignal[] = [];
  const recommendations: string[] = [];

  const schemaTypes = Array.isArray(page.schema_types) ? page.schema_types : [];
  const schemaTypesLower = schemaTypes.map((s) => s.toLowerCase());

  // FAQ schema (+20)
  const hasFAQ = schemaTypesLower.some((t) => t.includes("faq"));
  signals.push({
    name: "FAQ Schema",
    score: hasFAQ ? 20 : 0,
    maxScore: 20,
    present: hasFAQ,
    description: "FAQPage schema markup helps AI engines extract Q&A pairs",
  });
  if (!hasFAQ) recommendations.push("Add FAQPage schema to pages with question-answer content");

  // HowTo schema (+15)
  const hasHowTo = schemaTypesLower.some((t) => t.includes("howto"));
  signals.push({
    name: "HowTo Schema",
    score: hasHowTo ? 15 : 0,
    maxScore: 15,
    present: hasHowTo,
    description: "HowTo schema enables step-by-step result extraction",
  });
  if (!hasHowTo) recommendations.push("Add HowTo schema for instructional content");

  // Speakable (+15)
  const hasSpeakable = schemaTypesLower.some((t) => t.includes("speakable"));
  signals.push({
    name: "Speakable",
    score: hasSpeakable ? 15 : 0,
    maxScore: 15,
    present: hasSpeakable,
    description: "Speakable markup identifies content suitable for voice assistants",
  });
  if (!hasSpeakable) recommendations.push("Add Speakable schema for voice search optimization");

  // Article schema (+10)
  const hasArticle = schemaTypesLower.some(
    (t) => t.includes("article") || t.includes("newsarticle") || t.includes("blogposting"),
  );
  signals.push({
    name: "Article Schema",
    score: hasArticle ? 10 : 0,
    maxScore: 10,
    present: hasArticle,
    description: "Article schema helps AI engines understand content type and authorship",
  });
  if (!hasArticle) recommendations.push("Add Article, NewsArticle, or BlogPosting schema");

  // Breadcrumb schema (+5)
  const hasBreadcrumb = schemaTypesLower.some((t) => t.includes("breadcrumb"));
  signals.push({
    name: "Breadcrumb",
    score: hasBreadcrumb ? 5 : 0,
    maxScore: 5,
    present: hasBreadcrumb,
    description: "BreadcrumbList schema aids content hierarchy understanding",
  });
  if (!hasBreadcrumb) recommendations.push("Add BreadcrumbList schema for site hierarchy");

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

  // Twitter Card (+5)
  const hasTwitter =
    page.twitter_card && typeof page.twitter_card === "object" && Object.keys(page.twitter_card).length > 0;
  signals.push({
    name: "Twitter Card",
    score: hasTwitter ? 5 : 0,
    maxScore: 5,
    present: !!hasTwitter,
    description: "Twitter Card meta tags provide additional structured context",
  });
  if (!hasTwitter) recommendations.push("Add Twitter Card meta tags");

  // Meta description (+5)
  const hasMeta = !!(page.meta_description && page.meta_description.trim());
  signals.push({
    name: "Meta Description",
    score: hasMeta ? 5 : 0,
    maxScore: 5,
    present: hasMeta,
    description: "Meta descriptions are commonly used as answer summaries by AI engines",
  });
  if (!hasMeta) recommendations.push("Add a descriptive meta description");

  // Word count: 1000+ = +10, 500+ = +5
  const wordCount = page.word_count || 0;
  const wordScore = wordCount >= 1000 ? 10 : wordCount >= 500 ? 5 : 0;
  signals.push({
    name: "Content Depth",
    score: wordScore,
    maxScore: 10,
    present: wordScore > 0,
    description: `${wordCount} words — comprehensive content is preferred by AI answer engines`,
  });
  if (wordScore === 0) recommendations.push("Increase content depth (aim for 500+ words)");
  else if (wordScore === 5) recommendations.push("Consider expanding to 1000+ words for maximum AEO benefit");

  // Title (+5)
  const hasTitle = !!(page.title && page.title.trim());
  signals.push({
    name: "Page Title",
    score: hasTitle ? 5 : 0,
    maxScore: 5,
    present: hasTitle,
    description: "Clear page titles help AI engines categorize and reference content",
  });
  if (!hasTitle) recommendations.push("Add a descriptive page title");

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
