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
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  trialing: { label: "Trial", className: "bg-blue-100 text-blue-700" },
  past_due: { label: "Past Due", className: "bg-red-100 text-red-700" },
  canceled: { label: "Canceled", className: "bg-neutral-100 text-neutral-700" },
  paused: { label: "Paused", className: "bg-yellow-100 text-yellow-700" },
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-neutral-900">
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
            <p className="text-sm text-neutral-500 mt-1">{info.description}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-neutral-900">
            ${info.priceMonthly}
            {info.priceMonthly > 0 && (
              <span className="text-sm font-normal text-neutral-500">/mo</span>
            )}
          </p>
        </div>
      </div>

      {periodEnd && status === "active" && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            Next billing date:{" "}
            <span className="font-medium">{formatDate(periodEnd)}</span>
          </p>
        </div>
      )}

      {status === "canceled" && periodEnd && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-red-600">
            Access ends:{" "}
            <span className="font-medium">{formatDate(periodEnd)}</span>
          </p>
        </div>
      )}

      {status === "past_due" && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-red-600">
            Your payment is past due. Please update your payment method to
            continue using all features.
          </p>
        </div>
      )}
    </div>
  );
}
