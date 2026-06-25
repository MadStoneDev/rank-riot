import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://public.profitwell.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.paddle.com https://cloudflareinsights.com`,
  "frame-src 'self' https://*.paddle.com",
].join("; ");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Web Bot Auth key directory. Served from an /api route handler so it
        // doesn't depend on dot-folder app routing.
        source: "/.well-known/http-message-signatures-directory",
        destination: "/api/web-bot-auth-directory",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
