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

  const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (!allowedOrigin) {
    // Fail closed: without a configured origin we cannot verify the request.
    console.error("CSRF check failed: NEXT_PUBLIC_BASE_URL is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
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
