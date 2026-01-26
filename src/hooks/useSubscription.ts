// Re-export hooks from SubscriptionProvider for convenience
export {
  useSubscription,
  useCanCreateProject,
  usePageLimit,
  usePlan,
} from "@/providers/SubscriptionProvider";

// Additional subscription-related hooks can be added here
import { useMemo } from "react";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { PlanId } from "@/types/subscription";
import {
  hasDailyScans,
  hasOnDemandScans,
  hasPdfReports,
  getUpgradeRecommendation,
  PLAN_INFO,
} from "@/lib/subscription-limits";

// Hook to check if user has daily scan frequency
export function useHasDailyScans(): boolean {
  const { plan } = useSubscription();
  return hasDailyScans(plan);
}

// Hook to check if user has on-demand scans
export function useHasOnDemandScans(): boolean {
  const { plan } = useSubscription();
  return hasOnDemandScans(plan);
}

// Hook to check if user has PDF reports
export function useHasPdfReports(): boolean {
  const { plan } = useSubscription();
  return hasPdfReports(plan);
}

// Hook to get upgrade recommendation
export function useUpgradeRecommendation(
  limitType: "projects" | "pages" | "keywords" | "frequency"
): {
  recommendedPlan: PlanId | null;
  planName: string | null;
  priceMonthly: number | null;
} {
  const { plan } = useSubscription();

  return useMemo(() => {
    const recommended = getUpgradeRecommendation(plan, limitType);
    if (!recommended) {
      return { recommendedPlan: null, planName: null, priceMonthly: null };
    }

    const info = PLAN_INFO[recommended];
    return {
      recommendedPlan: recommended,
      planName: info.name,
      priceMonthly: info.priceMonthly,
    };
  }, [plan, limitType]);
}

// Hook to check if user is on free plan
export function useIsFreeUser(): boolean {
  const { plan } = useSubscription();
  return plan === "free";
}

// Hook to check if subscription is active
export function useIsSubscriptionActive(): boolean {
  const { status } = useSubscription();
  return status === "active" || status === "trialing";
}

// Hook to get usage percentage for a limit
export function useUsagePercentage(
  type: "projects" | "scans" | "pages"
): number {
  const { usage, limits } = useSubscription();

  return useMemo(() => {
    switch (type) {
      case "projects":
        if (limits.maxProjects === -1) return 0;
        return Math.min(
          100,
          (usage.projectsCount / limits.maxProjects) * 100
        );
      case "scans":
        // Scans don't have a monthly limit in our current model
        return 0;
      case "pages":
        // Pages per scan, not cumulative
        return 0;
      default:
        return 0;
    }
  }, [usage, limits, type]);
}

// Hook to format remaining days until period end
export function useSubscriptionDaysRemaining(): number | null {
  const { periodEnd } = useSubscription();

  return useMemo(() => {
    if (!periodEnd) return null;
    const now = new Date();
    const diff = periodEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [periodEnd]);
}
