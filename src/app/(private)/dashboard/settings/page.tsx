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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Profile Information
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Update your account details
          </p>
        </div>

        <div className="p-6">
          <UserSettingsForm profile={profile} />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Email Notifications
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Choose what updates you receive
          </p>
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--color-text-muted)]">
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
