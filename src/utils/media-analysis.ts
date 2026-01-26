import {
  ImageData,
  PageWithImages,
  ImageMissingAlt,
  MediaAnalysisData,
} from "@/types/media-analysis";

/**
 * Parse images from raw page data
 */
export function parseImagesFromPages(
  pages: {
    id: string;
    url: string;
    title: string | null;
    images: ImageData[] | null;
  }[]
): PageWithImages[] {
  return pages.map((page) => {
    const images = page.images || [];
    const missingAltCount = images.filter(
      (img) => !img.alt || img.alt.trim() === ""
    ).length;

    return {
      id: page.id,
      url: page.url,
      title: page.title,
      images,
      imageCount: images.length,
      missingAltCount,
    };
  });
}

/**
 * Calculate alt text coverage statistics
 */
export function calculateAltTextCoverage(pages: PageWithImages[]): {
  total: number;
  withAlt: number;
  missing: number;
  percent: number;
} {
  let total = 0;
  let missing = 0;

  pages.forEach((page) => {
    total += page.imageCount;
    missing += page.missingAltCount;
  });

  const withAlt = total - missing;
  const percent = total > 0 ? Math.round((withAlt / total) * 100) : 100;

  return { total, withAlt, missing, percent };
}

/**
 * Find all images missing alt text
 */
export function findImagesMissingAlt(
  pages: PageWithImages[]
): ImageMissingAlt[] {
  const results: ImageMissingAlt[] = [];

  pages.forEach((page) => {
    page.images.forEach((img) => {
      if (!img.alt || img.alt.trim() === "") {
        results.push({
          pageId: page.id,
          pageUrl: page.url,
          pageTitle: page.title,
          imageSrc: img.src,
        });
      }
    });
  });

  return results;
}

/**
 * Get pages sorted by image count
 */
export function getPagesByImageCount(
  pages: PageWithImages[],
  limit: number = 10
): PageWithImages[] {
  return [...pages]
    .filter((p) => p.imageCount > 0)
    .sort((a, b) => b.imageCount - a.imageCount)
    .slice(0, limit);
}

/**
 * Get pages with missing alt text
 */
export function getPagesWithMissingAlt(
  pages: PageWithImages[]
): PageWithImages[] {
  return pages
    .filter((p) => p.missingAltCount > 0)
    .sort((a, b) => b.missingAltCount - a.missingAltCount);
}

/**
 * Calculate media analysis summary
 */
export function calculateMediaAnalysisSummary(
  data: Omit<MediaAnalysisData, "summary">
): MediaAnalysisData["summary"] {
  let critical = 0;
  let warnings = 0;

  // Pages with many missing alt texts are critical
  data.pagesWithMissingAlt.forEach((page) => {
    if (page.missingAltCount > 5) {
      critical++;
    } else if (page.missingAltCount > 0) {
      warnings++;
    }
  });

  // Low alt coverage is also a concern
  if (data.altCoveragePercent < 50) {
    critical += Math.floor((50 - data.altCoveragePercent) / 10);
  } else if (data.altCoveragePercent < 80) {
    warnings += Math.floor((80 - data.altCoveragePercent) / 10);
  }

  const passed = Math.max(0, data.pagesWithMostImages.length - critical - warnings);

  return { critical, warnings, passed };
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
 * Get image filename from URL
 */
export function getImageFilename(src: string, maxLength: number = 30): string {
  try {
    const url = new URL(src, "https://example.com");
    const filename = url.pathname.split("/").pop() || src;
    if (filename.length <= maxLength) return filename;
    return filename.substring(0, maxLength - 3) + "...";
  } catch {
    if (src.length <= maxLength) return src;
    return src.substring(0, maxLength - 3) + "...";
  }
}
