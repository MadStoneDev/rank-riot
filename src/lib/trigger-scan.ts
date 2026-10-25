import type { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface TriggerScanOptions {
  projectId: string;
  email?: string | null;
  /**
   * Plan page cap. ALWAYS sent as options.maxPages so no trigger path can start
   * a scan that crawls beyond the project's plan (F-S01). Callers resolve it
   * from the user's plan via getPlanLimits(plan).maxPagesPerScan.
   */
  maxPages: number;
  /** "/api/scan" for SEO scans (default) or "/api/scan/audit" for audits. */
  endpoint?: string;
}

export interface TriggerScanResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * The single entry point for asking the crawler to scan a project. Every
 * trigger path (the API route, the redesign server actions, the classic server
 * actions) goes through here so two invariants hold everywhere and can't drift:
 *
 *  - the plan page cap is always sent (F-S01); and
 *  - the crawler auth header is mandatory (F-S02) — a missing session fails
 *    fast instead of silently sending an unauthenticated request and relying on
 *    the crawler to reject it.
 *
 * It returns an outcome rather than redirecting or swallowing, so each caller
 * surfaces failures in the way that suits its UI.
 */
export async function triggerScan(
  supabase: SupabaseServerClient,
  { projectId, email, maxPages, endpoint = "/api/scan" }: TriggerScanOptions,
): Promise<TriggerScanResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    // Mandatory auth (F-S02): never send an unauthenticated scan request.
    console.error("triggerScan: no session access token — refusing to start scan");
    return { ok: false, error: "no_session" };
  }

  const base = process.env.CRAWLER_API_URL;
  if (!base) {
    console.error("triggerScan: CRAWLER_API_URL is not set — cannot start scan");
    return { ok: false, error: "crawler_unconfigured" };
  }

  try {
    const res = await fetch(`${base}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        email: email ?? undefined,
        options: { maxPages },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: text || `status_${res.status}` };
    }
    return { ok: true, status: res.status };
  } catch (error) {
    console.error("triggerScan: error calling crawler:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
