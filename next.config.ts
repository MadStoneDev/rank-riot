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
  // Don't advertise the framework/version to visitors.
  poweredByHeader: false,
  async redirects() {
    // Permanent redirects from the retiring classic (private) routes to their
    // redesign equivalents, added BEFORE the classic routes/components are
    // deleted so existing deep links and bookmarks never 404 (F-R07 + Stage-2
    // kill-list). :id / :pageId map straight through (same DB ids). These
    // sources match exact segments, so "/pages/:pageId" never matches
    // "/pages-redesign/...". The classic audit dispatcher /projects/:id is
    // intentionally NOT redirected — audit projects still render there (F-R08).
    return [
      {
        source: "/projects/:id/pages/:pageId",
        destination: "/projects/:id/pages-redesign/:pageId",
        permanent: true,
      },
      {
        source: "/projects/:id/pages",
        destination: "/projects/:id/pages-redesign",
        permanent: true,
      },
      {
        source: "/projects/:id/settings",
        destination: "/projects/:id/settings-redesign",
        permanent: true,
      },
      { source: "/projects", destination: "/overview", permanent: true },
      { source: "/projects/new", destination: "/overview", permanent: true },
      { source: "/dashboard", destination: "/overview", permanent: true },
    ];
  },
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
