"use client";

import { useState } from "react";

export default function ApiAccessManager({
  userId,
  initialApiAccess,
}: {
  userId: string;
  initialApiAccess: boolean;
}) {
  const [apiAccess, setApiAccess] = useState(initialApiAccess);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function toggle() {
    const next = !apiAccess;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_api_access", userId, api_access: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update" });
        return;
      }
      setApiAccess(next);
      setFeedback({
        type: "success",
        message: next ? "API access granted" : "API access revoked",
      });
    } catch {
      setFeedback({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={saving}
        className={`text-sm rounded-md px-3 py-1.5 border disabled:opacity-50 ${
          apiAccess
            ? "border-[var(--color-score-good)] text-[var(--color-score-good)]"
            : "border-[var(--color-border-default)] text-[var(--color-text-secondary)]"
        }`}
      >
        {apiAccess ? "API access: on" : "API access: off"}
      </button>
      <span className="text-xs text-[var(--color-text-muted)]">
        {apiAccess ? "Click to revoke" : "Click to grant"}
      </span>
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
  );
}
