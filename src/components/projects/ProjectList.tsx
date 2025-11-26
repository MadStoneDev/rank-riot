"use client";

import Link from "next/link";
import { format } from "date-fns";
import { IconRefresh, IconChevronRight } from "@tabler/icons-react";
import { Database } from "../../../database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectListProps {
  projects: Project[];
  projectType: "seo" | "audit";
  emptyMessage: string;
}

export default function ProjectList({
  projects,
  projectType,
  emptyMessage,
}: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          {projectType === "seo" ? (
            <IconFileSearch className="w-16 h-16 mx-auto text-neutral-300" />
          ) : (
            <IconChartBar className="w-16 h-16 mx-auto text-neutral-300" />
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2">
          No {projectType === "seo" ? "SEO" : "Audit"} Projects Yet
        </h2>
        <p className="text-neutral-600 mb-6">{emptyMessage}</p>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Create Your First {projectType === "seo" ? "SEO" : "Audit"} Project
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-md">
      <ul className="divide-y divide-neutral-200">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            projectType={projectType}
          />
        ))}
      </ul>
    </div>
  );
}

function ProjectListItem({
  project,
  projectType,
}: {
  project: Project;
  projectType: "seo" | "audit";
}) {
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="block hover:bg-neutral-50 transition-colors"
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-secondary font-medium">
                    {project.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-neutral-900 truncate">
                    {project.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      projectType === "seo"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {projectType === "seo" ? "SEO" : "Audit"}
                  </span>
                </div>
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
                    ? format(new Date(project.last_scan_at), "MMM d, yyyy")
                    : "Never"}
                </p>
              </div>
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
                  {format(new Date(project.created_at!), "MMM d, yyyy")}
                </span>
              </div>
              {projectType === "seo" && project.scan_frequency && (
                <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                  <span className="capitalize">
                    Scan frequency: {project.scan_frequency}
                  </span>
                </div>
              )}
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
}

// Re-export icons for use in parent component
import { IconFileSearch, IconChartBar } from "@tabler/icons-react";
export { IconFileSearch, IconChartBar };
