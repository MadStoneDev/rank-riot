"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconCheck, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { PlanId, SubscriptionStatus } from "@/types/subscription";
import { PLAN_INFO, PLAN_LIMITS } from "@/lib/subscription-limits";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import UsageMeter from "@/components/billing/UsageMeter";
import CheckoutButton from "@/components/billing/CheckoutButton";

interface BillingPageClientProps {
  userId: string;
  userEmail: string;
  plan: PlanId;
  status: SubscriptionStatus;
  periodEnd: Date | null;
  projectCount: number;
  scansThisMonth: number;
  pagesThisMonth: number;
}

const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "business"];

export default function BillingPageClient({
  userId,
  userEmail,
  plan,
  status,
  periodEnd,
  projectCount,
  scansThisMonth,
  pagesThisMonth,
}: BillingPageClientProps) {
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout");

  // Show success message if redirected from checkout
  useEffect(() => {
    if (checkoutSuccess === "success") {
      toast.success("Subscription updated successfully!", {
        description: "Your new plan is now active.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [checkoutSuccess]);

  const limits = PLAN_LIMITS[plan];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Billing</h1>
        <p className="text-neutral-500 mt-1">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <CurrentPlanCard plan={plan} status={status} periodEnd={periodEnd} />

      {/* Usage Overview */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Current Usage
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <UsageMeter
            current={projectCount}
            max={limits.maxProjects === -1 ? "unlimited" : limits.maxProjects}
            label="Projects"
          />

          <UsageMeter
            current={scansThisMonth}
            max="unlimited"
            label="Scans this month"
          />

          <UsageMeter
            current={pagesThisMonth}
            max="unlimited"
            label="Pages scanned this month"
          />
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">
            Plan Limits
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Pages per scan</p>
              <p className="font-semibold text-neutral-900">
                {limits.maxPagesPerScan.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Scan frequency</p>
              <p className="font-semibold text-neutral-900 capitalize">
                {limits.scanFrequency}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Keywords</p>
              <p className="font-semibold text-neutral-900">{limits.maxKeywords}</p>
            </div>
            <div>
              <p className="text-neutral-500">Data history</p>
              <p className="font-semibold text-neutral-900">
                {limits.historyDays >= 365
                  ? `${Math.round(limits.historyDays / 365)} year${limits.historyDays >= 730 ? "s" : ""}`
                  : `${Math.round(limits.historyDays / 30)} months`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            {plan === "business" ? "Your Plan" : "Upgrade Your Plan"}
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAN_ORDER.map((planId) => {
              const info = PLAN_INFO[planId];
              const planLimits = PLAN_LIMITS[planId];
              const isCurrentPlan = plan === planId;
              const isPopular = info.popular;

              return (
                <div
                  key={planId}
                  className={`relative rounded-xl border-2 p-5 transition-all ${
                    isCurrentPlan
                      ? "border-neutral-900 bg-neutral-50"
                      : isPopular
                        ? "border-primary"
                        : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {isPopular && !isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current
                    </span>
                  )}

                  <h3 className="font-semibold text-neutral-900 mt-1">{info.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-neutral-900">
                      ${info.priceMonthly}
                    </span>
                    {info.priceMonthly > 0 && (
                      <span className="text-sm text-neutral-500">/mo</span>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.maxProjects === -1
                        ? "Unlimited"
                        : planLimits.maxProjects}{" "}
                      projects
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.maxPagesPerScan.toLocaleString()} pages/scan
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.scanFrequency === "daily" ? "Daily" : "Weekly"}{" "}
                      scans
                    </li>
                  </ul>

                  <div className="mt-5">
                    {planId === "free" ? (
                      isCurrentPlan ? (
                        <span className="block text-center text-sm text-neutral-500 py-2.5">
                          Current Plan
                        </span>
                      ) : (
                        <span className="block text-center text-sm text-neutral-400 py-2.5">
                          -
                        </span>
                      )
                    ) : (
                      <CheckoutButton
                        targetPlan={planId}
                        userId={userId}
                        userEmail={userEmail}
                        currentPlan={plan}
                        variant={isPopular ? "primary" : "outline"}
                        size="sm"
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ / Help */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Need Help?
          </h2>
        </div>

        <div className="p-6 space-y-4 text-sm text-neutral-600">
          <p>
            <strong className="text-neutral-900">Changing plans:</strong> You can upgrade or downgrade at any
            time. Changes take effect immediately.
          </p>
          <p>
            <strong className="text-neutral-900">Canceling:</strong> You can cancel your subscription anytime.
            You&apos;ll retain access until the end of your billing period.
          </p>
          <p>
            <strong className="text-neutral-900">Questions?</strong>{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
