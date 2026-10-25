// Single source for the app's public base URL. Auth emails broke because
// nothing passed `emailRedirectTo`, so Supabase fell back to its own SITE_URL
// (https://supabase.rankriot.app) and links pointed at the API host instead of
// the app. Every auth call that sends email now derives its redirect from here.
//
// NEXT_PUBLIC_SITE_URL is the canonical variable; NEXT_PUBLIC_BASE_URL is the
// older name already set in production, kept as a fallback so this can ship
// without a production env change. No trailing slash.
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://rankriot.app";
  return raw.replace(/\/+$/, "");
}
