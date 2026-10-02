import { ReactNode } from "react";

// Real documentation content. Each article renders inside a `prose` wrapper on
// the article page, so bodies use plain h2/h3/p/ul elements.
//
// Accuracy note: the scoring and scan-type descriptions below reflect the
// actual implementation in crawl-rank-riot (score-report.ts, scanner.ts,
// scheduler.ts, audit-analyzer.ts). Keep them in sync if the scorer changes.

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  body: ReactNode;
};

export const CATEGORY_ORDER = [
  "Getting Started",
  "Site Crawling",
  "Reports & Analysis",
  "AEO & GEO",
  "Issue Detection",
] as const;

export const articles: Article[] = [
  {
    slug: "adding-your-first-project",
    title: "Adding your first project and running a scan",
    description:
      "Create a project, choose a scan type, and run your first analysis in a couple of minutes.",
    category: "Getting Started",
    body: (
      <>
        <p>
          A <strong>project</strong> in RankRiot represents one website you want
          to analyse. Once you&apos;ve created your account, here&apos;s how to get your
          first results.
        </p>
        <h2>1. Create a project</h2>
        <p>
          From your dashboard, choose <strong>New project</strong> and enter the
          website&apos;s URL. You&apos;ll pick a <strong>project type</strong> &mdash; either
          a full <em>SEO</em> project or a lightweight <em>Audit</em> project.
          The two behave differently; see{" "}
          <a href="/documentation/scan-types">Understanding scan types</a> to
          choose the right one.
        </p>
        <h2>2. Run a scan</h2>
        <p>
          A scan can run on demand (press <strong>Scan now</strong>) or on a
          schedule you set on the project. RankRiot&apos;s crawler visits your pages,
          follows internal links, and records what it finds. How many pages it
          will visit depends on your plan&apos;s per-scan page limit.
        </p>
        <h2>3. Read your report</h2>
        <p>
          When the scan finishes you&apos;ll see an overall score, a breakdown by
          category, and a prioritised list of issues. Start with{" "}
          <a href="/documentation/understanding-your-scores">
            Understanding your scores
          </a>{" "}
          to interpret the numbers, then work down the issue list.
        </p>
        <h2>Plan limits</h2>
        <p>
          The number of projects, pages per scan, scan frequency, and data
          history you get are set by your plan. See the{" "}
          <a href="/pricing">pricing page</a> for the current limits.
        </p>
      </>
    ),
  },
  {
    slug: "scan-types",
    title: "Understanding scan types",
    description:
      "RankRiot runs two kinds of scan: a full SEO crawl and a lightweight site audit. Here's how they differ.",
    category: "Getting Started",
    body: (
      <>
        <p>
          RankRiot projects come in two types. Choosing the right one depends on
          whether you want a deep technical crawl or a fast high-level read on a
          site.
        </p>
        <h2>SEO scan (full crawl)</h2>
        <p>
          An SEO project runs a full crawl of your site, up to your plan&apos;s
          per-scan page limit. It discovers pages by following internal links
          and records, for each page, its status, metadata, headings, links,
          images, and load time. From this it produces:
        </p>
        <ul>
          <li>Per-category scores (technical, content, media, and AEO)</li>
          <li>A prioritised list of issues (broken links, redirects, missing metadata, and more)</li>
          <li>Historical tracking, so you can see scores move over time</li>
        </ul>
        <p>
          This is the right choice for a site you own or manage and want to
          improve and monitor.
        </p>
        <h2>Audit scan (lightweight)</h2>
        <p>
          An Audit project is a fast, high-level assessment that looks at a small
          number of key pages (up to around 50). Instead of a deep technical
          crawl it produces a snapshot: a set of headline scores covering areas
          such as modernisation, performance, and completeness, along with a
          read on the site&apos;s technology and any obviously missing pages.
        </p>
        <p>
          It&apos;s designed for quickly sizing up a site &mdash; for example, a
          prospect&apos;s site or a site you&apos;re evaluating &mdash; without committing
          to a full crawl.
        </p>
        <h2>Which should I use?</h2>
        <ul>
          <li>
            <strong>Ongoing optimisation of a site you control</strong> &rarr; SEO
            scan.
          </li>
          <li>
            <strong>A fast first impression of any site</strong> &rarr; Audit scan.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: "how-the-crawler-works",
    title: "How the crawler works",
    description:
      "What RankRiotBot does when it visits your site, how it identifies itself, and how crawl limits and scheduling work.",
    category: "Site Crawling",
    body: (
      <>
        <p>
          RankRiot analyses sites with its own crawler, <strong>RankRiotBot</strong>.
          When you start a scan, the crawler fetches a page, reads its HTML,
          records what it finds, and follows internal links to discover more
          pages &mdash; up to your plan&apos;s per-scan page limit.
        </p>
        <h2>How it identifies itself</h2>
        <p>
          RankRiotBot sends a clear, identifiable user-agent string and respects
          your site&apos;s <code>robots.txt</code> directives and reasonable rate
          limits. If you need to allowlist it on a firewall or WAF, see the{" "}
          <a href="/bot">RankRiotBot information page</a> for the exact
          user-agent and guidance.
        </p>
        <h2>Crawl limits</h2>
        <p>
          Each plan sets a maximum number of pages per scan. A scan stops once it
          reaches that limit, prioritising pages reachable from your homepage.
          Scheduled scans may use a smaller page budget than on-demand scans to
          keep recurring runs efficient.
        </p>
        <h2>On-demand vs. scheduled scans</h2>
        <p>
          You can trigger a scan at any time with <strong>Scan now</strong>. You
          can also set a project to scan automatically on a daily, weekly, or
          monthly cadence; RankRiot then re-scans the site on that schedule and
          updates your scores and issues so you can track progress without
          lifting a finger.
        </p>
        <h2>JavaScript-rendered sites</h2>
        <p>
          The crawler reads the HTML that a page returns. For content that is
          critical to SEO, make sure it is present in the server-rendered HTML
          (or pre-rendered) rather than only appearing after client-side
          JavaScript runs &mdash; that&apos;s also what most search-engine crawlers see
          most reliably.
        </p>
      </>
    ),
  },
  {
    slug: "understanding-your-scores",
    title: "Understanding your scores",
    description:
      "Exactly how RankRiot calculates your overall score and the technical, content, media, and AEO category scores.",
    category: "Reports & Analysis",
    body: (
      <>
        <p>
          Every SEO scan produces an <strong>overall score</strong> out of 100,
          built from four category scores. Each category is measured directly
          from what the crawler found &mdash; there&apos;s no black box. Here&apos;s exactly
          how each one is calculated.
        </p>
        <h2>The four categories</h2>
        <h3>Technical (0&ndash;100)</h3>
        <p>
          The average of three site-wide pass rates across the pages crawled:
        </p>
        <ul>
          <li>Share of pages that returned a successful (2xx) HTTP status</li>
          <li>Share of pages that are indexable (not blocked by noindex/robots)</li>
          <li>Share of pages that loaded quickly (within about 3 seconds)</li>
        </ul>
        <h3>Content (0&ndash;100)</h3>
        <p>The average of four pass rates across your pages:</p>
        <ul>
          <li>Has a title tag</li>
          <li>Has a meta description</li>
          <li>Has a meaningful amount of body text (roughly 300+ words)</li>
          <li>Has an H1 heading</li>
        </ul>
        <h3>Media (0&ndash;100)</h3>
        <p>
          Your image alt-text coverage &mdash; the share of images across the site
          that have descriptive <code>alt</code> text. If a page has no images,
          it doesn&apos;t count against you.
        </p>
        <h3>AEO (0&ndash;100)</h3>
        <p>
          Answer Engine Optimization readiness: how machine-readable your pages
          are to AI answer engines. See{" "}
          <a href="/documentation/aeo-readiness">AEO &amp; GEO readiness</a> for
          the signals it measures.
        </p>
        <h2>How the overall score is formed</h2>
        <p>
          The overall score is the average of the four category scores. Because
          each category is itself an average of pass rates, improving any
          failing check on any page moves the needle.
        </p>
        <h3>Open issues cap the score</h3>
        <p>
          A high average shouldn&apos;t hide a serious problem. So if there are any
          open <strong>critical</strong> issues, the score is capped at 79; if
          there are open <strong>high</strong>-severity issues (but no critical),
          it&apos;s capped at 89. Clear the critical and high issues and the cap
          lifts. The same cap applies to each page&apos;s own score, so a page with
          a critical issue is never shown as &ldquo;well optimised&rdquo;.
        </p>
        <h2>Why a score might be zero</h2>
        <p>
          If the crawler is blocked (for example by a firewall or bot protection)
          or a scan returns no usable pages, scores are reported as{" "}
          <strong>0</strong> rather than a flattering number based on no data. A
          sudden drop to zero usually means the crawler couldn&apos;t reach your site
          &mdash; check that <a href="/bot">RankRiotBot</a> is allowlisted.
        </p>
      </>
    ),
  },
  {
    slug: "aeo-readiness",
    title: "AEO & GEO readiness",
    description:
      "What Answer Engine Optimization readiness measures, and why it matters as AI-driven search grows.",
    category: "AEO & GEO",
    body: (
      <>
        <p>
          As search shifts toward AI answer engines and generative results,
          being <em>machine-readable</em> matters as much as being
          human-readable. RankRiot&apos;s <strong>AEO readiness</strong> score
          measures how well your pages expose structured, unambiguous signals
          that answer engines rely on.
        </p>
        <h2>What AEO readiness measures</h2>
        <p>
          For each page, RankRiot checks for the presence of signals that help a
          machine understand and cite your content, including:
        </p>
        <ul>
          <li>Schema.org structured data (JSON-LD), and recognisable entity types such as Organization or LocalBusiness</li>
          <li>Open Graph metadata</li>
          <li>A descriptive title and meta description</li>
          <li>A clear H1 heading</li>
          <li>Enough substantive content to answer a question</li>
        </ul>
        <p>
          The score is the average, across your pages, of how many of these
          signals are present. Adding structured data and tightening metadata is
          usually the fastest way to raise it.
        </p>
        <h2>A note on GEO</h2>
        <p>
          Generative Engine Optimization (GEO) &mdash; tuning content for how
          generative AI systems summarise and cite it &mdash; is an area we&apos;re
          actively expanding. Today the readiness score focuses on the AEO
          signals above, which are the foundation GEO builds on. Deeper
          GEO-specific guidance is on our roadmap.
        </p>
      </>
    ),
  },
  {
    slug: "issues-detected",
    title: "Issues RankRiot detects",
    description:
      "The technical and on-page problems RankRiot surfaces, and how they're prioritised.",
    category: "Issue Detection",
    body: (
      <>
        <p>
          Alongside your scores, each SEO scan produces a list of concrete
          issues found on your pages. They map closely to the checks behind your
          category scores, so fixing them improves both your site and your
          numbers.
        </p>
        <h2>What we look for</h2>
        <ul>
          <li>
            <strong>Broken links and 404s</strong> &mdash; internal or external
            links that no longer resolve.
          </li>
          <li>
            <strong>Redirect chains</strong> &mdash; links that bounce through
            multiple hops before landing.
          </li>
          <li>
            <strong>Missing or duplicate titles and meta descriptions</strong> &mdash;
            pages without them, or sharing the same ones.
          </li>
          <li>
            <strong>Missing H1 headings</strong> &mdash; pages with no clear primary
            heading.
          </li>
          <li>
            <strong>Images without alt text</strong> &mdash; which hurt both
            accessibility and your media score.
          </li>
          <li>
            <strong>Slow or non-indexable pages</strong> &mdash; pages that load
            slowly or are blocked from being indexed.
          </li>
        </ul>
        <h2>How issues are prioritised</h2>
        <p>
          Issues are ordered by impact so you can start where it matters most,
          each with a plain-English explanation of what&apos;s wrong and how to fix
          it. You can export the full list to CSV (and, on Pro and Business
          plans, to PDF) to share with your team.
        </p>
      </>
    ),
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(): Array<{
  category: string;
  items: Article[];
}> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: articles.filter((a) => a.category === category),
  })).filter((group) => group.items.length > 0);
}
