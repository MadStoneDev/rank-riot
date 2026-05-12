/**
 * Simple in-memory rate limiter using a sliding window approach.
 * Tracks requests per IP address with automatic cleanup.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Create a rate limiter instance for a specific route.
 * Each call with a unique `name` returns a limiter backed by its own store.
 */
export function createRateLimiter(name: string, options: RateLimiterOptions) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  return {
    /**
     * Check whether the given key (typically an IP) is within rate limits.
     * Returns { allowed: true } or { allowed: false, retryAfterMs }.
     */
    check(key: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry) {
        store.set(key, { timestamps: [now] });
        return { allowed: true };
      }

      // Remove timestamps outside the current window
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < options.windowMs,
      );

      if (entry.timestamps.length >= options.maxRequests) {
        const oldest = entry.timestamps[0];
        const retryAfterMs = options.windowMs - (now - oldest);
        return { allowed: false, retryAfterMs };
      }

      entry.timestamps.push(now);
      return { allowed: true };
    },
  };
}

/**
 * Extract a client identifier from a request for rate-limiting purposes.
 * Prefers the X-Forwarded-For header (first IP), falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
