import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconSearch,
  IconChartLine,
  IconBug,
  IconFileAnalytics,
  IconArrowRight,
  IconCheck,
  IconBolt,
  IconWorld,
} from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "RankRiot - Technical SEO Analysis for Developers & Professionals",
  description:
    "Comprehensive site audits, broken link detection, and actionable SEO insights. Built for developers and SEO professionals who value precision.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-base)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-sm text-[var(--color-primary)] mb-8">
              <span className="w-2 h-2 bg-[var(--color-score-good)] rounded-full mr-2 animate-pulse" />
              Now with AEO &amp; GEO readiness analysis
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-[var(--color-text-primary)]">Technical SEO analysis</span>
              <span className="block gradient-text">
                without the complexity
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Comprehensive site audits, AEO/GEO readiness scoring, and actionable
              insights. Built for developers and SEO professionals who value
              precision over noise.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-all glow-blue"
              >
                Start Free Analysis
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-overlay)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-default)] rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>

            {/* Trust indicators */}
            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
              No credit card required · Free plan includes 2 projects
            </p>
          </div>

          {/* Product Screenshot Area */}
          <div className="mt-16 lg:mt-20">
            <div className="relative mx-auto max-w-5xl">
              {/* Browser mockup */}
              <div className="relative rounded-xl glass-card-elevated overflow-hidden shadow-2xl shadow-black/40">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border-subtle)]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-score-critical)]" />
                    <div className="w-3 h-3 rounded-full bg-[var(--color-score-warning)]" />
                    <div className="w-3 h-3 rounded-full bg-[var(--color-score-good)]" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-md mx-auto px-4 py-1.5 bg-[var(--color-surface-overlay)] rounded-md text-xs text-[var(--color-text-muted)] text-center">
                      app.rankriot.app/projects
                    </div>
                  </div>
                </div>

                {/* Screenshot placeholder */}
                <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-base)] flex items-center justify-center">
                  <div className="text-center text-[var(--color-text-muted)]">
                    <p className="text-sm">Dashboard Screenshot</p>
                    <p className="text-xs mt-1">1920 x 1080 recommended</p>
                  </div>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: "100K+", label: "Pages analyzed" },
              { value: "2,500+", label: "SEO issues detected" },
              { value: "99.9%", label: "Uptime reliability" },
              { value: "<3s", label: "Average scan time per page" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
              Everything you need to optimize
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Professional-grade tools without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: IconSearch,
                title: "SEO Analysis",
                description:
                  "Deep crawling with on-page SEO scoring, meta tag analysis, and content optimization recommendations.",
              },
              {
                icon: IconWorld,
                title: "AEO / GEO Readiness",
                description:
                  "Answer Engine and Generative Engine Optimization scoring to stay ahead of AI-driven search.",
              },
              {
                icon: IconBug,
                title: "Technical Health",
                description:
                  "Broken links, redirect chains, security headers, and Core Web Vitals monitoring in one place.",
              },
              {
                icon: IconBolt,
                title: "Actionable Insights",
                description:
                  "Issues prioritized by impact with clear fix instructions. No jargon, no noise, just results.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group glass-card p-6 surface-interactive"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[var(--color-surface-raised)] border-y border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
              Start analyzing in minutes
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              No complex setup. No learning curve. Just results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: "01",
                title: "Add your website",
                description:
                  "Enter your URL and choose between a quick audit or comprehensive SEO analysis.",
              },
              {
                step: "02",
                title: "We crawl and analyze",
                description:
                  "Our crawler examines every page, checking for technical issues, SEO problems, and opportunities.",
              },
              {
                step: "03",
                title: "Get actionable insights",
                description:
                  "Receive prioritized recommendations with clear explanations and fix instructions.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-[var(--color-text-muted)]/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
                {i < 2 && (
                  <IconArrowRight className="hidden md:block absolute top-8 -right-8 w-6 h-6 text-[var(--color-text-muted)]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                Reports that actually make sense
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                No jargon. No overwhelming data dumps. Our reports prioritize
                issues by impact and give you clear, actionable steps to fix
                them.
              </p>

              <ul className="space-y-4">
                {[
                  "Issues prioritized by SEO impact",
                  "Clear explanations in plain English",
                  "Step-by-step fix instructions",
                  "Progress tracking over time",
                  "Export to CSV for your team",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 bg-[var(--color-score-good)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconCheck className="w-3 h-3 text-[var(--color-score-good)]" />
                    </div>
                    <span className="text-[var(--color-text-secondary)]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors glow-blue"
                >
                  Try it free
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] glass-card-elevated flex items-center justify-center">
                <div className="text-center text-[var(--color-text-muted)]">
                  <p className="text-sm">Report Screenshot</p>
                  <p className="text-xs mt-1">800 x 600 recommended</p>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-[var(--color-primary)]/5 rounded-2xl -z-10 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl glass-card-elevated px-8 py-16 sm:px-16 sm:py-24">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent" />

            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                Ready to improve your site&apos;s SEO?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                Start with a free account. No credit card required. Upgrade when
                you need more power.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors glow-blue"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                >
                  Compare Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
