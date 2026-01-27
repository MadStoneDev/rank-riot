import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconSearch,
  IconChartLine,
  IconBug,
  IconFileAnalytics,
  IconClock,
  IconShieldCheck,
  IconArrowRight,
  IconCheck,
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
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Now with automated weekly scans
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-tight">
              Technical SEO analysis
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                without the complexity
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive site audits, broken link detection, and actionable
              insights. Built for developers and SEO professionals who value
              precision over noise.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:shadow-neutral-900/20"
              >
                Start Free Analysis
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>

            {/* Trust indicators */}
            <p className="mt-6 text-sm text-neutral-500">
              No credit card required · Free plan includes 2 projects
            </p>
          </div>

          {/* Product Screenshot Area */}
          <div className="mt-16 lg:mt-20">
            <div className="relative mx-auto max-w-5xl">
              {/* Browser mockup */}
              <div className="relative rounded-xl bg-neutral-900 shadow-2xl shadow-neutral-900/20 overflow-hidden">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-md mx-auto px-4 py-1.5 bg-neutral-700 rounded-md text-xs text-neutral-400 text-center">
                      app.rankriot.app/projects
                    </div>
                  </div>
                </div>

                {/* Screenshot placeholder - Replace with actual screenshot */}
                <div className="aspect-[16/9] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <p className="text-sm">Dashboard Screenshot</p>
                    <p className="text-xs mt-1">1920 × 1080 recommended</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: "100K+", label: "Pages analyzed" },
              { value: "2,500+", label: "SEO issues detected" },
              { value: "99.9%", label: "Uptime reliability" },
              { value: "<3s", label: "Average scan time per page" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-neutral-900">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Everything you need to optimize
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Professional-grade tools without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: IconSearch,
                title: "Deep Site Crawling",
                description:
                  "Analyze up to 100,000 pages per scan. Discover every corner of your site with our intelligent crawler.",
              },
              {
                icon: IconBug,
                title: "Broken Link Detection",
                description:
                  "Find and fix 404s, redirects, and broken resources before they impact your rankings.",
              },
              {
                icon: IconFileAnalytics,
                title: "On-Page SEO Analysis",
                description:
                  "Title tags, meta descriptions, headings, and content analysis with actionable recommendations.",
              },
              {
                icon: IconChartLine,
                title: "Performance Metrics",
                description:
                  "Core Web Vitals, load times, and performance scores for every page on your site.",
              },
              {
                icon: IconClock,
                title: "Scheduled Monitoring",
                description:
                  "Set up daily or weekly scans. Get notified when issues arise before they become problems.",
              },
              {
                icon: IconShieldCheck,
                title: "Security Analysis",
                description:
                  "HTTPS validation, mixed content detection, and security header analysis.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Start analyzing in minutes
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
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
                <div className="text-6xl font-bold text-neutral-800 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
                {i < 2 && (
                  <IconArrowRight className="hidden md:block absolute top-8 -right-8 w-6 h-6 text-neutral-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight with Image */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
                Reports that actually make sense
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
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
                    <div className="mt-1 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Try it free
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <p className="text-sm">Report Screenshot</p>
                  <p className="text-xs mt-1">800 × 600 recommended</p>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Trusted by SEO professionals
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              See why teams choose RankRiot for their technical SEO needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Finally, an SEO tool that doesn't require a PhD to understand. The reports are clear and the recommendations actually work.",
                author: "Sarah Chen",
                role: "SEO Lead",
                company: "Tech Startup",
              },
              {
                quote:
                  "We switched from a major competitor and cut our costs by 60% while getting more detailed analysis. The value is unmatched.",
                author: "Marcus Johnson",
                role: "Digital Marketing Manager",
                company: "E-commerce Brand",
              },
              {
                quote:
                  "The broken link detection alone has saved us countless hours. It catches issues before they impact our rankings.",
                author: "Emily Rodriguez",
                role: "Web Developer",
                company: "Agency",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-neutral-200"
              >
                <p className="text-neutral-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-8 py-16 sm:px-16 sm:py-24">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to improve your site&apos;s SEO?
              </h2>
              <p className="text-lg text-neutral-400 mb-8">
                Start with a free account. No credit card required. Upgrade when
                you need more power.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 rounded-lg transition-colors"
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
