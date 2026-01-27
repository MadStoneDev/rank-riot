import { Metadata } from "next";
import { redirect } from "next/navigation";
import UserSettingsForm from "@/components/settings/UserSettingsForm";

import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Account Settings | RankRiot",
  description:
    "Manage your RankRiot account settings, profile information, and notification preferences.",
};

export default async function SettingsPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Profile Information
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Update your account details
          </p>
        </div>

        <div className="p-6">
          <UserSettingsForm profile={profile} />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Email Notifications
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Choose what updates you receive
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="scan_completed"
                  name="scan_completed"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <div className="text-sm">
                <span className="font-medium text-neutral-900 group-hover:text-neutral-700">
                  Scan completed
                </span>
                <p className="text-neutral-500 mt-0.5">
                  Receive notifications when a website scan is completed.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="text-lg font-semibold text-red-700">
            Danger Zone
          </h2>
        </div>

        <div className="p-6">
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
              className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
