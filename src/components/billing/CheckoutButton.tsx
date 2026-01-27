"use client";

import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { PlanId } from "@/types/subscription";
import { openCheckout, PADDLE_PRICE_IDS, BillingInterval } from "@/lib/paddle";
import { PLAN_INFO } from "@/lib/subscription-limits";

interface CheckoutButtonProps {
  targetPlan: Exclude<PlanId, "free">;
  billingInterval?: BillingInterval;
  userId: string;
  userEmail: string;
  paddleCustomerId?: string;
  currentPlan: PlanId;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CheckoutButton({
  targetPlan,
  billingInterval = "monthly",
  userId,
  userEmail,
  paddleCustomerId,
  currentPlan,
  variant = "primary",
  size = "md",
  className = "",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentPlan = currentPlan === targetPlan;
  const isDowngrade =
    ["business", "pro", "starter"].indexOf(currentPlan) >
    ["business", "pro", "starter"].indexOf(targetPlan);
  const isUpgrade = !isCurrentPlan && !isDowngrade;

  const info = PLAN_INFO[targetPlan];

  const handleClick = async () => {
    if (isCurrentPlan || !PADDLE_PRICE_IDS[targetPlan]?.[billingInterval]) return;

    setIsLoading(true);
    try {
      openCheckout(targetPlan, billingInterval, userId, userEmail, paddleCustomerId);
    } catch (error) {
      console.error("Failed to open checkout:", error);
    } finally {
      // Keep loading for a bit to show feedback
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  // Determine button text
  let buttonText = `Upgrade to ${info.name}`;
  if (isCurrentPlan) buttonText = "Current Plan";
  else if (isDowngrade) buttonText = `Downgrade to ${info.name}`;

  // Determine button styles
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: "bg-secondary text-white hover:bg-secondary/90",
    secondary: "bg-primary text-white hover:bg-primary/90",
    outline:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCurrentPlan || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
}
