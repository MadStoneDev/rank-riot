import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RankRiotBot — Our Web Crawler | RankRiot",
  description:
    "About RankRiotBot, the RankRiot web crawler: what it does, how to identify it, and how to allowlist it on your site.",
};

// User-Agent must match crawl-rank-riot/src/config/identity.ts
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (compatible; RankRiotBot/1.0; +https://rankriot.app/bot)";

export default function BotInfoPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border-default)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-base)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
              RankRiotBot
            </h1>
            <p className="mt-4 text-lg text-[var(--color-text-muted)]">
              RankRiotBot is the web crawler RankRiot uses to analyse websites
              for SEO, AEO and GEO. It only scans sites that a RankRiot customer
              has added as their own project.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
              How to identify our crawler
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-3">
              RankRiotBot sends this User-Agent string with every request:
            </p>
            <pre className="overflow-x-auto rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] p-4 text-xs text-[var(--color-text-primary)]">
              <code className="select-all">{USER_AGENT}</code>
            </pre>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
              How we crawl
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-[var(--color-text-secondary)]">
              <li>We respect <code>robots.txt</code> directives.</li>
              <li>
                We request HTML pages and read references to assets — we do not
                download image or video files.
              </li>
              <li>
                We crawl at a polite rate and only scan sites our customers own
                and have added to their account.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
              Allowlisting RankRiotBot
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-3">
              If your host or security plugin (SiteGround, Cloudflare, Sucuri,
              Wordfence and similar) blocks our crawler, your scans will be
              incomplete. To fix this, allowlist RankRiotBot — by IP (most
              reliable) or by the User-Agent above. The exact crawler IP is
              shown on your project page when a block is detected, and is also
              visible in your server access logs next to our User-Agent.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              Need a hand?{" "}
              <Link href="/contact" className="text-secondary hover:underline">
                Contact us
              </Link>{" "}
              and we&apos;ll provide our current crawler IP ranges.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
