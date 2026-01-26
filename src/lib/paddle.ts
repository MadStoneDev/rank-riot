import { PlanId } from "@/types/subscription";

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

// Price IDs for each plan (loaded from env)
export const PADDLE_PRICE_IDS: Record<Exclude<PlanId, "free">, string> = {
  starter: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID || "",
  pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "",
  business: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID || "",
};

// Check if Paddle is loaded
export function isPaddleLoaded(): boolean {
  return typeof window !== "undefined" && !!window.Paddle;
}

// Initialize Paddle SDK
export function initializePaddle(): boolean {
  if (!isPaddleLoaded()) {
    console.warn("Paddle.js not loaded yet");
    return false;
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
  userId: string,
  userEmail: string,
  onSuccess?: () => void
): boolean {
  if (!isPaddleLoaded()) {
    console.error("Paddle not loaded");
    return false;
  }

  const priceId = PADDLE_PRICE_IDS[planId];
  if (!priceId) {
    console.error(`No price ID configured for plan: ${planId}`);
    return false;
  }

  try {
    window.Paddle!.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: {
        email: userEmail,
      },
      customData: {
        userId,
        userEmail,
      },
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to open checkout:", error);
    return false;
  }
}

// Close any open checkout
export function closeCheckout(): void {
  if (isPaddleLoaded()) {
    window.Paddle!.Checkout.close();
  }
}

// Get price ID for a plan
export function getPriceIdForPlan(
  planId: Exclude<PlanId, "free">
): string | null {
  return PADDLE_PRICE_IDS[planId] || null;
}

// Map Paddle price ID to plan ID
export function getPlanFromPriceId(priceId: string): PlanId | null {
  for (const [plan, id] of Object.entries(PADDLE_PRICE_IDS)) {
    if (id === priceId) {
      return plan as PlanId;
    }
  }
  return null;
}
