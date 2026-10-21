import type { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Mirror of the crawler's persisted score report (crawl-rank-riot
// src/scoring/score-report.ts). The crawler is the single source of truth for
// every score (SC-01); the frontend reads these persisted values and never
// recomputes them (SC-02, F-D01/F-D02). Fields are optional/loose here because
// the column is JSONB and older rows may predate newer fields.

export type CapSeverity = "critical" | "high" | null;

export interface PersistedCheckResult {
  id: string;
  label: string;
  status: "pass" | "fail" | "na";
  passed: number;
  total: number;
  affectedUrls?: string[];
}

export interface PersistedCategoryScore {
  score: number;
  passRate: number;
  checks: PersistedCheckResult[];
}

export interface PersistedPageScore {
  score: number;
  checks?: PersistedCheckResult[];
  cappedBy?: CapSeverity;
}

export interface PersistedScoreReport {
  version?: number;
  /** Headline health score (weighted model, 0-100). */
  overall: number;
  /** Overall check pass-rate (0-100) — the other axis, distinct from overall. */
  overallPassRate?: number;
  categories?: {
    technical: PersistedCategoryScore;
    content: PersistedCategoryScore;
    media: PersistedCategoryScore;
    aeo: PersistedCategoryScore;
  };
  /** Per-page scores keyed by the page's (crawler-normalised) URL. */
  pages?: Record<string, PersistedPageScore>;
  blocked?: boolean;
  capped?: CapSeverity;
  deductions?: unknown[];
  model?: string;
}

/**
 * Fetch the persisted weighted-model score report for a specific scan, or null
 * if none is stored. Single read-through used by every per-page/aggregate
 * surface instead of each one recomputing its own scores.
 */
export async function fetchScoreReport(
  supabase: SupabaseServerClient,
  scanId: string,
): Promise<PersistedScoreReport | null> {
  const { data } = await supabase
    .from("scan_scores")
    .select("report")
    .eq("scan_id", scanId)
    .maybeSingle();
  return (data?.report as PersistedScoreReport | undefined) ?? null;
}

/**
 * The id of a project's latest completed scan (the one the persisted report
 * belongs to), or null if the project has no completed scan.
 */
export async function latestCompletedScanId(
  supabase: SupabaseServerClient,
  projectId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("scans")
    .select("id")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Read the crawler's persisted per-page score for a URL (SC-02, F-D01/F-D02).
 * Returns null when the report has no entry for that URL — e.g. a non-HTML
 * resource (excluded from scoring, S-02) or a legacy scan that predates the
 * weighted model. Callers show a neutral "not scored" state for null rather
 * than recomputing a score that would disagree with the crawler.
 */
export function pageScoreFromReport(
  report: PersistedScoreReport | null,
  url: string,
): number | null {
  const entry = report?.pages?.[url];
  return typeof entry?.score === "number" ? entry.score : null;
}
