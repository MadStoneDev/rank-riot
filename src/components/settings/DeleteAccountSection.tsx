"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    setError(null);

    try {
      // Call the account deletion API to remove all user data server-side
      const response = await fetch("/api/account", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out after successful deletion
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?account_deleted=true");
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to process account deletion. Please contact support.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-score-critical)]/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-score-critical)]/10 bg-[var(--color-score-critical-muted)]">
        <h2 className="text-lg font-semibold text-[var(--color-score-critical)]">Danger Zone</h2>
      </div>

      <div className="p-6">
        {!showConfirm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                Delete Account
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center px-4 py-2.5 bg-danger hover:bg-danger-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-score-critical-muted)] border border-[var(--color-score-critical)]/20 rounded-lg">
              <p className="text-sm text-[var(--color-score-critical)] font-medium">
                Are you sure? This will permanently delete:
              </p>
              <ul className="mt-2 text-sm text-[var(--color-score-critical)] list-disc list-inside space-y-1">
                <li>Your account and profile</li>
                <li>All projects and scan history</li>
                <li>All saved reports and data</li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="confirm-delete"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
              >
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="p-2 w-full sm:w-64 border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-lg text-sm focus:ring-danger focus:border-[var(--color-danger)]"
                disabled={isDeleting}
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-score-critical)] font-medium">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-overlay)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-danger-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
