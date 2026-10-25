import { describe, it, expect } from "vitest";
import {
  scoreBand,
  scoreColorVar,
  scoreTextClass,
  scoreGlowClass,
} from "./score-band";

describe("scoreBand (F-D11 single cutoff source)", () => {
  it("bands at 80 and 60 (inclusive lower bound)", () => {
    expect(scoreBand(100)).toBe("good");
    expect(scoreBand(80)).toBe("good");
    expect(scoreBand(79)).toBe("warning");
    expect(scoreBand(60)).toBe("warning");
    expect(scoreBand(59)).toBe("critical");
    expect(scoreBand(0)).toBe("critical");
  });

  it("derives colour/class/glow consistently from the same band", () => {
    expect(scoreColorVar(90)).toBe("var(--color-score-good)");
    expect(scoreTextClass(70)).toBe("text-[var(--color-score-warning)]");
    expect(scoreGlowClass(30)).toBe("glow-red");
  });
});
