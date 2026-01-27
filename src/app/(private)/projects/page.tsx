import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { IconFileSearch, IconChartBar, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import ProjectList from "@/components/projects/ProjectList";
import { PlanId } from "@/types/subscription";
import { PLAN_LIMITS, PLAN_INFO, canCreateProject } from "@/lib/subscription-limits";

export const metadata: Metadata = {
  title: "Projects | RankRiot",
  description:
    "Manage your SEO and audit projects. View all your websites and their optimization progress.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const params = await searchParams;
  const activeTab = params.tab || "seo";

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const userPlan = (profile?.subscription_tier as PlanId) || "free";
  const limits = PLAN_LIMITS[userPlan];
  const planInfo = PLAN_INFO[userPlan];

  // Get user's SEO projects
  const { data: seoProjects } = await supabase
    .from("projects")
    .select()
    .eq("user_id", user.id)
    .eq("project_type", "seo")
    .order("created_at", { ascending: false });

  // Get user's Audit projects
  const { data: auditProjects } = await supabase
    .from("projects")
    .select()
    .eq("user_id", user.id)
    .eq("project_type", "audit")
    .order("created_at", { ascending: false });

  // Calculate total project count and check limits
  const allProjects = [...(seoProjects || []), ...(auditProjects || [])];
  const totalProjectCount = allProjects.length;
  const canCreate = canCreateProject(userPlan, totalProjectCount);
  const projectIds = allProjects.map((p) => p.id);

  // Get page counts
  const { data: pages } = await supabase
    .from("pages")
    .select("project_id")
    .in("project_id", projectIds);

  const pageCount: { [projectId: string]: number } = {};
  if (pages) {
    pages.forEach((page) => {
      pageCount[page.project_id] = (pageCount[page.project_id] || 0) + 1;
    });
  }

  // Get issue counts
  const { data: issues } = await supabase
    .from("issues")
    .select("project_id")
    .in("project_id", projectIds)
    .eq("is_fixed", false);

  const issueCount: { [projectId: string]: number } = {};
  if (issues) {
    issues.forEach((issue) => {
      issueCount[issue.project_id] = (issueCount[issue.project_id] || 0) + 1;
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
          <p className="text-neutral-500 mt-1">
            {totalProjectCount} of{" "}
            {limits.maxProjects === -1 ? "unlimited" : limits.maxProjects} projects
            <span className="text-neutral-400 ml-1">({planInfo.name})</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate ? (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <IconPlus className="w-4 h-4" />
              New Project
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>

      {/* Upgrade prompt banner when at limit */}
      {!canCreate && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <IconInfoCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Project limit reached</h4>
                <p className="text-neutral-300 mt-1">
                  Upgrade to{" "}
                  {userPlan === "free"
                    ? "Starter"
                    : userPlan === "starter"
                      ? "Pro"
                      : "Business"}{" "}
                  for more projects and advanced features.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 bg-white text-neutral-900 px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-100 transition-colors whitespace-nowrap"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <nav className="flex">
            <Link
              href="/projects?tab=seo"
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "seo"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <IconFileSearch className="w-4 h-4" />
              SEO Projects
              <span
                className={`py-0.5 px-2 rounded-full text-xs ${
                  activeTab === "seo"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {seoProjects?.length || 0}
              </span>
            </Link>

            <Link
              href="/projects?tab=audit"
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "audit"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <IconChartBar className="w-4 h-4" />
              Audit Projects
              <span
                className={`py-0.5 px-2 rounded-full text-xs ${
                  activeTab === "audit"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {auditProjects?.length || 0}
              </span>
            </Link>
          </nav>
        </div>

        {/* Project Lists */}
        <div className="p-6">
          {activeTab === "seo" ? (
            <ProjectList
              projects={seoProjects || []}
              projectType="seo"
              emptyMessage="No SEO projects yet. Create your first SEO project to start comprehensive website analysis."
              pageCount={pageCount}
              issueCount={issueCount}
            />
          ) : (
            <ProjectList
              projects={auditProjects || []}
              projectType="audit"
              emptyMessage="No audit projects yet. Create your first audit project for quick website assessments."
              pageCount={pageCount}
              issueCount={issueCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
