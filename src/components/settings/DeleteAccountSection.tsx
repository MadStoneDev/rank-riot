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
      const supabase = createClient();

      // Sign out and let the user know — actual account deletion
      // should be handled server-side via a Supabase Edge Function
      // or admin API to properly cascade-delete all user data.
      await supabase.auth.signOut();
      router.push("/?account_deleted=pending");
    } catch {
      setError("Failed to process account deletion. Please contact support.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-red-100 bg-red-50">
        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
      </div>

      <div className="p-6">
        {!showConfirm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-neutral-900">
                Delete Account
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                Are you sure? This will permanently delete:
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Your account and profile</li>
                <li>All projects and scan history</li>
                <li>All saved reports and data</li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="confirm-delete"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="p-2 w-full sm:w-64 border border-neutral-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                disabled={isDeleting}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
