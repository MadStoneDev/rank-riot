"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconCheck, IconArrowRight, IconAlertTriangle } from "@tabler/icons-react";
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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Billing</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <CurrentPlanCard plan={plan} status={status} periodEnd={periodEnd} />

      {/* Usage Overview */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
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

        <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Plan Limits
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[var(--color-text-muted)]">Pages per scan</p>
              <p className="font-semibold text-[var(--color-text-primary)]">
                {limits.maxPagesPerScan.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Scan frequency</p>
              <p className="font-semibold text-[var(--color-text-primary)] capitalize">
                {limits.scanFrequency}
              </p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Keywords</p>
              <p className="font-semibold text-[var(--color-text-primary)]">{limits.maxKeywords}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Data history</p>
              <p className="font-semibold text-[var(--color-text-primary)]">
                {limits.historyDays >= 365
                  ? `${Math.round(limits.historyDays / 365)} year${limits.historyDays >= 730 ? "s" : ""}`
                  : `${Math.round(limits.historyDays / 30)} months`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
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
                      ? "border-[var(--color-primary)] bg-[var(--color-surface-elevated)]"
                      : isPopular
                        ? "border-primary"
                        : "border-[var(--color-border-default)] hover:border-[var(--color-border-default)]"
                  }`}
                >
                  {isPopular && !isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current
                    </span>
                  )}

                  <h3 className="font-semibold text-[var(--color-text-primary)] mt-1">{info.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-[var(--color-text-primary)]">
                      ${info.priceMonthly}
                    </span>
                    {info.priceMonthly > 0 && (
                      <span className="text-sm text-[var(--color-text-muted)]">/mo</span>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.maxProjects === -1
                        ? "Unlimited"
                        : planLimits.maxProjects}{" "}
                      projects
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.maxPagesPerScan.toLocaleString()} pages/scan
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <IconCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {planLimits.scanFrequency === "daily" ? "Daily" : "Weekly"}{" "}
                      scans
                    </li>
                  </ul>

                  {/* Quota warning for downgrades */}
                  {!isCurrentPlan && planLimits.maxProjects !== -1 && projectCount > planLimits.maxProjects && (
                    <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5">
                      <IconAlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        You have {projectCount} projects but this plan allows {planLimits.maxProjects}. You&apos;ll need to remove {projectCount - planLimits.maxProjects} project{projectCount - planLimits.maxProjects > 1 ? "s" : ""} first.
                      </p>
                    </div>
                  )}

                  <div className="mt-5">
                    {planId === "free" ? (
                      isCurrentPlan ? (
                        <span className="block text-center text-sm text-[var(--color-text-muted)] py-2.5">
                          Current Plan
                        </span>
                      ) : (
                        <Link
                          href="/dashboard/billing/cancel"
                          className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] py-2.5 border border-[var(--color-border-default)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          Downgrade to Free
                        </Link>
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
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Need Help?
          </h2>
        </div>

        <div className="p-6 space-y-4 text-sm text-[var(--color-text-secondary)]">
          <p>
            <strong className="text-[var(--color-text-primary)]">Changing plans:</strong> You can upgrade or downgrade at any
            time. Changes take effect immediately.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Canceling:</strong> You can cancel your subscription anytime.
            You&apos;ll retain access until the end of your billing period.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Questions?</strong>{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
