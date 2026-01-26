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
  IconDownload,
  IconAlertCircle,
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
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href={`/projects`}
          className={`bg-white hover:bg-neutral-50 rounded-lg shadow p-6 transition-all duration-300 ease-in-out`}
        >
          <div className={`flex justify-between items-start`}>
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Total Projects
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {projectCount || 0}
              </h2>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconFolder className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Issues Detected
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {issuesCount || 0}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Unfixed issues</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <IconAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Pages Scanned
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mt-2">
                {pagesCount || 0}
              </h2>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <IconFileSearch className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">
              Recent Projects
            </h3>
          </div>

          <div className="divide-y divide-neutral-200">
            {projects && projects.length > 0 ? (
              projects.map((project: Project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-neutral-900">
                        {project.name}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-1">
                        {project.url}
                      </p>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {project.created_at &&
                        format(
                          parseISO(new Date(project.created_at).toISOString()),
                          "MMM d, yyyy"
                        )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-neutral-500">
                  No projects yet. Create your first project.
                </p>
                <Link
                  href="/projects/new"
                  className="mt-4 inline-block text-secondary hover:text-secondary/80 font-medium"
                >
                  Create a Project
                </Link>
              </div>
            )}
          </div>

          {projects && projects.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <Link
                href="/projects"
                className="text-secondary hover:text-secondary/80 text-sm font-medium"
              >
                View all projects
              </Link>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">
              Recent Scans
            </h3>
          </div>

          <div className="divide-y divide-neutral-200">
            {recentScans && recentScans.length > 0 ? (
              recentScans.map((scan: any) => (
                <div key={scan.id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-neutral-900">
                        {scan.projects.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-block h-2 w-2 rounded-full mr-2 ${
                            scan.status === "completed"
                              ? "bg-green-500"
                              : scan.status === "in_progress"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <p className="text-sm text-neutral-500 capitalize">
                          {scan.status} | {scan.pages_scanned} pages |{" "}
                          {scan.issues_found} issues
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {scan.started_at &&
                        format(new Date(scan.started_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-neutral-500">
                  No scans yet. Create a project and start scanning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Issues Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">
            Recent Issues
          </h3>
          {(issuesCount || 0) > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              {issuesCount} unfixed
            </span>
          )}
        </div>

        <div className="divide-y divide-neutral-200">
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
                      <IconAlertCircle
                        className={`h-5 w-5 ${
                          issue.severity === "critical"
                            ? "text-red-500"
                            : issue.severity === "high"
                              ? "text-orange-500"
                              : issue.severity === "medium"
                                ? "text-yellow-500"
                                : "text-blue-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {issue.description}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 truncate">
                        {issue.projects?.name} | {issue.pages?.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getSeverityColor(issue.severity)}`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {issue.created_at &&
                        format(new Date(issue.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <IconAlertTriangle className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No issues detected yet.</p>
              <p className="text-sm text-neutral-400 mt-1">
                Issues will appear here after scanning your projects.
              </p>
            </div>
          )}
        </div>

        {recentIssues && recentIssues.length > 0 && (issuesCount || 0) > 5 && (
          <div className="px-6 py-4 border-t border-neutral-200">
            <Link
              href="/projects"
              className="text-secondary hover:text-secondary/80 text-sm font-medium"
            >
              View all issues in projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
