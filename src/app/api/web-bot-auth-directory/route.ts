import { NextResponse } from "next/server";

/**
 * Web Bot Auth key directory. Publishes RankRiot's public Ed25519 key so
 * verifiers (Cloudflare, Shopify, etc.) can validate the HTTP Message
 * Signatures the crawler attaches to its requests. The crawler signs with the
 * matching private key and points its Signature-Agent header at this origin.
 *
 * Served at /.well-known/http-message-signatures-directory via a rewrite in
 * next.config.ts. Set WEB_BOT_AUTH_PUBLIC_JWK to the public JWK printed by the
 * crawler's scripts/generate-web-bot-auth-keys.mjs. Returns 404 until set.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.WEB_BOT_AUTH_PUBLIC_JWK;
  if (!raw) {
    return new NextResponse("Web Bot Auth key directory is not configured", {
      status: 404,
    });
  }

  let jwk: Record<string, unknown>;
  try {
    jwk = JSON.parse(raw);
  } catch {
    return new NextResponse("WEB_BOT_AUTH_PUBLIC_JWK is not valid JSON", {
      status: 500,
    });
  }

  // A JWK Set containing our public key(s). Build the response explicitly so the
  // directory media type is used (NextResponse.json would force application/json).
  return new NextResponse(JSON.stringify({ keys: [jwk] }), {
    status: 200,
    headers: {
      "Content-Type": "application/http-message-signatures-directory+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
