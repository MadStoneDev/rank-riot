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

// Human label for page_links.link_error (set when a probe failed with status 0).
const LINK_ERROR_LABELS: Record<string, string> = {
  dns_not_found: "DNS not found",
  connection_refused: "connection refused",
  timeout: "timed out",
  tls_error: "TLS/certificate error",
  network_error: "network error",
};

export function describeLinkError(reason: string | null | undefined): string {
  if (!reason) return "";
  return LINK_ERROR_LABELS[reason] ?? reason;
}

// Only dns_not_found / connection_refused mean genuinely broken; the rest
// ("couldn't verify") shouldn't be presented as a dead link (P0 follow-up #2).
export function linkErrorIsBroken(reason: string | null | undefined): boolean {
  return reason === "dns_not_found" || reason === "connection_refused";
}
