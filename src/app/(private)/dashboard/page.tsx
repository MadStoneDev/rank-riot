import Link from "next/link";
import { Database } from "../../../../database.types";

import {
  IconFolder,
  IconAlertTriangle,
  IconFileSearch,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/server";

type Project = Database["public"]["Tables"]["projects"]["Row"];

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <Link
          href="/projects/new"
          className="bg-secondary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm"
        >
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href={`/projects`}
          className={`bg-white hover:bg-neutral-100 rounded-lg shadow p-6 transition-all duration-300 ease-in-out`}
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
            <div className="p-2 bg-primary-50 rounded-lg">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="block px-6 py-4 hover:bg-neutral-50"
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
                          "MMM d, yyyy",
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
                  className="mt-4 inline-block text-secondary hover:text-secondary font-medium"
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
                className="text-secondary hover:text-secondary text-sm font-medium"
              >
                View all projects
              </Link>
            </div>
          )}
        </div>

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
                          {scan.status} • {scan.pages_scanned} pages •{" "}
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
    </div>
  );
}
