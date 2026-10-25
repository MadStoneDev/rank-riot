// Frontend mirror of the crawler's issue thresholds
// (crawl-rank-riot/src/services/issue-detector.ts). These MUST match the
// crawler so the numbers the UI shows agree with the issues the crawler
// actually raised (F-D03/F-D04). Previously the frontend used its own values
// (image 200 KB vs crawler 400 KB; TTFB 800 ms vs crawler 600 ms), so the UI
// flagged things the crawler never raised. The deeper fix is to render
// crawler-derived counts directly (F-D12); until then these keep them in step.

/** Crawler flags oversized_images when file_size_bytes > 400_000. */
export const LARGE_IMAGE_THRESHOLD_BYTES = 400_000;

/** Crawler flags slow TTFB when first_byte_time_ms > 600. */
export const SLOW_TTFB_MS = 600;
