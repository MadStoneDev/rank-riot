"use client";

import { useState, useRef } from "react";
import { Database } from "../../../database.types";

import { updateProfile } from "@/app/(private)/dashboard/settings/actions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserSettingsFormProps {
  profile: Profile;
}

export default function UserSettingsForm({ profile }: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    try {
      const result = await updateProfile(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Profile updated successfully");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border-l-4 border-green-500 text-green-700 rounded-md">
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={profile.email || ""}
              disabled
              className={`p-2 shadow-sm bg-[var(--color-surface-elevated)] block w-full sm:text-sm border-[var(--color-border-default)] rounded-md`}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Email cannot be changed. Contact support if you need to update your
            email.
          </p>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            Full Name
          </label>
          <div className="mt-1">
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name || ""}
              className={`p-2 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] rounded-md`}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Profile Picture
          </label>
          <div className="mt-1 flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--color-surface-overlay)]">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-full w-full text-[var(--color-text-muted)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              className="ml-5 bg-[var(--color-surface-raised)] py-2 px-3 border border-[var(--color-border-default)] rounded-md shadow-sm text-sm leading-4 font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-[var(--color-border-default)]">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
