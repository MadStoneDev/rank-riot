export interface ImageData {
  src: string;
  alt: string | null;
  file_size_bytes?: number | null;
  format?: string | null;
}

export interface ImageFileSizeStats {
  // Per-instance totals — every <img> reference counted, i.e. what visitors
  // actually download across the site.
  totalBytes: number;
  sizedCount: number; // images with a known byte size
  largeCount: number; // images over the "large" threshold
  largeThresholdBytes: number;
  formatCounts: { format: string; count: number }[];
  nextGenCount: number; // webp / avif
  nextGenPercent: number; // of images with a known format
  // Unique totals — deduplicated by image URL, i.e. the actual files the client
  // needs to optimise (one 800KB banner on 30 pages counts once here).
  uniqueTotalBytes: number;
  uniqueSizedCount: number;
  uniqueLargeCount: number;
}

export interface PageWithImages {
  id: string;
  url: string;
  title: string | null;
  images: ImageData[];
  imageCount: number;
  missingAltCount: number;
}

export interface ImageMissingAlt {
  pageId: string;
  pageUrl: string;
  pageTitle: string | null;
  imageSrc: string;
}

export interface MediaAnalysisData {
  totalImages: number;
  imagesWithAlt: number;
  imagesMissingAlt: number;
  altCoveragePercent: number;
  pagesWithMostImages: PageWithImages[];
  imagesMissingAltList: ImageMissingAlt[];
  pagesWithMissingAlt: PageWithImages[];
  fileSizeStats: ImageFileSizeStats;
  summary: {
    critical: number;
    warnings: number;
  };
}
