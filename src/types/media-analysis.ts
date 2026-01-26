export interface ImageData {
  src: string;
  alt: string | null;
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
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
}
