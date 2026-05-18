"use client";

import { useState } from "react";

interface SubscriptionManagerProps {
  userId: string;
  currentTier: string;
  currentStatus: string;
  paddleCustomerId: string | null;
  subscriptionPeriodEnd: string | null;
}

export default function SubscriptionManager({
  userId,
  currentTier,
  currentStatus,
  paddleCustomerId,
  subscriptionPeriodEnd,
}: SubscriptionManagerProps) {
  const [tier, setTier] = useState(currentTier);
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSave() {
    if (tier === currentTier && status === currentStatus) return;

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_subscription",
          userId,
          subscription_tier: tier,
          subscription_status: status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to update subscription",
        });
        return;
      }

      setFeedback({ type: "success", message: "Subscription updated" });
    } catch {
      setFeedback({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Tier
          </label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            disabled={saving}
            className="w-full text-sm rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50"
          >
            <option value="free">free</option>
            <option value="starter">starter</option>
            <option value="pro">pro</option>
            <option value="business">business</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
            className="w-full text-sm rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50"
          >
            <option value="active">active</option>
            <option value="canceled">canceled</option>
            <option value="past_due">past_due</option>
            <option value="paused">paused</option>
            <option value="trialing">trialing</option>
          </select>
        </div>
      </div>

      {(paddleCustomerId || subscriptionPeriodEnd) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {paddleCustomerId && (
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Paddle Customer ID
              </p>
              <p className="text-[var(--color-text-secondary)] mt-0.5 font-mono text-xs">
                {paddleCustomerId}
              </p>
            </div>
          )}
          {subscriptionPeriodEnd && (
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Period End
              </p>
              <p className="text-[var(--color-text-secondary)] mt-0.5 text-xs">
                {new Date(subscriptionPeriodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || (tier === currentTier && status === currentStatus)}
          className="text-sm font-medium px-4 py-1.5 rounded-md bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {feedback && (
          <span
            className={`text-xs ${
              feedback.type === "success"
                ? "text-[var(--color-score-good)]"
                : "text-[var(--color-score-critical)]"
            }`}
          >
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}
