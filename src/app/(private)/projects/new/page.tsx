import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NewProjectForm from "@/components/projects/NewProjectForm";
import { PlanId } from "@/types/subscription";
import { PLAN_LIMITS, PLAN_INFO, canCreateProject } from "@/lib/subscription-limits";

export const metadata = {
  title: "Create New Project | RankRiot",
  description:
    "Create a new SEO or audit project to start monitoring your website's performance and optimization.",
};

export default async function NewProjectPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const userPlan = (profile?.subscription_tier as PlanId) || "free";
  const limits = PLAN_LIMITS[userPlan];
  const planInfo = PLAN_INFO[userPlan];

  // Get current project count
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentProjectCount = projectCount || 0;
  const canCreate = canCreateProject(userPlan, currentProjectCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Create New Project
        </h1>
        <p className="text-neutral-500 mt-1">
          Set up a new project to start monitoring your website's SEO
          performance
        </p>
      </div>

      {/* Project limit info */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <p className="text-sm text-neutral-600">
          <span className="font-medium">Project usage:</span>{" "}
          {currentProjectCount} of {limits.maxProjects === -1 ? "unlimited" : limits.maxProjects} projects
          <span className="text-neutral-400 ml-1">({planInfo.name} plan)</span>
        </p>
      </div>

      {canCreate ? (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">
              Project Details
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Fill in the information below to create your new project.
            </p>
          </div>

          <div className="p-6">
            <NewProjectForm
              currentPlan={userPlan}
              projectCount={currentProjectCount}
              maxProjects={limits.maxProjects}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Project Limit Reached
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              You've used all {limits.maxProjects} projects available on your {planInfo.name} plan.
              Upgrade to create more projects and unlock additional features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center justify-center px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
              >
                Upgrade Your Plan
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                View Existing Projects
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
