// The ONE severity scale, matching the crawler (crawl-rank-riot weights.ts).
// Every surface — Fixes, Compare, History, badges, exports — uses this, so the
// same issue never reads as "critical" in one view and "high"/"warning" in
// another (P1.3). Previously fixes.ts collapsed high→critical while Compare
// collapsed high→warning, which is exactly the contradiction this removes.

export type Severity = "critical" | "high" | "medium" | "low";

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

/** Lower rank = more severe (for sorting / worst-of). */
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Coerce any stored/legacy severity string to the canonical scale. */
export function normalizeSeverity(value: string | null | undefined): Severity {
  switch ((value ?? "").toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
    case "warning": // legacy frontend bucket
      return "medium";
    default:
      return "low";
  }
}

/** The more severe of two. */
export function worstSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_RANK[a] <= SEVERITY_RANK[b] ? a : b;
}
