import {
  ContentIntelligenceData,
  ContentIntelligenceThresholds,
  DEFAULT_THRESHOLDS,
  DuplicateGroup,
  Keyword,
  PageBasic,
  PageWithKeywords,
  SimilarContentGroup,
  ThinContentPage,
} from "@/types/content-intelligence";

/**
 * Calculate Jaccard similarity between two keyword sets
 * Returns a value between 0 and 1
 */
export function calculateKeywordSimilarity(
  keywords1: Keyword[] | null,
  keywords2: Keyword[] | null
): number {
  if (!keywords1 || !keywords2 || keywords1.length === 0 || keywords2.length === 0) {
    return 0;
  }

  const set1 = new Set(keywords1.map((k) => k.word.toLowerCase()));
  const set2 = new Set(keywords2.map((k) => k.word.toLowerCase()));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Find duplicate values in a list of pages
 */
export function findDuplicates<T extends PageBasic>(
  pages: T[],
  getValue: (page: T) => string | null | undefined
): DuplicateGroup[] {
  const groups: Record<string, PageBasic[]> = {};

  pages.forEach((page) => {
    const value = getValue(page)?.trim().toLowerCase();
    if (value) {
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push({
        id: page.id,
        url: page.url,
        title: page.title,
      });
    }
  });

  return Object.entries(groups)
    .filter(([_, pages]) => pages.length > 1)
    .map(([value, pages]) => ({
      value: pages[0].title || value, // Use original case from first page
      pages,
    }))
    .sort((a, b) => b.pages.length - a.pages.length);
}

/**
 * Find pages with similar content based on keyword overlap
 */
export function findSimilarContent(
  pages: PageWithKeywords[],
  threshold: number = DEFAULT_THRESHOLDS.similarityThreshold
): SimilarContentGroup[] {
  const groups: SimilarContentGroup[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const pairKey = `${pages[i].id}-${pages[j].id}`;
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const similarity = calculateKeywordSimilarity(
        pages[i].keywords,
        pages[j].keywords
      );

      if (similarity >= threshold) {
        // Check if either page is already in a group
        const existingGroup = groups.find(
          (g) =>
            g.pages.some((p) => p.id === pages[i].id) ||
            g.pages.some((p) => p.id === pages[j].id)
        );

        if (existingGroup) {
          // Add pages to existing group if not already there
          if (!existingGroup.pages.some((p) => p.id === pages[i].id)) {
            existingGroup.pages.push({
              id: pages[i].id,
              url: pages[i].url,
              title: pages[i].title,
            });
          }
          if (!existingGroup.pages.some((p) => p.id === pages[j].id)) {
            existingGroup.pages.push({
              id: pages[j].id,
              url: pages[j].url,
              title: pages[j].title,
            });
          }
          // Update similarity to highest found
          existingGroup.similarity = Math.max(existingGroup.similarity, similarity);
        } else {
          // Create new group
          groups.push({
            similarity: Math.round(similarity * 100),
            pages: [
              { id: pages[i].id, url: pages[i].url, title: pages[i].title },
              { id: pages[j].id, url: pages[j].url, title: pages[j].title },
            ],
          });
        }
      }
    }
  }

  return groups.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate content intelligence summary counts
 */
export function calculateSummary(
  data: Omit<ContentIntelligenceData, "summary">,
  thresholds: ContentIntelligenceThresholds = DEFAULT_THRESHOLDS
): ContentIntelligenceData["summary"] {
  let critical = 0;
  let warnings = 0;

  // Missing titles are critical
  critical += data.missingTitles.length;

  // Critical thin content (< 100 words)
  const criticalThin = data.thinContent.filter(
    (p) => (p.word_count || 0) < thresholds.criticalThinContentWords
  ).length;
  critical += criticalThin;

  // Warning thin content (100-300 words)
  warnings += data.thinContent.length - criticalThin;

  // Missing meta descriptions are warnings
  warnings += data.missingMetaDescriptions.length;

  // Duplicates are warnings
  warnings += data.duplicateTitles.reduce((acc, g) => acc + g.pages.length - 1, 0);
  warnings += data.duplicateDescriptions.reduce((acc, g) => acc + g.pages.length - 1, 0);

  // Similar content is informational (counted as warnings for now)
  warnings += data.similarContent.reduce((acc, g) => acc + g.pages.length - 1, 0);

  // Calculate total checks and passed
  const totalPages =
    data.thinContent.length +
    data.missingMetaDescriptions.length +
    data.missingTitles.length;

  // Rough estimate of passed checks (this would need real page count for accuracy)
  const total = critical + warnings;
  const passed = Math.max(0, total); // Placeholder - will be calculated from total pages

  return {
    critical,
    warnings,
    passed,
    total,
  };
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

/**
 * Get severity color class based on issue type
 */
export function getSeverityColor(
  type: "critical" | "warning" | "info"
): { bg: string; text: string; border: string } {
  switch (type) {
    case "critical":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "warning":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    case "info":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
  }
}
