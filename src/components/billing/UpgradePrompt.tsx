"use client";

import { IconAlertCircle, IconArrowRight, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { PlanId } from "@/types/subscription";
import { PLAN_INFO, getUpgradeRecommendation } from "@/lib/subscription-limits";

interface UpgradePromptProps {
  currentPlan: PlanId;
  limitType: "projects" | "pages" | "keywords" | "frequency";
  limitValue?: number;
  currentValue?: number;
  onDismiss?: () => void;
  variant?: "banner" | "modal" | "inline";
}

const LIMIT_MESSAGES: Record<string, string> = {
  projects: "You've reached your project limit",
  pages: "This scan exceeds your page limit",
  keywords: "You've reached your keyword tracking limit",
  frequency: "Daily scans are not available on your current plan",
};

export default function UpgradePrompt({
  currentPlan,
  limitType,
  limitValue,
  currentValue,
  onDismiss,
  variant = "banner",
}: UpgradePromptProps) {
  const recommendedPlan = getUpgradeRecommendation(currentPlan, limitType);

  if (!recommendedPlan) {
    // Already on highest plan
    return null;
  }

  const recommendedInfo = PLAN_INFO[recommendedPlan];
  const message = LIMIT_MESSAGES[limitType];

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2">
          <IconAlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-800">
            {message}.{" "}
            <Link
              href="/dashboard/billing"
              className="font-medium underline hover:no-underline"
            >
              Upgrade to {recommendedInfo.name}
            </Link>{" "}
            for more capacity.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="relative bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded"
          >
            <IconX className="h-4 w-4" />
          </button>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold">{message}</h4>
            <p className="text-sm text-white/80 mt-1">
              Upgrade to {recommendedInfo.name} for{" "}
              {limitType === "projects" && "more projects"}
              {limitType === "pages" && "larger scans"}
              {limitType === "keywords" && "more keyword tracking"}
              {limitType === "frequency" && "daily scanning"}
              {" - "}starting at ${recommendedInfo.priceMonthly}/month
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Upgrade Now
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Modal variant - just the content, wrap in your own modal
  return (
    <div className="text-center p-6">
      <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <IconAlertCircle className="h-6 w-6 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{message}</h3>
      <p className="text-neutral-600 mb-6">
        {limitValue && currentValue && (
          <>
            You're using {currentValue} of {limitValue} available.{" "}
          </>
        )}
        Upgrade to {recommendedInfo.name} to continue.
      </p>
      <div className="space-y-3">
        <Link
          href="/dashboard/billing"
          className="block w-full bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
        >
          Upgrade to {recommendedInfo.name} - ${recommendedInfo.priceMonthly}/mo
        </Link>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="block w-full text-neutral-600 hover:text-neutral-800"
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}
