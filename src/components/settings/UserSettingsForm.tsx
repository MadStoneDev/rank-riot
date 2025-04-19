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
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700"
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
              className="shadow-sm bg-neutral-50 block w-full sm:text-sm border-neutral-300 rounded-md"
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Email cannot be changed. Contact support if you need to update your
            email.
          </p>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-neutral-700"
          >
            Full Name
          </label>
          <div className="mt-1">
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name || ""}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-neutral-700">
            Profile Picture
          </label>
          <div className="mt-1 flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-neutral-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-full w-full text-neutral-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              className="ml-5 bg-white py-2 px-3 border border-neutral-300 rounded-md shadow-sm text-sm leading-4 font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-neutral-200">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
