// Mirrors crawl-rank-riot/src/utils/link-status.ts. These statuses mean the
// target blocked our crawler (bot wall / rate limit / auth / unavailable), not
// that the link is dead — so they're shown as "blocked (couldn't verify)"
// rather than broken (P0.4). The crawler already stores is_broken=false for
// these, keeping the stored http_status.
export const BLOCKED_LINK_STATUSES = [401, 403, 429, 503, 999] as const;

export function isBlockedLinkStatus(
  status: number | null | undefined,
): boolean {
  return status != null && (BLOCKED_LINK_STATUSES as readonly number[]).includes(status);
}
