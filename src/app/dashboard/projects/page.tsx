import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { IconSearch, IconRefresh, IconChevronRight } from "@tabler/icons-react";
import { Database } from "../../../database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default async function ProjectsPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Create New Project
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconSearch className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-neutral-200">
            {projects.map((project: any) => {
              // Calculate some statistics
              const lastScan =
                project.scans && project.scans.length > 0
                  ? project.scans.sort(
                      (a: any, b: any) =>
                        new Date(b.started_at).getTime() -
                        new Date(a.started_at).getTime(),
                    )[0]
                  : null;

              const pagesCount = project.pages ? project.pages.length : 0;

              const inProgressScans = project.scans
                ? project.scans.filter(
                    (scan: any) => scan.status === "in_progress",
                  ).length
                : 0;

              return (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="block hover:bg-neutral-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {project.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h2 className="text-base font-medium text-neutral-900 truncate">
                              {project.name}
                            </h2>
                            <div className="mt-1 flex items-center text-sm text-neutral-500">
                              <span className="truncate">{project.url}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center space-x-6">
                          <div className="text-sm text-neutral-500 text-right">
                            <p>
                              Last scan:{" "}
                              {project.last_scan_at
                                ? format(
                                    new Date(project.last_scan_at),
                                    "MMM d, yyyy",
                                  )
                                : "Never"}
                            </p>
                            <p>{pagesCount} pages scanned</p>
                          </div>
                          {inProgressScans > 0 && (
                            <div className="animate-spin text-primary-600">
                              <IconRefresh className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <IconChevronRight className="h-5 w-5 text-neutral-400" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex sm:space-x-4">
                          <div className="flex items-center text-sm text-neutral-500">
                            <span>
                              Created:{" "}
                              {format(
                                new Date(project.created_at),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                            <span className="capitalize">
                              Scan frequency: {project.scan_frequency}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              project.last_scan_at
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {project.last_scan_at ? "Scanned" : "Pending scan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-neutral-600 mb-6">
            Create your first project to start analyzing your website's SEO
            performance.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Create Your First Project
          </Link>
        </div>
      )}
    </div>
  );
}
