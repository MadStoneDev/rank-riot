// Subscription plan identifiers
export type PlanId = "free" | "starter" | "pro" | "business";

// Subscription status values
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "paused"
  | "trialing"
  | null;

// Plan limits configuration
export interface PlanLimits {
  maxProjects: number; // -1 means unlimited
  maxPagesPerScan: number;
  scanFrequency: "weekly" | "daily";
  maxKeywords: number;
  historyDays: number;
  maxTeamMembers: number;
  maxCompetitors: number;
  features: {
    pdfReports: boolean;
    onDemandScans: boolean;
  };
}

// Plan definition (matches database)
export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  priceMonthly: number; // in cents
  priceYearly: number | null;
  paddlePriceIdMonthly: string | null;
  paddlePriceIdYearly: string | null;
  maxProjects: number;
  maxPagesPerScan: number;
  scanFrequency: string;
  maxKeywords: number;
  historyDays: number;
  maxTeamMembers: number;
  maxCompetitors: number;
  features: Record<string, boolean>;
}

// User's current usage
export interface UsageData {
  projectsCount: number;
  scansThisMonth: number;
  pagesThisMonth: number;
}

// Billing interval type
export type BillingInterval = "monthly" | "yearly";

// Subscription context value
export interface SubscriptionContextValue {
  plan: PlanId;
  status: SubscriptionStatus;
  limits: PlanLimits;
  usage: UsageData;
  periodEnd: Date | null;
  isLoading: boolean;
  error: string | null;
  // Computed helpers
  canCreateProject: boolean;
  canStartScan: boolean;
  remainingProjects: number | "unlimited";
  // Actions
  openCheckout: (plan: Exclude<PlanId, "free">, billingInterval?: BillingInterval) => void;
  refreshSubscription: () => Promise<void>;
}

// Paddle checkout custom data
export interface PaddleCustomData {
  userId: string;
  userEmail: string;
}

// Paddle webhook event types we handle
export type PaddleWebhookEventType =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.past_due"
  | "subscription.paused"
  | "subscription.resumed"
  | "transaction.completed";

// Paddle webhook payload structure
export interface PaddleWebhookPayload {
  event_id: string;
  event_type: PaddleWebhookEventType;
  occurred_at: string;
  data: {
    id: string; // subscription_id
    customer_id: string;
    status: string;
    items: Array<{
      price: {
        id: string;
        product_id: string;
      };
      quantity: number;
    }>;
    current_billing_period?: {
      starts_at: string;
      ends_at: string;
    };
    custom_data?: PaddleCustomData;
  };
}
