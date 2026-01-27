"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PlanId,
  SubscriptionStatus,
  PlanLimits,
  UsageData,
  SubscriptionContextValue,
  BillingInterval,
} from "@/types/subscription";
import {
  getPlanLimits,
  canCreateProject,
  getRemainingProjects,
} from "@/lib/subscription-limits";
import { initializePaddle, openCheckout, isPaddleLoaded } from "@/lib/paddle";

// Default context value
const defaultContext: SubscriptionContextValue = {
  plan: "free",
  status: null,
  limits: getPlanLimits("free"),
  usage: {
    projectsCount: 0,
    scansThisMonth: 0,
    pagesThisMonth: 0,
  },
  periodEnd: null,
  isLoading: true,
  error: null,
  canCreateProject: true,
  canStartScan: true,
  remainingProjects: 2,
  openCheckout: () => {},
  refreshSubscription: async () => {},
};

// Create context
const SubscriptionContext =
  createContext<SubscriptionContextValue>(defaultContext);

// Provider props
interface SubscriptionProviderProps {
  children: ReactNode;
  userId: string;
  userEmail: string;
}

export function SubscriptionProvider({
  children,
  userId,
  userEmail,
}: SubscriptionProviderProps) {
  const [plan, setPlan] = useState<PlanId>("free");
  const [status, setStatus] = useState<SubscriptionStatus>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
  const [usage, setUsage] = useState<UsageData>({
    projectsCount: 0,
    scansThisMonth: 0,
    pagesThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paddleInitialized, setPaddleInitialized] = useState(false);

  const supabase = createClient();

  // Fetch subscription and usage data
  const fetchSubscriptionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "subscription_tier, subscription_status, subscription_period_end"
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        throw new Error("Failed to fetch subscription data");
      }

      // Set subscription data
      setPlan((profile?.subscription_tier as PlanId) || "free");
      setStatus(profile?.subscription_status as SubscriptionStatus);
      setPeriodEnd(
        profile?.subscription_period_end
          ? new Date(profile.subscription_period_end)
          : null
      );

      // Fetch project count
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Fetch usage for current month
      const { data: usageData } = await supabase.rpc("get_current_usage", {
        p_user_id: userId,
      });

      setUsage({
        projectsCount: projectCount || 0,
        scansThisMonth: usageData?.[0]?.scans_this_month || 0,
        pagesThisMonth: usageData?.[0]?.pages_this_month || 0,
      });
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  // Initialize Paddle and fetch subscription data on mount
  useEffect(() => {
    fetchSubscriptionData();

    // Initialize Paddle after a short delay to ensure script is loaded
    const initTimer = setTimeout(() => {
      if (isPaddleLoaded()) {
        const success = initializePaddle();
        setPaddleInitialized(success);
      }
    }, 500);

    return () => clearTimeout(initTimer);
  }, [fetchSubscriptionData]);

  // Subscribe to profile changes for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Update subscription data when profile changes
          const newProfile = payload.new as any;
          setPlan((newProfile.subscription_tier as PlanId) || "free");
          setStatus(newProfile.subscription_status as SubscriptionStatus);
          setPeriodEnd(
            newProfile.subscription_period_end
              ? new Date(newProfile.subscription_period_end)
              : null
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Calculate derived values
  const limits = getPlanLimits(plan);
  const canCreate = canCreateProject(plan, usage.projectsCount);
  const remaining = getRemainingProjects(plan, usage.projectsCount);

  // Open checkout handler
  const handleOpenCheckout = useCallback(
    (targetPlan: Exclude<PlanId, "free">, billingInterval: BillingInterval = "monthly") => {
      openCheckout(targetPlan, billingInterval, userId, userEmail);
    },
    [userId, userEmail]
  );

  const contextValue: SubscriptionContextValue = {
    plan,
    status,
    limits,
    usage,
    periodEnd,
    isLoading,
    error,
    canCreateProject: canCreate,
    canStartScan: true, // Will be calculated based on scan context
    remainingProjects: remaining,
    openCheckout: handleOpenCheckout,
    refreshSubscription: fetchSubscriptionData,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook to use subscription context
export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}

// Hook to check if user can create a project
export function useCanCreateProject(): boolean {
  const { canCreateProject } = useSubscription();
  return canCreateProject;
}

// Hook to check page limit for scans
export function usePageLimit(): number {
  const { limits } = useSubscription();
  return limits.maxPagesPerScan;
}

// Hook to get current plan
export function usePlan(): PlanId {
  const { plan } = useSubscription();
  return plan;
}
