// Single source for mapping a 0-100 score to a colour band (F-D11). Before
// this, ScoreRing (80/60), AuditResults (80/60) and the now-deleted
// GeoReadinessSection (60/30), AeoReadinessSection (60/30) and ChecklistView
// (80/50) each defined their own cutoffs, so the same number could render green
// in one widget and amber in another. All band colouring now flows from here.

export type ScoreBand = "good" | "warning" | "critical";

export const SCORE_BAND_CUTOFFS = { good: 80, warning: 60 } as const;

export function scoreBand(score: number): ScoreBand {
  if (score >= SCORE_BAND_CUTOFFS.good) return "good";
  if (score >= SCORE_BAND_CUTOFFS.warning) return "warning";
  return "critical";
}

const COLOR_VAR: Record<ScoreBand, string> = {
  good: "var(--color-score-good)",
  warning: "var(--color-score-warning)",
  critical: "var(--color-score-critical)",
};
/** Inline-style colour (CSS var) for a score. */
export const scoreColorVar = (score: number): string => COLOR_VAR[scoreBand(score)];

const TEXT_CLASS: Record<ScoreBand, string> = {
  good: "text-[var(--color-score-good)]",
  warning: "text-[var(--color-score-warning)]",
  critical: "text-[var(--color-score-critical)]",
};
/** Tailwind text-colour class for a score. */
export const scoreTextClass = (score: number): string => TEXT_CLASS[scoreBand(score)];

const BG_MUTED_CLASS: Record<ScoreBand, string> = {
  good: "bg-[var(--color-score-good-muted)]",
  warning: "bg-[var(--color-score-warning-muted)]",
  critical: "bg-[var(--color-score-critical-muted)]",
};
/** Tailwind muted-background class for a score. */
export const scoreBgMutedClass = (score: number): string =>
  BG_MUTED_CLASS[scoreBand(score)];

const GLOW_CLASS: Record<ScoreBand, string> = {
  good: "glow-green",
  warning: "glow-amber",
  critical: "glow-red",
};
/** Decorative glow class for a score ring. */
export const scoreGlowClass = (score: number): string => GLOW_CLASS[scoreBand(score)];
