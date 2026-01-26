"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconRefresh,
  IconChevronRight,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconFileSearch,
  IconChartBar,
} from "@tabler/icons-react";
import { Database } from "../../../database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectListProps {
  projects: Project[];
  projectType: "seo" | "audit";
  emptyMessage: string;
  pageCount?: { [projectId: string]: number };
  issueCount?: { [projectId: string]: number };
}

type SortField = "name" | "last_scan" | "created";
type SortDirection = "asc" | "desc";

export default function ProjectList({
  projects,
  projectType,
  emptyMessage,
  pageCount = {},
  issueCount = {},
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.url.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "last_scan":
          const aDate = a.last_scan_at ? new Date(a.last_scan_at).getTime() : 0;
          const bDate = b.last_scan_at ? new Date(b.last_scan_at).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case "created":
          const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
          comparison = aCreated - bCreated;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredProjects, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 transition-colors ${
        sortField === field
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <IconSortAscending className="h-3 w-3" />
        ) : (
          <IconSortDescending className="h-3 w-3" />
        ))}
    </button>
  );

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
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Sort:</span>
          <SortButton field="name" label="Name" />
          <SortButton field="last_scan" label="Last Scan" />
          <SortButton field="created" label="Created" />
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-neutral-500">
          Found {sortedProjects.length} of {projects.length} projects
        </p>
      )}

      {/* Project List */}
      {sortedProjects.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-neutral-200">
            {sortedProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                projectType={projectType}
                pageCount={pageCount[project.id]}
                issueCount={issueCount[project.id]}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-neutral-500">No projects match your search</p>
        </div>
      )}
    </div>
  );
}

function ProjectListItem({
  project,
  projectType,
  pageCount,
  issueCount,
}: {
  project: Project;
  projectType: "seo" | "audit";
  pageCount?: number;
  issueCount?: number;
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
            <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
              {/* Stats badges */}
              <div className="hidden sm:flex items-center gap-2">
                {pageCount !== undefined && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                    {pageCount} pages
                  </span>
                )}
                {issueCount !== undefined && issueCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                    {issueCount} issues
                  </span>
                )}
              </div>
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
export { IconFileSearch, IconChartBar };
