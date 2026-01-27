import { Metadata } from "next";
import Link from "next/link";
import { Database } from "../../../../database.types";

export const metadata: Metadata = {
  title: "Dashboard | RankRiot",
  description:
    "View your SEO dashboard with project statistics, recent scans, and issue tracking all in one place.",
};

import {
  IconFolder,
  IconAlertTriangle,
  IconFileSearch,
  IconPlus,
  IconAlertCircle,
  IconArrowRight,
  IconClock,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/server";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Issue = Database["public"]["Tables"]["issues"]["Row"] & {
  pages?: { url: string; title: string | null };
  projects?: { name: string };
};

export default async function Dashboard() {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get recent projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get summary statistics
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  const { count: issuesCount } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .in("project_id", projects?.map((p) => p.id) || [])
    .eq("is_fixed", false);

  const { count: pagesCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .in("project_id", projects?.map((p) => p.id) || []);

  // Get recent scans
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*, projects(name)")
    .in("project_id", projects?.map((p) => p.id) || [])
    .order("started_at", { ascending: false })
    .limit(5);

  // Get recent issues
  const { data: recentIssues } = await supabase
    .from("issues")
    .select(
      `
      *,
      pages:page_id (url, title),
      projects:project_id (name)
    `
    )
    .in("project_id", projects?.map((p) => p.id) || [])
    .eq("is_fixed", false)
    .order("created_at", { ascending: false })
    .limit(5);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    const baseClass = "h-5 w-5";
    switch (severity.toLowerCase()) {
      case "critical":
        return <IconAlertCircle className={`${baseClass} text-red-500`} />;
      case "high":
        return <IconAlertCircle className={`${baseClass} text-orange-500`} />;
      case "medium":
        return <IconAlertCircle className={`${baseClass} text-yellow-500`} />;
      default:
        return <IconAlertCircle className={`${baseClass} text-blue-500`} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Welcome back! Here&apos;s an overview of your projects.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <IconPlus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/projects"
          className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Total Projects
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {projectCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1 flex items-center gap-1 group-hover:text-primary transition-colors">
                View all projects
                <IconArrowRight className="w-3 h-3" />
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <IconFolder className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Open Issues
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {issuesCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">Needs attention</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <IconAlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Pages Scanned
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {pagesCount || 0}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">Across all projects</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <IconFileSearch className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Recent Projects
            </h3>
            {projects && projects.length > 0 && (
              <Link
                href="/projects"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all
              </Link>
            )}
          </div>

          <div className="divide-y divide-neutral-100">
            {projects && projects.length > 0 ? (
              projects.map((project: Project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-0.5 truncate">
                        {project.url}
                      </p>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1 ml-4 flex-shrink-0">
                      <IconClock className="w-3 h-3" />
                      {project.created_at &&
                        format(
                          parseISO(new Date(project.created_at).toISOString()),
                          "MMM d"
                        )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <IconFolder className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-medium">No projects yet</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Create your first project to get started.
                </p>
                <Link
                  href="/projects/new"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  <IconPlus className="w-4 h-4" />
                  Create Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900">
              Recent Scans
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentScans && recentScans.length > 0 ? (
              recentScans.map((scan: any) => (
                <div key={scan.id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 truncate">
                        {scan.projects.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            scan.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : scan.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              scan.status === "completed"
                                ? "bg-green-500"
                                : scan.status === "in_progress"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          {scan.status}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {scan.pages_scanned} pages
                        </span>
                        <span className="text-xs text-neutral-500">
                          {scan.issues_found} issues
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1 ml-4 flex-shrink-0">
                      <IconClock className="w-3 h-3" />
                      {scan.started_at &&
                        format(new Date(scan.started_at), "MMM d")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <IconFileSearch className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-medium">No scans yet</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Create a project and start scanning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Issues Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-neutral-900">
              Recent Issues
            </h3>
            {(issuesCount || 0) > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {issuesCount} open
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {recentIssues && recentIssues.length > 0 ? (
            recentIssues.map((issue: Issue) => (
              <Link
                key={issue.id}
                href={`/projects/${issue.project_id}/pages/${issue.page_id}`}
                className="block px-6 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(issue.severity)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {issue.description}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 truncate">
                        {issue.projects?.name} &middot; {issue.pages?.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${getSeverityColor(issue.severity)}`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <IconAlertTriangle className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium">No issues detected</p>
              <p className="text-sm text-neutral-400 mt-1">
                Issues will appear here after scanning your projects.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
