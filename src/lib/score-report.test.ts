import { describe, it, expect } from "vitest";
import { pageScoreFromReport, type PersistedScoreReport } from "./score-report";

const report: PersistedScoreReport = {
  overall: 72,
  pages: {
    "https://example.com/": { score: 88 },
    "https://example.com/about": { score: 0 },
  },
};

describe("pageScoreFromReport (SC-02, F-D01/F-D02)", () => {
  it("returns the crawler's persisted score for a known URL", () => {
    expect(pageScoreFromReport(report, "https://example.com/")).toBe(88);
  });

  it("returns a persisted zero as 0, not null", () => {
    // 0 is a real score (fully capped page), distinct from 'not scored'.
    expect(pageScoreFromReport(report, "https://example.com/about")).toBe(0);
  });

  it("returns null for a URL the report has no entry for", () => {
    expect(pageScoreFromReport(report, "https://example.com/missing")).toBeNull();
  });

  it("returns null when there is no report at all", () => {
    expect(pageScoreFromReport(null, "https://example.com/")).toBeNull();
  });

  it("returns null when the report has no pages map", () => {
    expect(pageScoreFromReport({ overall: 50 }, "https://example.com/")).toBeNull();
  });
});
