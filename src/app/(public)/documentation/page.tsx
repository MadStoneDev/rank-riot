import { Metadata } from "next";
import Link from "next/link";
import {
  IconRocket,
  IconSearch,
  IconFileAnalytics,
  IconWorld,
  IconBug,
  IconArrowRight,
  TablerIcon,
} from "@tabler/icons-react";
import { getArticlesByCategory } from "./articles";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to get the most out of RankRiot. Guides on scan types, how scores are calculated, crawler behaviour, and issue detection.",
  alternates: { canonical: "/documentation" },
};

const CATEGORY_ICONS: Record<string, TablerIcon> = {
  "Getting Started": IconRocket,
  "Site Crawling": IconSearch,
  "Reports & Analysis": IconFileAnalytics,
  "AEO & GEO": IconWorld,
  "Issue Detection": IconBug,
};

export default function DocumentationPage() {
  const groups = getArticlesByCategory();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border-default)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-base)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Documentation
            </h1>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] leading-relaxed">
              Everything you need to get started with RankRiot and make the most
              of your SEO analysis &mdash; from scan types to exactly how your
              scores are calculated.
            </p>
          </div>
        </div>
      </section>

      {/* Documentation by category */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {groups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category] ?? IconFileAnalytics;
            return (
              <div key={group.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    {group.category}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/documentation/${article.slug}`}
                      className="group p-6 rounded-2xl border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all flex flex-col"
                    >
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        {article.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] text-sm mb-4 flex-1">
                        {article.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Read article
                        <IconArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-24 bg-[var(--color-surface-raised)] border-t border-[var(--color-border-default)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Our support team is here to help. Reach out and we&apos;ll get back to
              you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
