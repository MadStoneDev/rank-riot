import { Metadata } from "next";
import Link from "next/link";
import {
  IconTarget,
  IconHeart,
  IconBolt,
  IconUsers,
  IconArrowRight,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "About | RankRiot",
  description:
    "RankRiot is built by developers for developers. We create professional SEO tools that are simple, affordable, and actually useful.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-base)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-[var(--color-text-primary)]">Built by developers,</span>
              <span className="block gradient-text">
                for developers
              </span>
            </h1>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] leading-relaxed">
              We got tired of overpriced, overcomplicated SEO tools. So we built
              something better -- professional-grade analysis without the
              enterprise price tag or learning curve.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                Our story
              </h2>
              <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed">
                <p>
                  RankRiot started from a simple frustration: every SEO tool on
                  the market was either too expensive, too complicated, or both.
                  As developers who needed to audit client sites, we were stuck
                  choosing between enterprise tools with four-figure monthly
                  bills or free tools that barely scratched the surface.
                </p>
                <p>
                  We wanted something in between -- a tool with serious crawling
                  power and actionable insights, but without the bloat and
                  without breaking the bank. When we couldn&apos;t find it, we built
                  it ourselves.
                </p>
                <p>
                  Today, RankRiot helps developers, SEO professionals, and
                  agencies analyze websites with the same depth as enterprise
                  tools, at a fraction of the cost. Because good SEO analysis
                  shouldn&apos;t require a Fortune 500 budget.
                </p>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] glass-card-elevated flex items-center justify-center">
                <div className="text-center text-[var(--color-text-muted)]">
                  <p className="text-sm">Team or Product Image</p>
                  <p className="text-xs mt-1">800 x 600 recommended</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-[var(--color-primary)]/5 rounded-2xl -z-10 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-y border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              What we believe
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: IconBolt,
                title: "Simplicity first",
                description:
                  "Powerful doesn't have to mean complicated. We strip away the noise so you can focus on what matters.",
              },
              {
                icon: IconTarget,
                title: "Actionable insights",
                description:
                  "Data without direction is just noise. Every report includes clear, prioritized recommendations.",
              },
              {
                icon: IconHeart,
                title: "Fair pricing",
                description:
                  "Professional tools at honest prices. No enterprise-only features, no artificial limitations.",
              },
              {
                icon: IconUsers,
                title: "Developer-friendly",
                description:
                  "Built with technical users in mind. Clean data, sensible defaults, and no hand-holding.",
              },
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 glass-card-elevated rounded-xl mb-4">
                  <value.icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {value.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we focus on */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              What we focus on
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              The core areas where RankRiot delivers real value
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Technical SEO",
                description:
                  "Broken links, redirect chains, missing meta tags, duplicate content, and the technical issues that actually impact rankings.",
              },
              {
                title: "Site architecture",
                description:
                  "Crawl depth analysis, internal linking opportunities, orphan page detection, and structure optimization.",
              },
              {
                title: "Performance",
                description:
                  "Page load metrics, Core Web Vitals tracking, image optimization recommendations, and resource analysis.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card p-6 surface-interactive"
              >
                <div className="text-4xl font-bold text-[var(--color-text-muted)]/20 mb-4">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl glass-card-elevated px-8 py-16 sm:px-16 sm:py-24">
            {/* Glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent" />

            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                Ready to see RankRiot in action?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto">
                Start with a free account and run your first analysis. No credit
                card required.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors glow-blue"
              >
                Get Started Free
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
