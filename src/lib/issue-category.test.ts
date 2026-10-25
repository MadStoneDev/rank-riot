import { describe, it, expect } from "vitest";
import { displayGroupFor, categoryForIssueType, isSpeedIssue } from "./issue-category";
import { computeFixes } from "./fixes";

// These pin the display groups to the crawler's categories (F-D09). They must
// stay in step with crawl-rank-riot/src/scoring/weights.test.ts.
describe("displayGroupFor (presentation map)", () => {
  it("maps the four crawler categories to the four display groups", () => {
    expect(displayGroupFor("missing_title")).toBe("Content");
    expect(displayGroupFor("server_error")).toBe("Technical");
    expect(displayGroupFor("missing_image_alt")).toBe("Media");
    expect(displayGroupFor("missing_structured_data")).toBe("AEO");
  });

  it("moves image alt to Media and canonical/URL to Technical", () => {
    expect(displayGroupFor("missing_image_alt")).toBe("Media");
    expect(displayGroupFor("missing_canonical")).toBe("Technical");
    expect(displayGroupFor("url_structure_issues")).toBe("Technical");
    expect(displayGroupFor("orphan_page")).toBe("Technical");
  });

  it("moves Open Graph / Twitter and the lead-answer block to AEO", () => {
    expect(displayGroupFor("missing_open_graph")).toBe("AEO");
    expect(displayGroupFor("incomplete_open_graph")).toBe("AEO");
    expect(displayGroupFor("missing_twitter_card")).toBe("AEO");
    expect(displayGroupFor("missing_answer_block")).toBe("AEO");
  });

  it("dissolves Speed: page perf → Technical, image perf → Media", () => {
    expect(displayGroupFor("slow_page")).toBe("Technical");
    expect(displayGroupFor("slow_server_response")).toBe("Technical");
    expect(displayGroupFor("large_page_size")).toBe("Technical");
    expect(displayGroupFor("oversized_images")).toBe("Media");
    expect(displayGroupFor("non_modern_image_format")).toBe("Media");
    expect(displayGroupFor("missing_image_dimensions")).toBe("Media");
  });

  it("defaults unknown and noindex types to Technical", () => {
    expect(displayGroupFor("noindex")).toBe("Technical");
    expect(displayGroupFor("some_future_type")).toBe("Technical");
    expect(categoryForIssueType("some_future_type")).toBe("technical");
  });
});

describe("speed tag mirror", () => {
  it("flags perf issues across both categories and nothing else", () => {
    expect(isSpeedIssue("slow_page")).toBe(true);
    expect(isSpeedIssue("oversized_images")).toBe(true);
    expect(isSpeedIssue("missing_title")).toBe(false);
  });
});

describe("computeFixes derives category from the map (F-D09)", () => {
  it("assigns each fix its crawler-category display group", () => {
    const fixes = computeFixes([
      { issue_type: "missing_image_alt", severity: "low" },
      { issue_type: "missing_open_graph", severity: "medium" },
      { issue_type: "slow_page", severity: "high" },
      { issue_type: "thin_content", severity: "medium" },
    ]);
    const byId = Object.fromEntries(fixes.map((f) => [f.id, f.category]));
    expect(byId["missing_image_alt"]).toBe("Media");
    expect(byId["missing_open_graph"]).toBe("AEO");
    expect(byId["slow_page"]).toBe("Technical");
    expect(byId["thin_content"]).toBe("Content");
  });

  it("gives an unknown type a Technical group via the fallback path", () => {
    const fixes = computeFixes([
      { issue_type: "some_future_type", severity: "low" },
    ]);
    expect(fixes[0].category).toBe("Technical");
  });
});
