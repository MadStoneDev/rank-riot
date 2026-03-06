/**
 * Validate that a URL uses a safe protocol (http, https, or relative path).
 * Prevents javascript:, data:, vbscript: and other dangerous protocols
 * from being rendered in href/src attributes.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    // Relative URLs without a base will throw — treat as safe
    // (they'll resolve relative to the current page)
    return !trimmed.includes(":");
  }
}

/**
 * Return the URL if safe, otherwise return a fallback.
 */
export function safeHref(url: string | null | undefined, fallback = "#"): string {
  return isSafeUrl(url) ? url! : fallback;
}
