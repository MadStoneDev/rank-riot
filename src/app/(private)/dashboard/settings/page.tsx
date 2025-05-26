import { redirect } from "next/navigation";
import UserSettingsForm from "@/components/settings/UserSettingsForm";

import { createClient } from "@/utils/supabase/server";

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
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        Account Settings
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900">
            Profile Information
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Update your account information.
          </p>
        </div>

        <div className="px-6 py-6">
          <UserSettingsForm profile={profile} />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900">
            Email Notifications
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your email notification preferences.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="scan_completed"
                  name="scan_completed"
                  type="checkbox"
                  defaultChecked
                  className="focus:ring-primary h-4 w-4 text-secondary border-neutral-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="scan_completed"
                  className="font-medium text-neutral-700"
                >
                  Scan completed
                </label>
                <p className="text-neutral-500">
                  Receive notifications when a website scan is completed.
                </p>
              </div>
            </div>

            {/*<div className="flex items-start">*/}
            {/*  <div className="flex items-center h-5">*/}
            {/*    <input*/}
            {/*      id="new_issues"*/}
            {/*      name="new_issues"*/}
            {/*      type="checkbox"*/}
            {/*      defaultChecked*/}
            {/*      className="focus:ring-primary h-4 w-4 text-secondary border-neutral-300 rounded"*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*  <div className="ml-3 text-sm">*/}
            {/*    <label*/}
            {/*      htmlFor="new_issues"*/}
            {/*      className="font-medium text-neutral-700"*/}
            {/*    >*/}
            {/*      New issues detected*/}
            {/*    </label>*/}
            {/*    <p className="text-neutral-500">*/}
            {/*      Receive notifications when new issues are detected during a*/}
            {/*      scan.*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/*<div className="flex items-start">*/}
            {/*  <div className="flex items-center h-5">*/}
            {/*    <input*/}
            {/*      id="weekly_summary"*/}
            {/*      name="weekly_summary"*/}
            {/*      type="checkbox"*/}
            {/*      defaultChecked*/}
            {/*      className="focus:ring-primary h-4 w-4 text-secondary border-neutral-300 rounded"*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*  <div className="ml-3 text-sm">*/}
            {/*    <label*/}
            {/*      htmlFor="weekly_summary"*/}
            {/*      className="font-medium text-neutral-700"*/}
            {/*    >*/}
            {/*      Weekly summary*/}
            {/*    </label>*/}
            {/*    <p className="text-neutral-500">*/}
            {/*      Receive a weekly summary of your projects' performance.*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900 text-red-600">
            Danger Zone
          </h3>
        </div>

        <div className="px-6 py-6">
          <div className="border border-red-200 rounded-md p-4">
            <h3 className="text-base font-medium text-neutral-900">
              Delete Account
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
