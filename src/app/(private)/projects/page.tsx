import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { IconFileSearch, IconChartBar } from "@tabler/icons-react";
import ProjectList from "@/components/projects/ProjectList";

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

  // Get page counts per project
  const allProjects = [...(seoProjects || []), ...(auditProjects || [])];
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Your Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Create New Project
        </Link>
      </div>

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
