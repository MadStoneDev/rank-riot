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

// Initialize Paddle SDK (single synchronous attempt)
export function initializePaddle(): boolean {
  if (!isPaddleLoaded()) {
    console.warn("Paddle.js not loaded yet");
    return false;
  }

  if (_paddleInitialized) {
    return true;
  }

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const envValue = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox";
  const environment: PaddleEnvironment = envValue === "live" ? "production" : envValue as PaddleEnvironment;

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

// Async initialization with retries — handles Paddle SDK internal race
// conditions (e.g. ProfitWell/Retain not ready when Initialize is called).
export async function initializePaddleWithRetry(
  maxAttempts: number = 5,
  delayMs: number = 1000,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (_paddleInitialized) return true;
    if (!isPaddleLoaded()) {
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }
    const success = initializePaddle();
    if (success) return true;
    console.warn(`Paddle init attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return _paddleInitialized;
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

// Open Paddle checkout for a specific plan (with retries for SDK internal readiness)
export async function openCheckout(
  planId: Exclude<PlanId, "free">,
  billingInterval: BillingInterval,
  userId: string,
  userEmail: string,
  paddleCustomerId?: string
): Promise<boolean> {
  // Check if Paddle is ready; if not, attempt on-the-fly initialization
  if (!isPaddleReady()) {
    const ready = await initializePaddleWithRetry(4, 1500);
    if (!ready) {
      console.error("Paddle initialization failed after retries");
      return false;
    }
  }

  const priceId = PADDLE_PRICE_IDS[planId]?.[billingInterval];
  if (!priceId) {
    console.error(`No price ID configured for plan: ${planId} (${billingInterval}). Check NEXT_PUBLIC_PADDLE_*_PRICE_ID env vars.`);
    return false;
  }

  const checkoutOptions: PaddleCheckoutOptions = {
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
  };

  // Retry Checkout.open — SDK internals may not be ready immediately after Initialize
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      window.Paddle!.Checkout.open(checkoutOptions);
      return true;
    } catch (error) {
      console.warn(`Paddle Checkout.open() attempt ${attempt}/3 failed:`, error);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  console.error("Paddle Checkout.open() failed after all retries");
  return false;
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
