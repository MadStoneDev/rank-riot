/**
 * Frontend FALLBACK scorer for scans that have no persisted canonical score
 * (legacy scans predating scan_scores / summary_stats.seo_score).
 *
 * This is the ONE shared fallback both the dashboard and the project detail
 * page call, so the two surfaces can never disagree on a project's number.
 * Previously each fell back to a different formula (dashboard: a
 * Technical/Content/Links/Issues model; detail: a 100-penalty*6 formula),
 * which let the same project show two different scores.
 *
 * It deliberately MIRRORS the crawler's canonical scorer
 * (crawl-rank-riot/src/scoring/score-report.ts): four equally-weighted
 * categories (Technical / Content / Media / AEO), each a share-of-pages pass
 * rate, over the `pages` rows the frontend already has. It operates on DB rows
 * (snake_case) rather than ScanResult, so it is a documented mirror, not a
 * shared import. When the two ever diverge, the crawler is the source of truth;
 * keep this aligned. For any scan with a persisted score this code never runs.
 */

const ADEQUATE_WORDS = 300;
const SLOW_MS = 3000;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const pct = (n: number, total: number) => (total === 0 ? 0 : (n / total) * 100);

/** A `pages` row, loosely typed since Supabase rows come back untyped here. */
export interface FallbackPageRow {
  http_status?: number | null;
  is_indexable?: boolean | null;
  load_time_ms?: number | null;
  title?: string | null;
  meta_description?: string | null;
  word_count?: number | null;
  h1s?: unknown;
  images?: unknown;
  structured_data?: unknown;
  schema_types?: unknown;
  open_graph?: unknown;
}

export interface FallbackSeoScore {
  technical: number;
  content: number;
  media: number;
  aeo: number;
  overall: number;
}

const hasTitle = (p: FallbackPageRow) => !!p.title && p.title.trim().length > 0;
const hasMeta = (p: FallbackPageRow) => !!p.meta_description && p.meta_description.trim().length > 0;
const hasWords = (p: FallbackPageRow) => (p.word_count || 0) >= ADEQUATE_WORDS;
const hasH1 = (p: FallbackPageRow) => Array.isArray(p.h1s) && p.h1s.length > 0;
const isOk = (p: FallbackPageRow) => (p.http_status || 0) >= 200 && (p.http_status || 0) < 300;
const isFast = (p: FallbackPageRow) => (p.load_time_ms || 0) <= SLOW_MS;

/** Per-page AEO machine-readability signals (mirrors the crawler's AEO_SIGNALS). */
function aeoPageScore(p: FallbackPageRow): number {
  const signals = [
    Array.isArray(p.schema_types) && p.schema_types.length > 0,
    Array.isArray(p.structured_data) && p.structured_data.length > 0,
    !!p.open_graph && typeof p.open_graph === "object" && Object.keys(p.open_graph as object).length > 0,
    hasMeta(p),
    hasTitle(p),
    hasH1(p),
    hasWords(p),
  ];
  return pct(signals.filter(Boolean).length, signals.length);
}

/**
 * Compute the four category scores + overall from page rows. Returns all zeros
 * for an empty page set (no data = no health), matching the crawler.
 */
export function computeFallbackSeoScore(pages: FallbackPageRow[]): FallbackSeoScore {
  const total = pages.length;
  if (total === 0) {
    return { technical: 0, content: 0, media: 0, aeo: 0, overall: 0 };
  }

  const technical =
    (pct(pages.filter(isOk).length, total) +
      pct(pages.filter((p) => !!p.is_indexable).length, total) +
      pct(pages.filter(isFast).length, total)) /
    3;

  const content =
    (pct(pages.filter(hasTitle).length, total) +
      pct(pages.filter(hasMeta).length, total) +
      pct(pages.filter(hasWords).length, total) +
      pct(pages.filter(hasH1).length, total)) /
    4;

  let totalImages = 0;
  let imagesWithAlt = 0;
  for (const p of pages) {
    if (!Array.isArray(p.images)) continue;
    for (const img of p.images as Array<{ alt?: string }>) {
      totalImages++;
      if (img && img.alt && img.alt.trim().length > 0) imagesWithAlt++;
    }
  }
  const media = totalImages === 0 ? 100 : pct(imagesWithAlt, totalImages);

  const aeo = pages.reduce((sum, p) => sum + aeoPageScore(p), 0) / total;

  const overall = (technical + content + media + aeo) / 4;

  return {
    technical: clamp(technical),
    content: clamp(content),
    media: clamp(media),
    aeo: clamp(aeo),
    overall: clamp(overall),
  };
}
