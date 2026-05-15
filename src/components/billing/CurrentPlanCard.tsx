"use client";

import { IconCrown, IconRocket, IconBuilding, IconUser } from "@tabler/icons-react";
import { PlanId, SubscriptionStatus } from "@/types/subscription";
import { PLAN_INFO } from "@/lib/subscription-limits";

interface CurrentPlanCardProps {
  plan: PlanId;
  status: SubscriptionStatus;
  periodEnd: Date | null;
}

const PLAN_ICONS: Record<PlanId, React.ElementType> = {
  free: IconUser,
  starter: IconRocket,
  pro: IconCrown,
  business: IconBuilding,
};

const STATUS_BADGES: Record<
  NonNullable<SubscriptionStatus>,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-[var(--color-score-good)]/20 text-[var(--color-score-good)]" },
  trialing: { label: "Trial", className: "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" },
  past_due: { label: "Past Due", className: "bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)]" },
  canceled: { label: "Canceled", className: "bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]" },
  paused: { label: "Paused", className: "bg-[var(--color-score-warning)]/20 text-[var(--color-score-warning)]" },
};

export default function CurrentPlanCard({
  plan,
  status,
  periodEnd,
}: CurrentPlanCardProps) {
  const info = PLAN_INFO[plan];
  const Icon = PLAN_ICONS[plan];
  const statusBadge = status ? STATUS_BADGES[status] : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {info.name} Plan
              </h3>
              {statusBadge && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{info.description}</p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            ${info.priceMonthly}
            {info.priceMonthly > 0 && (
              <span className="text-sm font-normal text-[var(--color-text-muted)]">/mo</span>
            )}
          </p>
        </div>
      </div>

      {periodEnd && status === "active" && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Next billing date:{" "}
            <span className="font-medium">{formatDate(periodEnd)}</span>
          </p>
        </div>
      )}

      {status === "canceled" && periodEnd && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
          <p className="text-sm text-[var(--color-score-critical)]">
            Access ends:{" "}
            <span className="font-medium">{formatDate(periodEnd)}</span>
          </p>
        </div>
      )}

      {status === "past_due" && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
          <p className="text-sm text-[var(--color-score-critical)]">
            Your payment is past due. Please update your payment method to
            continue using all features.
          </p>
        </div>
      )}
    </div>
  );
}
