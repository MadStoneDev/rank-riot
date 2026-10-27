import type { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Server-side client for the crawler's /api/keys endpoints. Key minting lives in
// the crawler (it owns the rrk_ key logic), so the app never reimplements the
// crypto — it calls the crawler with the user's Supabase access token, the same
// pattern as triggerScan. api_keys is service-role-only, so there is no
// browser-direct path anyway.

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_min: number;
  monthly_quota: number | null;
  status: string; // 'active' | 'revoked'
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  usage: { requests: number; jobs_created: number };
}

interface CrawlerResult<T> {
  ok: boolean;
  status?: number;
  data?: T;
  error?: string;
}

async function crawlerKeysFetch<T>(
  supabase: SupabaseServerClient,
  path: string,
  init: RequestInit = {},
): Promise<CrawlerResult<T>> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) return { ok: false, error: "no_session" };

  const base = process.env.CRAWLER_API_URL;
  if (!base) {
    console.error("api-keys: CRAWLER_API_URL is not set");
    return { ok: false, error: "crawler_unconfigured" };
  }

  try {
    const res = await fetch(`${base}/api/keys${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) {
      return { ok: false, status: res.status, error: json?.message || json?.error || `status_${res.status}` };
    }
    return { ok: true, status: res.status, data: json as T };
  } catch (err) {
    console.error("api-keys: error calling crawler:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listApiKeys(
  supabase: SupabaseServerClient,
): Promise<CrawlerResult<{ keys: ApiKeyRecord[] }>> {
  return crawlerKeysFetch<{ keys: ApiKeyRecord[] }>(supabase, "");
}

export async function createApiKey(
  supabase: SupabaseServerClient,
  input: { name: string; scopes: string[] },
): Promise<CrawlerResult<{ key: string; record: ApiKeyRecord }>> {
  return crawlerKeysFetch<{ key: string; record: ApiKeyRecord }>(supabase, "", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function revokeApiKey(
  supabase: SupabaseServerClient,
  id: string,
): Promise<CrawlerResult<{ record: unknown }>> {
  return crawlerKeysFetch<{ record: unknown }>(supabase, `/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
  });
}
