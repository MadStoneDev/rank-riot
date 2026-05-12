import { Metadata } from "next";
import { redirect } from "next/navigation";
import UserSettingsForm from "@/components/settings/UserSettingsForm";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

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
          <p className="text-sm text-neutral-500">
            Email notification preferences are coming soon. You will be able to
            configure scan completion alerts and other notifications here.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <DeleteAccountSection />
    </div>
  );
}
