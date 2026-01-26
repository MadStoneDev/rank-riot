import { Metadata } from "next";
import Link from "next/link";
import { IconCheck, IconX } from "@tabler/icons-react";
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
  { key: "projects", label: "Projects", format: (v) => v === -1 ? "Unlimited" : String(v) },
  { key: "pagesPerScan", label: "Pages per scan", format: (v) => Number(v).toLocaleString() },
  { key: "scanFrequency", label: "Scan frequency", format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
  { key: "keywords", label: "Keywords tracked", format: (v) => Number(v).toLocaleString() },
  { key: "history", label: "Data history", format: (v) => Number(v) >= 365 ? `${Math.round(Number(v) / 365)} year${Number(v) >= 730 ? "s" : ""}` : `${Math.round(Number(v) / 30)} months` },
  { key: "competitors", label: "Competitors per project", format: (v) => String(v) },
  { key: "users", label: "Team members", format: (v) => String(v) },
];

const FEATURE_FLAGS = [
  { key: "csvExport", label: "CSV export" },
  { key: "pdfReports", label: "PDF reports" },
  { key: "dailyScans", label: "Daily scans" },
  { key: "onDemandScans", label: "On-demand scans" },
];

function getPlanFeatureValue(planId: PlanId, featureKey: string): string | number | boolean {
  const limits = PLAN_LIMITS[planId];

  switch (featureKey) {
    case "projects": return limits.maxProjects;
    case "pagesPerScan": return limits.maxPagesPerScan;
    case "scanFrequency": return limits.scanFrequency;
    case "keywords": return limits.maxKeywords;
    case "history": return limits.historyDays;
    case "competitors": return limits.maxCompetitors;
    case "users": return limits.maxTeamMembers;
    case "csvExport": return true; // All plans have CSV
    case "pdfReports": return limits.features.pdfReports;
    case "dailyScans": return limits.scanFrequency === "daily";
    case "onDemandScans": return limits.features.onDemandScans;
    default: return "";
  }
}

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-4">
            {PLAN_ORDER.map((planId) => {
              const info = PLAN_INFO[planId];
              const limits = PLAN_LIMITS[planId];
              const isPopular = info.popular;

              return (
                <div
                  key={planId}
                  className={`relative flex flex-col rounded-2xl border ${
                    isPopular
                      ? "border-secondary ring-2 ring-secondary"
                      : "border-neutral-200"
                  } bg-white p-8`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1 text-sm font-medium text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary">
                      {info.name}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      {info.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-primary">
                        ${info.priceMonthly}
                      </span>
                      {info.priceMonthly > 0 && (
                        <span className="ml-1 text-neutral-500">/month</span>
                      )}
                    </div>
                    {info.priceYearly > 0 && (
                      <p className="mt-1 text-sm text-neutral-500">
                        ${Math.round(info.priceYearly / 12)}/mo billed annually
                      </p>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    <li className="flex items-center text-sm text-neutral-700">
                      <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                      {limits.maxProjects === -1
                        ? "Unlimited projects"
                        : `${limits.maxProjects} projects`}
                    </li>
                    <li className="flex items-center text-sm text-neutral-700">
                      <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                      {limits.maxPagesPerScan.toLocaleString()} pages/scan
                    </li>
                    <li className="flex items-center text-sm text-neutral-700">
                      <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                      {limits.scanFrequency === "daily" ? "Daily" : "Weekly"} scans
                    </li>
                    <li className="flex items-center text-sm text-neutral-700">
                      <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                      {limits.maxKeywords} keywords tracked
                    </li>
                    {limits.features.pdfReports && (
                      <li className="flex items-center text-sm text-neutral-700">
                        <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                        PDF reports
                      </li>
                    )}
                    {limits.features.onDemandScans && (
                      <li className="flex items-center text-sm text-neutral-700">
                        <IconCheck className="mr-2 h-5 w-5 text-green-500" />
                        On-demand scans
                      </li>
                    )}
                  </ul>

                  <Link
                    href={planId === "free" ? "/auth" : "/auth?plan=" + planId}
                    className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      isPopular
                        ? "bg-secondary text-white hover:bg-secondary/90"
                        : planId === "free"
                          ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                          : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {planId === "free" ? "Start Free" : "Get Started"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="mx-auto mt-24 max-w-5xl">
            <h2 className="text-2xl font-bold text-primary text-center mb-12">
              Compare Plans
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-neutral-900">
                      Feature
                    </th>
                    {PLAN_ORDER.map((planId) => (
                      <th
                        key={planId}
                        className="py-4 px-4 text-center text-sm font-semibold text-neutral-900"
                      >
                        {PLAN_INFO[planId].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature) => (
                    <tr key={feature.key} className="border-b border-neutral-100">
                      <td className="py-4 px-4 text-sm text-neutral-700">
                        {feature.label}
                      </td>
                      {PLAN_ORDER.map((planId) => {
                        const value = getPlanFeatureValue(planId, feature.key);
                        return (
                          <td
                            key={planId}
                            className="py-4 px-4 text-center text-sm text-neutral-700"
                          >
                            {feature.format(value as number | string)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {FEATURE_FLAGS.map((feature) => (
                    <tr key={feature.key} className="border-b border-neutral-100">
                      <td className="py-4 px-4 text-sm text-neutral-700">
                        {feature.label}
                      </td>
                      {PLAN_ORDER.map((planId) => {
                        const value = getPlanFeatureValue(planId, feature.key);
                        return (
                          <td
                            key={planId}
                            className="py-4 px-4 text-center"
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

          {/* FAQ */}
          <div className="mx-auto mt-24 max-w-3xl">
            <h2 className="text-2xl font-bold text-primary text-center mb-12">
              Frequently Asked Questions
            </h2>

            <dl className="space-y-8">
              <div>
                <dt className="text-lg font-semibold text-neutral-900">
                  Can I change my plan later?
                </dt>
                <dd className="mt-2 text-neutral-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes
                  take effect immediately, and we'll prorate any differences.
                </dd>
              </div>

              <div>
                <dt className="text-lg font-semibold text-neutral-900">
                  What happens when I hit my limits?
                </dt>
                <dd className="mt-2 text-neutral-600">
                  You'll receive a notification when approaching your limits. You
                  can upgrade your plan to get more capacity, or wait until your
                  next billing period for limits to reset.
                </dd>
              </div>

              <div>
                <dt className="text-lg font-semibold text-neutral-900">
                  Is there a free trial?
                </dt>
                <dd className="mt-2 text-neutral-600">
                  Yes! Our Free plan lets you try RankRiot with 2 projects and
                  250 pages per scan. No credit card required.
                </dd>
              </div>

              <div>
                <dt className="text-lg font-semibold text-neutral-900">
                  How do I cancel my subscription?
                </dt>
                <dd className="mt-2 text-neutral-600">
                  You can cancel anytime from your billing settings. Your access
                  continues until the end of your current billing period.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
