// Login/auth/cart/account-style pages legitimately carry little body text, so
// content-volume heuristics (e.g. thin content) should not penalise them. Kept
// in sync with the crawler's isUtilityPage (crawl-rank-riot/src/utils/url.ts).
const UTILITY_PAGE_PATTERN =
  /\/(login|log-in|logout|log-out|signin|sign-in|signout|sign-out|register|signup|sign-up|account|my-account|password|forgot-password|reset-password|cart|basket|checkout|wishlist|auth|2fa|verify|verification)(\/|$|\?|#)/i;

export function isUtilityPage(url: string): boolean {
  try {
    return UTILITY_PAGE_PATTERN.test(new URL(url).pathname);
  } catch {
    return UTILITY_PAGE_PATTERN.test(url);
  }
}

/**
 * Truncate URL for display, showing pathname only when parseable.
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path.length <= maxLength) return path;
    return path.substring(0, maxLength - 3) + "...";
  } catch {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  }
}
