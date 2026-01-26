import { PlanId, PlanLimits } from "@/types/subscription";

// Plan limits configuration - must match database subscription_plans table
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxProjects: 2,
    maxPagesPerScan: 250,
    scanFrequency: "weekly",
    maxKeywords: 25,
    historyDays: 14,
    maxTeamMembers: 1,
    maxCompetitors: 1,
    features: {
      pdfReports: false,
      onDemandScans: false,
    },
  },
  starter: {
    maxProjects: 5,
    maxPagesPerScan: 2500,
    scanFrequency: "weekly",
    maxKeywords: 100,
    historyDays: 90,
    maxTeamMembers: 1,
    maxCompetitors: 3,
    features: {
      pdfReports: false,
      onDemandScans: false,
    },
  },
  pro: {
    maxProjects: 15,
    maxPagesPerScan: 25000,
    scanFrequency: "daily",
    maxKeywords: 500,
    historyDays: 365,
    maxTeamMembers: 3,
    maxCompetitors: 5,
    features: {
      pdfReports: true,
      onDemandScans: false,
    },
  },
  business: {
    maxProjects: -1, // Unlimited
    maxPagesPerScan: 100000,
    scanFrequency: "daily",
    maxKeywords: 2000,
    historyDays: 730,
    maxTeamMembers: 5,
    maxCompetitors: 10,
    features: {
      pdfReports: true,
      onDemandScans: true,
    },
  },
};

// Plan display information
export const PLAN_INFO: Record<
  PlanId,
  {
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
  }
> = {
  free: {
    name: "Free",
    description: "Perfect for trying out RankRiot",
    priceMonthly: 0,
    priceYearly: 0,
  },
  starter: {
    name: "Starter",
    description: "For freelancers and small sites",
    priceMonthly: 9,
    priceYearly: 84,
  },
  pro: {
    name: "Pro",
    description: "For growing businesses and consultants",
    priceMonthly: 29,
    priceYearly: 288,
    popular: true,
  },
  business: {
    name: "Business",
    description: "For agencies and larger teams",
    priceMonthly: 59,
    priceYearly: 588,
  },
};

// Get limits for a plan
export function getPlanLimits(planId: PlanId | null): PlanLimits {
  return PLAN_LIMITS[planId || "free"];
}

// Check if user can create a new project
export function canCreateProject(
  planId: PlanId | null,
  currentProjectCount: number
): boolean {
  const limits = getPlanLimits(planId);
  if (limits.maxProjects === -1) return true; // Unlimited
  return currentProjectCount < limits.maxProjects;
}

// Check if user can start a scan with given page count
export function canStartScan(
  planId: PlanId | null,
  estimatedPages: number
): boolean {
  const limits = getPlanLimits(planId);
  return estimatedPages <= limits.maxPagesPerScan;
}

// Check if user has access to daily scans
export function hasDailyScans(planId: PlanId | null): boolean {
  const limits = getPlanLimits(planId);
  return limits.scanFrequency === "daily";
}

// Check if user has access to on-demand scans
export function hasOnDemandScans(planId: PlanId | null): boolean {
  const limits = getPlanLimits(planId);
  return limits.features.onDemandScans;
}

// Check if user has PDF reports feature
export function hasPdfReports(planId: PlanId | null): boolean {
  const limits = getPlanLimits(planId);
  return limits.features.pdfReports;
}

// Get remaining projects count
export function getRemainingProjects(
  planId: PlanId | null,
  currentProjectCount: number
): number | "unlimited" {
  const limits = getPlanLimits(planId);
  if (limits.maxProjects === -1) return "unlimited";
  return Math.max(0, limits.maxProjects - currentProjectCount);
}

// Format project limit for display
export function formatProjectLimit(planId: PlanId | null): string {
  const limits = getPlanLimits(planId);
  if (limits.maxProjects === -1) return "Unlimited";
  return limits.maxProjects.toString();
}

// Format page limit for display
export function formatPageLimit(planId: PlanId | null): string {
  const limits = getPlanLimits(planId);
  return limits.maxPagesPerScan.toLocaleString();
}

// Get upgrade recommendation based on what limit was hit
export function getUpgradeRecommendation(
  currentPlan: PlanId,
  limitType: "projects" | "pages" | "keywords" | "frequency"
): PlanId | null {
  const planOrder: PlanId[] = ["free", "starter", "pro", "business"];
  const currentIndex = planOrder.indexOf(currentPlan);

  if (currentIndex >= planOrder.length - 1) {
    return null; // Already on highest plan
  }

  // Recommend next tier up
  return planOrder[currentIndex + 1];
}

// Check if a plan is higher than another
export function isHigherPlan(planA: PlanId, planB: PlanId): boolean {
  const planOrder: PlanId[] = ["free", "starter", "pro", "business"];
  return planOrder.indexOf(planA) > planOrder.indexOf(planB);
}
