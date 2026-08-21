import { NextResponse } from "next/server";

/**
 * Validate that the request Origin header matches the expected app origin.
 * Returns null if valid, or a NextResponse with 403 if the origin is invalid.
 *
 * For requests without an Origin header (e.g. server-to-server webhooks),
 * validation is skipped (returns null).
 */
export function validateOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");

  // No origin header — likely a same-origin navigation or server-to-server call.
  // Browser-initiated cross-origin requests always include Origin.
  if (!origin) return null;

  // Preferred: an explicitly configured origin. Falls back to the origin the
  // request was actually served on (via the proxy's forwarded host) so a missing
  // NEXT_PUBLIC_BASE_URL can't 500 every POST. This is still a valid same-origin
  // CSRF check: a cross-site attacker controls neither the browser's Origin
  // header nor the proxy-set forwarded host.
  const configured = process.env.NEXT_PUBLIC_BASE_URL || "";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const derived = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "";

  const allowedOrigin = configured || derived;
  if (!allowedOrigin) {
    // Fail closed only if we have neither a configured nor a derivable origin.
    console.error("CSRF check failed: no configured or derivable origin");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }
  if (!configured) {
    console.warn(
      "NEXT_PUBLIC_BASE_URL not set — validating Origin against forwarded host",
    );
  }

  // Normalize: strip trailing slashes for comparison
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const normalizedAllowed = allowedOrigin.replace(/\/+$/, "");

  if (normalizedOrigin !== normalizedAllowed) {
    return NextResponse.json(
      { error: "Forbidden: invalid origin" },
      { status: 403 },
    );
  }

  return null;
}
