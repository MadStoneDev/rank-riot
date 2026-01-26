import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { IconFileSearch, IconChartBar, IconInfoCircle } from "@tabler/icons-react";
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Your Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {totalProjectCount} of {limits.maxProjects === -1 ? "unlimited" : limits.maxProjects} projects used
            <span className="text-neutral-400 ml-1">({planInfo.name} plan)</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate ? (
            <Link
              href="/projects/new"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Create New Project
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Project limit reached</span>
              <Link
                href="/dashboard/billing"
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Show upgrade prompt banner when near limit */}
      {!canCreate && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">You've reached your project limit</h4>
                <p className="text-sm text-white/80 mt-1">
                  Upgrade to {userPlan === "free" ? "Starter" : userPlan === "starter" ? "Pro" : "Business"} for more projects and advanced features.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/projects?tab=seo"
            className={`
              py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
              ${
                activeTab === "seo"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }
            `}
          >
            <IconFileSearch className="w-5 h-5 mr-2" />
            SEO Projects
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === "seo"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {seoProjects?.length || 0}
            </span>
          </Link>

          <Link
            href="/projects?tab=audit"
            className={`
              py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
              ${
                activeTab === "audit"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }
            `}
          >
            <IconChartBar className="w-5 h-5 mr-2" />
            Audit Projects
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === "audit"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {auditProjects?.length || 0}
            </span>
          </Link>
        </nav>
      </div>

      {/* Project Lists */}
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
  );
}
