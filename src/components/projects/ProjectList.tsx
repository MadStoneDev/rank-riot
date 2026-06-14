"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconChevronRight,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconFileSearch,
  IconChartBar,
  IconSettings,
  IconTrash,
  IconLoader2,
  IconDotsVertical,
  IconWorld,
} from "@tabler/icons-react";
import { deleteProject } from "@/app/(private)/projects/actions";
import { toast } from "sonner";
import { Database } from "../../../database.types";
import Modal from "@/components/ui/Modal";

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
  projects: initialProjects,
  projectType,
  emptyMessage,
  pageCount = {},
  issueCount = {},
}: ProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.url.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

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

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-2 py-1.5 sm:px-3 text-xs rounded-md flex items-center gap-1 transition-colors ${
        sortField === field
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{field === "last_scan" ? "Scan" : label}</span>
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
      <div className="glass-card p-12 text-center">
        <div className="mb-4">
          {projectType === "seo" ? (
            <IconFileSearch className="w-16 h-16 mx-auto text-[var(--color-text-muted)]" />
          ) : (
            <IconChartBar className="w-16 h-16 mx-auto text-[var(--color-text-muted)]" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          No {projectType === "seo" ? "SEO" : "Audit"} Projects Yet
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">{emptyMessage}</p>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Create Your First {projectType === "seo" ? "SEO" : "Audit"} Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls — flat row (no nested card) to match the
          dashboard's cleaner, less boxed-in look. */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-default)] rounded-lg text-sm bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Sort:</span>
          <SortButton field="name" label="Name" />
          <SortButton field="last_scan" label="Last Scan" />
          <SortButton field="created" label="Created" />
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Found {sortedProjects.length} of {projects.length} projects
        </p>
      )}

      {/* Project List */}
      {sortedProjects.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {sortedProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              projectType={projectType}
              sortField={sortField}
              pageCount={pageCount[project.id]}
              issueCount={issueCount[project.id]}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">No projects match your search</p>
        </div>
      )}
    </div>
  );
}

function ProjectListItem({
  project,
  projectType,
  sortField,
  pageCount,
  issueCount,
  onDelete,
}: {
  project: Project;
  projectType: "seo" | "audit";
  sortField: SortField;
  pageCount?: number;
  issueCount?: number;
  onDelete: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openDeleteModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProject(project.id);
    if (result?.error) {
      toast.error(result.error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    } else {
      toast.success("Project removed");
      onDelete(project.id); // removes this item from the list (unmounts)
    }
  };

  const faviconUrl = (() => {
    try {
      const domain = new URL(project.url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  })();

  return (
    <div className="glass-card group/project relative flex items-stretch overflow-hidden">
      {/* Main content */}
      <Link
        href={`/projects/${project.id}`}
        className="block flex-1 min-w-0 hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div className="px-3 py-3 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Site favicon/thumbnail */}
            <div className="flex-shrink-0 hidden sm:block">
              <div className="h-12 w-12 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] flex items-center justify-center overflow-hidden">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt=""
                    className="h-7 w-7"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <IconWorld className={`h-6 w-6 text-[var(--color-text-muted)] ${faviconUrl ? "hidden" : ""}`} />
              </div>
            </div>

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-0">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs sm:text-xs font-medium flex-shrink-0 ${
                    projectType === "seo"
                      ? "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]"
                      : "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                  }`}
                >
                  {projectType === "seo" ? "SEO" : "Audit"}
                </span>
                <span
                  className={`px-1.5 py-0.5 text-xs sm:text-xs font-medium rounded-full flex-shrink-0 ${
                    project.last_scan_at
                      ? "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]"
                      : "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]"
                  }`}
                >
                  {project.last_scan_at ? "Scanned" : "Pending"}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-[var(--color-text-primary)] truncate">
                {project.name}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[var(--color-text-muted)] truncate">
                {project.url}
              </p>
            </div>

            {/* Stats + meta */}
            <div className="ml-auto flex-shrink-0 flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {pageCount !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]">
                    {pageCount} pages
                  </span>
                )}
                {issueCount !== undefined && issueCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-score-critical)]/15 text-[var(--color-score-critical)]">
                    {issueCount} issues
                  </span>
                )}
              </div>
              <div className="hidden md:block text-sm text-right min-w-[110px]">
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                  {sortField === "created" ? "Created on" : "Last scan on"}
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  {sortField === "created"
                    ? project.created_at
                      ? format(new Date(project.created_at), "MMM d, yyyy")
                      : "Unknown"
                    : project.last_scan_at
                      ? format(new Date(project.last_scan_at), "MMM d, yyyy")
                      : "Never scanned"}
                </p>
              </div>
              <div className="hidden lg:block">
                <IconChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Mobile toggle button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setShowActions(!showActions);
        }}
        className="lg:hidden flex-shrink-0 grid place-content-center w-10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        aria-label="Toggle actions"
      >
        <IconDotsVertical className="h-5 w-5" />
      </button>

      {/* Slide-out actions panel */}
      <div
        className={`
          flex-shrink-0 flex items-stretch
          overflow-hidden transition-all duration-300 ease-in-out
          ${showActions ? "max-w-[120px]" : "max-w-0 lg:group-hover/project:max-w-[120px]"}
        `}
      >
        <div className="flex items-stretch bg-[var(--color-surface-overlay)] w-[120px] border-l border-[var(--color-border-subtle)]">
          <Link
            href={`/projects/${project.id}/settings`}
            className="flex-1 grid place-content-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            title="Settings"
            onClick={(e) => e.stopPropagation()}
          >
            <IconSettings className="h-5 w-5" />
          </Link>

          <button
            onClick={openDeleteModal}
            className="flex-1 grid place-content-center transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-hover)]"
            title="Remove project"
          >
            <IconTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
        title="Delete project"
        subtitle={project.name}
        maxWidth="max-w-md"
      >
        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This removes{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              {project.name}
            </span>{" "}
            from your dashboard. Crawled data is retained for backlink
            analysis. This can&apos;t be undone from here.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-overlay)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-danger hover:bg-danger-hover disabled:opacity-50"
            >
              {isDeleting && <IconLoader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete project"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { IconFileSearch, IconChartBar };
