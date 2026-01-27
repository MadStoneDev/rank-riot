import { Metadata } from "next";
import Link from "next/link";
import { IconCheck, IconX, IconArrowRight } from "@tabler/icons-react";
import { PLAN_INFO, PLAN_LIMITS } from "@/lib/subscription-limits";
import { PlanId } from "@/types/subscription";

export const metadata: Metadata = {
  title: "Pricing | RankRiot",
  description:
    "Simple, transparent pricing for SEO tools that help your website rank higher. Start free, upgrade when you need more.",
};

const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "business"];

const FEATURES: Array<{
  key: string;
  label: string;
  format: (v: number | string) => string;
}> = [
  {
    key: "projects",
    label: "Projects",
    format: (v) => (v === -1 ? "Unlimited" : String(v)),
  },
  {
    key: "pagesPerScan",
    label: "Pages per scan",
    format: (v) => Number(v).toLocaleString(),
  },
  {
    key: "scanFrequency",
    label: "Scan frequency",
    format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
  },
  {
    key: "keywords",
    label: "Keywords tracked",
    format: (v) => Number(v).toLocaleString(),
  },
  {
    key: "history",
    label: "Data history",
    format: (v) =>
      Number(v) >= 365
        ? `${Math.round(Number(v) / 365)} year${Number(v) >= 730 ? "s" : ""}`
        : `${Math.round(Number(v) / 30)} months`,
  },
  {
    key: "competitors",
    label: "Competitor tracking",
    format: (v) => String(v),
  },
  { key: "users", label: "Team members", format: (v) => String(v) },
];

const FEATURE_FLAGS = [
  { key: "csvExport", label: "CSV export" },
  { key: "pdfReports", label: "PDF reports" },
  { key: "dailyScans", label: "Daily scans" },
  { key: "onDemandScans", label: "On-demand scans" },
];

function getPlanFeatureValue(
  planId: PlanId,
  featureKey: string
): string | number | boolean {
  const limits = PLAN_LIMITS[planId];

  switch (featureKey) {
    case "projects":
      return limits.maxProjects;
    case "pagesPerScan":
      return limits.maxPagesPerScan;
    case "scanFrequency":
      return limits.scanFrequency;
    case "keywords":
      return limits.maxKeywords;
    case "history":
      return limits.historyDays;
    case "competitors":
      return limits.maxCompetitors;
    case "users":
      return limits.maxTeamMembers;
    case "csvExport":
      return true;
    case "pdfReports":
      return limits.features.pdfReports;
    case "dailyScans":
      return limits.scanFrequency === "daily";
    case "onDemandScans":
      return limits.features.onDemandScans;
    default:
      return "";
  }
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              Start free and scale as you grow. No hidden fees, no surprises.
              Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {PLAN_ORDER.map((planId) => {
            const info = PLAN_INFO[planId];
            const limits = PLAN_LIMITS[planId];
            const isPopular = info.popular;

            return (
              <div
                key={planId}
                className={`relative flex flex-col rounded-2xl border bg-white transition-all duration-300 ${
                  isPopular
                    ? "border-neutral-900 shadow-xl shadow-neutral-900/10 lg:scale-105 lg:z-10"
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center px-4 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 lg:p-8 flex-1 flex flex-col">
                  {/* Plan name and description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {info.name}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {info.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-neutral-900">
                        ${info.priceMonthly}
                      </span>
                      {info.priceMonthly > 0 && (
                        <span className="ml-1 text-neutral-500 text-sm">
                          /month
                        </span>
                      )}
                    </div>
                    {info.priceYearly > 0 && (
                      <p className="mt-1 text-xs text-neutral-500">
                        or ${Math.round(info.priceYearly / 12)}/mo billed
                        annually
                      </p>
                    )}
                    {planId === "free" && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Free forever
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="mb-8 flex-1 space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700">
                        {limits.maxProjects === -1
                          ? "Unlimited projects"
                          : `${limits.maxProjects} projects`}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700">
                        {limits.maxPagesPerScan.toLocaleString()} pages per scan
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700">
                        {limits.scanFrequency === "daily" ? "Daily" : "Weekly"}{" "}
                        automated scans
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700">
                        {limits.maxKeywords} keywords tracked
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700">
                        {limits.historyDays >= 365
                          ? `${Math.round(limits.historyDays / 365)} year${limits.historyDays >= 730 ? "s" : ""}`
                          : `${Math.round(limits.historyDays / 30)} months`}{" "}
                        data history
                      </span>
                    </li>
                    {limits.features.pdfReports && (
                      <li className="flex items-start gap-3 text-sm">
                        <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-neutral-700">PDF reports</span>
                      </li>
                    )}
                    {limits.features.onDemandScans && (
                      <li className="flex items-start gap-3 text-sm">
                        <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-neutral-700">On-demand scans</span>
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={planId === "free" ? "/auth" : "/auth?plan=" + planId}
                    className={`block w-full py-3 px-4 text-center text-sm font-medium rounded-lg transition-colors ${
                      isPopular
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : planId === "free"
                          ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                          : "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {planId === "free" ? "Start for Free" : "Get Started"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-neutral-500 mt-8">
          All plans include CSV export, email support, and 99.9% uptime SLA.
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">
              Compare plans in detail
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Find the perfect plan for your needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-900 w-1/4">
                    Feature
                  </th>
                  {PLAN_ORDER.map((planId) => (
                    <th
                      key={planId}
                      className={`py-4 px-6 text-center text-sm font-semibold ${
                        PLAN_INFO[planId].popular
                          ? "text-neutral-900 bg-neutral-100"
                          : "text-neutral-900"
                      }`}
                    >
                      {PLAN_INFO[planId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr
                    key={feature.key}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}
                  >
                    <td className="py-4 px-6 text-sm text-neutral-700">
                      {feature.label}
                    </td>
                    {PLAN_ORDER.map((planId) => {
                      const value = getPlanFeatureValue(planId, feature.key);
                      return (
                        <td
                          key={planId}
                          className={`py-4 px-6 text-center text-sm font-medium text-neutral-900 ${
                            PLAN_INFO[planId].popular ? "bg-neutral-100/50" : ""
                          }`}
                        >
                          {feature.format(value as number | string)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {FEATURE_FLAGS.map((feature, idx) => (
                  <tr
                    key={feature.key}
                    className={
                      (FEATURES.length + idx) % 2 === 0
                        ? "bg-white"
                        : "bg-neutral-50/50"
                    }
                  >
                    <td className="py-4 px-6 text-sm text-neutral-700">
                      {feature.label}
                    </td>
                    {PLAN_ORDER.map((planId) => {
                      const value = getPlanFeatureValue(planId, feature.key);
                      return (
                        <td
                          key={planId}
                          className={`py-4 px-6 text-center ${
                            PLAN_INFO[planId].popular ? "bg-neutral-100/50" : ""
                          }`}
                        >
                          {value ? (
                            <IconCheck className="mx-auto h-5 w-5 text-green-500" />
                          ) : (
                            <IconX className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <dl className="space-y-8">
            {[
              {
                q: "Can I change my plan later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference immediately. When you downgrade, your new rate applies at the next billing cycle.",
              },
              {
                q: "What happens when I hit my limits?",
                a: "You'll receive a notification when approaching your limits. You won't be automatically charged more. You can upgrade your plan for additional capacity, or wait until your next billing period when limits reset.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Our Free plan lets you try RankRiot with 2 projects and 250 pages per scan. It's free forever with no credit card required. This lets you fully evaluate the platform before upgrading.",
              },
              {
                q: "How do I cancel my subscription?",
                a: "You can cancel anytime from your billing settings. When you cancel, you'll retain access to paid features until the end of your current billing period. We don't offer refunds for partial periods.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Yes, all paid plans offer annual billing at a discount. You'll save approximately 16% compared to monthly billing. Annual plans are billed upfront for the full year.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our payment provider, Paddle. All transactions are secure and encrypted.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="border-b border-neutral-200 pb-8 last:border-0"
              >
                <dt className="text-lg font-semibold text-neutral-900">
                  {faq.q}
                </dt>
                <dd className="mt-3 text-neutral-600 leading-relaxed">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-xl mx-auto">
            Start with our free plan and upgrade when you need more power. No
            credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              Start Free
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
