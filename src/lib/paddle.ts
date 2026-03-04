import { PlanId, BillingInterval } from "@/types/subscription";

// Re-export for convenience
export type { BillingInterval };

// Paddle environment type
type PaddleEnvironment = "sandbox" | "production";

// Paddle.js types (subset of what we need)
interface PaddleCheckoutSettings {
  displayMode?: "overlay" | "inline";
  theme?: "light" | "dark";
  locale?: string;
  successUrl?: string;
  frameTarget?: string;
  frameInitialHeight?: number;
  frameStyle?: string;
}

interface PaddleCheckoutItem {
  priceId: string;
  quantity?: number;
}

interface PaddleCheckoutCustomer {
  email?: string;
  id?: string;
}

interface PaddleCheckoutOptions {
  items: PaddleCheckoutItem[];
  customer?: PaddleCheckoutCustomer;
  customData?: Record<string, string>;
  settings?: PaddleCheckoutSettings;
}

interface PaddleInstance {
  Environment: {
    set: (env: PaddleEnvironment) => void;
  };
  Initialize: (options: { token: string; eventCallback?: (event: any) => void }) => void;
  Checkout: {
    open: (options: PaddleCheckoutOptions) => void;
    close: () => void;
  };
}

// Declare Paddle on window
declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

// Price IDs for each plan and billing interval (loaded from env)
export const PADDLE_PRICE_IDS: Record<
  Exclude<PlanId, "free">,
  { monthly: string; yearly: string }
> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY_PRICE_ID || "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || "",
  },
  business: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_MONTHLY_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_YEARLY_PRICE_ID || "",
  },
};

// Module-level flag tracking successful initialization
let _paddleInitialized = false;

// Check if Paddle script is loaded on window
export function isPaddleLoaded(): boolean {
  return typeof window !== "undefined" && !!window.Paddle;
}

// Check if Paddle is both loaded AND initialized
export function isPaddleReady(): boolean {
  return isPaddleLoaded() && _paddleInitialized;
}

// Initialize Paddle SDK
export function initializePaddle(): boolean {
  if (!isPaddleLoaded()) {
    console.warn("Paddle.js not loaded yet");
    return false;
  }

  if (_paddleInitialized) {
    return true;
  }

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ||
    "sandbox") as PaddleEnvironment;

  if (!clientToken) {
    console.error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not configured");
    return false;
  }

  try {
    window.Paddle!.Environment.set(environment);
    window.Paddle!.Initialize({
      token: clientToken,
      eventCallback: handlePaddleEvent,
    });
    _paddleInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    return false;
  }
}

// Handle Paddle events (checkout completed, etc.)
function handlePaddleEvent(event: any) {
  console.log("Paddle event:", event);

  switch (event.name) {
    case "checkout.completed":
      // Checkout was successful - webhook will handle the rest
      // Optionally show success message or redirect
      console.log("Checkout completed:", event.data);
      break;

    case "checkout.closed":
      // User closed the checkout without completing
      console.log("Checkout closed");
      break;

    case "checkout.error":
      // Error during checkout
      console.error("Checkout error:", event.data);
      break;
  }
}

// Open Paddle checkout for a specific plan
export function openCheckout(
  planId: Exclude<PlanId, "free">,
  billingInterval: BillingInterval,
  userId: string,
  userEmail: string,
  paddleCustomerId?: string
): boolean {
  // Check if Paddle is ready; if not, attempt on-the-fly initialization
  if (!isPaddleReady()) {
    if (isPaddleLoaded()) {
      console.warn("Paddle loaded but not initialized — attempting on-the-fly init");
      const initSuccess = initializePaddle();
      if (!initSuccess) {
        console.error("Paddle on-the-fly initialization failed");
        return false;
      }
    } else {
      console.error("Paddle script not loaded on window");
      return false;
    }
  }

  const priceId = PADDLE_PRICE_IDS[planId]?.[billingInterval];
  if (!priceId) {
    console.error(`No price ID configured for plan: ${planId} (${billingInterval}). Check NEXT_PUBLIC_PADDLE_*_PRICE_ID env vars.`);
    return false;
  }

  try {
    window.Paddle!.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: paddleCustomerId
        ? { id: paddleCustomerId }
        : { email: userEmail },
      customData: {
        userId,
        userEmail,
        planId,
        billingInterval,
      },
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
      },
    });
    return true;
  } catch (error) {
    console.error("Paddle Checkout.open() threw an error:", error);
    return false;
  }
}

// Close any open checkout
export function closeCheckout(): void {
  if (isPaddleLoaded()) {
    window.Paddle!.Checkout.close();
  }
}

// Get price ID for a plan and billing interval
export function getPriceIdForPlan(
  planId: Exclude<PlanId, "free">,
  billingInterval: BillingInterval
): string | null {
  return PADDLE_PRICE_IDS[planId]?.[billingInterval] || null;
}

// Map Paddle price ID to plan ID and billing interval
export function getPlanFromPriceId(
  priceId: string
): { planId: PlanId; billingInterval: BillingInterval } | null {
  for (const [plan, prices] of Object.entries(PADDLE_PRICE_IDS)) {
    if (prices.monthly === priceId) {
      return { planId: plan as PlanId, billingInterval: "monthly" };
    }
    if (prices.yearly === priceId) {
      return { planId: plan as PlanId, billingInterval: "yearly" };
    }
  }
  return null;
}
