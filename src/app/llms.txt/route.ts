const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rankriot.app";

// https://llmstxt.org/ — a concise, AI-readable map of the site.
const body = `# RankRiot

> RankRiot is an SEO intelligence platform: technical site audits, AEO/GEO
> (Answer Engine / Generative Engine) readiness scoring, broken-link and
> redirect-chain detection, and prioritised, actionable fix recommendations.
> Built for developers and SEO professionals. A free plan is available.

## Pages

- [Home](${baseUrl}/): Product overview and key features.
- [Pricing](${baseUrl}/pricing): Plans, limits, and feature comparison.
- [Documentation](${baseUrl}/documentation): How scans, scoring, and reports work.
- [About](${baseUrl}/about): What RankRiot is and who it's for.
- [Contact](${baseUrl}/contact): Get in touch.
- [RankRiotBot](${baseUrl}/bot): Our web crawler, its behaviour, and how to identify it.

## Legal

- [Privacy Policy](${baseUrl}/privacy)
- [Terms of Service](${baseUrl}/terms)
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
