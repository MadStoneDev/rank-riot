export interface ImageData {
  src: string;
  alt: string | null;
  file_size_bytes?: number | null;
  format?: string | null;
}

export interface ImageFileSizeStats {
  totalBytes: number;
  sizedCount: number; // images with a known byte size
  largeCount: number; // images over the "large" threshold
  largeThresholdBytes: number;
  formatCounts: { format: string; count: number }[];
  nextGenCount: number; // webp / avif
  nextGenPercent: number; // of images with a known format
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
    passed: number;
  };
}
