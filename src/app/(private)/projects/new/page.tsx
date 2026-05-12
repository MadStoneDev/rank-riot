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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Create New Project
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Set up a new project to start monitoring your website's SEO
          performance
        </p>
      </div>

      {/* Project limit info */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="font-medium">Project usage:</span>{" "}
          {currentProjectCount} of {limits.maxProjects === -1 ? "unlimited" : limits.maxProjects} projects
          <span className="text-[var(--color-text-muted)] ml-1">({planInfo.name} plan)</span>
        </p>
      </div>

      {canCreate ? (
        <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Project Details
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
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
        <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
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
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              Project Limit Reached
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              You've used all {limits.maxProjects} projects available on your {planInfo.name} plan.
              Upgrade to create more projects and unlock additional features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Upgrade Your Plan
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg font-medium hover:bg-[var(--color-surface-hover)] transition-colors"
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
