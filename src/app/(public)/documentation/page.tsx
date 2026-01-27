import { Metadata } from "next";
import Link from "next/link";
import {
  IconRocket,
  IconSearch,
  IconFileAnalytics,
  IconBug,
  IconChartBar,
  IconSettings,
  IconArrowRight,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Documentation | RankRiot",
  description:
    "Learn how to get the most out of RankRiot. Guides, tutorials, and reference documentation for SEO analysis.",
};

const guides = [
  {
    icon: IconRocket,
    title: "Getting Started",
    description: "Set up your first project and run your initial site crawl.",
    href: "#getting-started",
    articles: [
      "Creating your account",
      "Adding your first project",
      "Understanding scan types",
      "Reading your first report",
    ],
  },
  {
    icon: IconSearch,
    title: "Site Crawling",
    description: "Deep dive into how our crawler works and what it detects.",
    href: "#crawling",
    articles: [
      "How the crawler works",
      "Crawl settings and limits",
      "Scheduled scans",
      "Handling JavaScript sites",
    ],
  },
  {
    icon: IconBug,
    title: "Issue Detection",
    description: "Understanding the SEO issues RankRiot identifies.",
    href: "#issues",
    articles: [
      "Broken links and 404s",
      "Redirect chains",
      "Missing meta tags",
      "Duplicate content",
    ],
  },
  {
    icon: IconFileAnalytics,
    title: "Reports & Analysis",
    description: "Learn to interpret reports and prioritize fixes.",
    href: "#reports",
    articles: [
      "Understanding scores",
      "Issue prioritization",
      "Historical tracking",
      "Exporting data",
    ],
  },
  {
    icon: IconChartBar,
    title: "Performance",
    description: "Track and improve your site's technical performance.",
    href: "#performance",
    articles: [
      "Core Web Vitals",
      "Page load analysis",
      "Image optimization",
      "Resource analysis",
    ],
  },
  {
    icon: IconSettings,
    title: "Account & Billing",
    description: "Manage your account, team, and subscription.",
    href: "#account",
    articles: [
      "Subscription plans",
      "Team management",
      "Billing settings",
      "Usage limits",
    ],
  },
];

export default function DocumentationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Documentation
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              Everything you need to get started with RankRiot and make the most
              of your SEO analysis.
            </p>

            {/* Search */}
            <div className="mt-8 relative">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <span className="text-sm text-neutral-500">Quick links:</span>
            <Link
              href="#getting-started"
              className="text-sm text-primary hover:underline"
            >
              Getting Started
            </Link>
            <Link href="#crawling" className="text-sm text-primary hover:underline">
              Site Crawling
            </Link>
            <Link href="#issues" className="text-sm text-primary hover:underline">
              Issue Detection
            </Link>
            <Link href="#reports" className="text-sm text-primary hover:underline">
              Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide, i) => (
              <div
                key={i}
                id={guide.href.replace("#", "")}
                className="group p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <guide.icon className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  {guide.title}
                </h2>
                <p className="text-neutral-600 text-sm mb-4">
                  {guide.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {guide.articles.map((article, j) => (
                    <li key={j}>
                      <a
                        href={`${guide.href}/${article.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-neutral-600 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>

                <a
                  href={guide.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                >
                  View all
                  <IconArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-neutral-600 mb-8">
              Our support team is here to help. Reach out and we&apos;ll get back to
              you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="https://github.com/rankriot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-white transition-colors"
              >
                Open GitHub Issue
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
