"use client";

import { useState } from "react";

interface RoleManagerProps {
  userId: string;
  currentRole: string;
}

export default function RoleManager({ userId, currentRole }: RoleManagerProps) {
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleChange(newRole: string) {
    if (newRole === role) return;

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_role", userId, role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update role" });
        return;
      }

      setRole(newRole);
      setFeedback({ type: "success", message: `Role updated to ${newRole}` });
    } catch {
      setFeedback({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="text-sm rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50"
      >
        <option value="user">user</option>
        <option value="moderator">moderator</option>
        <option value="admin">admin</option>
      </select>

      {saving && (
        <span className="text-xs text-[var(--color-text-muted)]">Saving...</span>
      )}

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
