import { describe, it, expect } from "vitest";
import { computeFallbackSeoScore, FallbackPageRow } from "./fallback-score";

const optimizedPage = (over: Partial<FallbackPageRow> = {}): FallbackPageRow => ({
  http_status: 200,
  is_indexable: true,
  load_time_ms: 400,
  title: "A descriptive title",
  meta_description: "A concise meta description.",
  word_count: 800,
  h1s: ["Main heading"],
  images: [{ alt: "described" }],
  structured_data: [{ "@type": "Article" }],
  schema_types: ["Article"],
  open_graph: { "og:title": "x" },
  ...over,
});

describe("computeFallbackSeoScore", () => {
  it("scores a fully-optimized page 100 across the board", () => {
    expect(computeFallbackSeoScore([optimizedPage()])).toEqual({
      technical: 100,
      content: 100,
      media: 100,
      aeo: 100,
      overall: 100,
    });
  });

  it("returns all zeros for no pages (no data = no health)", () => {
    expect(computeFallbackSeoScore([])).toEqual({
      technical: 0,
      content: 0,
      media: 0,
      aeo: 0,
      overall: 0,
    });
  });

  it("reflects alt-text coverage in the media category", () => {
    const page = optimizedPage({ images: [{ alt: "ok" }, { alt: "" }] });
    expect(computeFallbackSeoScore([page]).media).toBe(50);
  });

  it("gives media 100 when a page has no images (matches crawler neutral default)", () => {
    const page = optimizedPage({ images: [] });
    expect(computeFallbackSeoScore([page]).media).toBe(100);
  });

  it("is deterministic: same input, same output (dashboard == detail guarantee)", () => {
    // The dashboard and detail page both call this with the same page rows, so
    // identical input must yield an identical number. This is the invariant
    // that keeps the two surfaces from ever disagreeing on a fallback score.
    const pages = [
      optimizedPage(),
      optimizedPage({ title: undefined, meta_description: undefined }),
      { http_status: 404 } as FallbackPageRow,
    ];
    const a = computeFallbackSeoScore(pages);
    const b = computeFallbackSeoScore(pages);
    expect(a).toEqual(b);
  });

  it("penalizes missing content signals", () => {
    const bare = { http_status: 200, is_indexable: true, load_time_ms: 200 } as FallbackPageRow;
    const score = computeFallbackSeoScore([bare]);
    expect(score.content).toBe(0);
    expect(score.aeo).toBeLessThan(50);
    expect(score.technical).toBe(100); // 200 + indexable + fast
  });
});
