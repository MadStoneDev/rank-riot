"use client";

import Link from "next/link";
import { Database } from "../../../database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ScanSchedulesProps {
  projects: Project[];
}

function formatFrequency(frequency: string | null): string {
  switch (frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "manual":
      return "Manual";
    default:
      return "—";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getScheduleDay(dateStr: string | null, frequency: string | null): string {
  if (!dateStr || !frequency || frequency === "manual") return "—";
  const date = new Date(dateStr);
  switch (frequency) {
    case "daily":
      return `Every day at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    case "weekly":
      return `Every ${date.toLocaleDateString(undefined, { weekday: "long" })} at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    case "monthly":
      return `${ordinal(date.getDate())} of each month at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    default:
      return "—";
  }
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function ScanSchedules({ projects }: ScanSchedulesProps) {
  const scheduledProjects = projects.filter(
    (p) => p.scan_frequency && p.scan_frequency !== "manual" && !p.deleted_at,
  );
  const manualProjects = projects.filter(
    (p) => (!p.scan_frequency || p.scan_frequency === "manual") && !p.deleted_at,
  );

  return (
    <div className="space-y-4">
      {scheduledProjects.length === 0 && manualProjects.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">
          No projects yet. Create a project to see its scan schedule here.
        </p>
      )}

      {scheduledProjects.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <th className="text-left py-2 pr-4 font-medium text-[var(--color-text-secondary)]">
                  Project
                </th>
                <th className="text-left py-2 pr-4 font-medium text-[var(--color-text-secondary)]">
                  Type
                </th>
                <th className="text-left py-2 pr-4 font-medium text-[var(--color-text-secondary)]">
                  Frequency
                </th>
                <th className="text-left py-2 pr-4 font-medium text-[var(--color-text-secondary)]">
                  Schedule
                </th>
                <th className="text-left py-2 pr-4 font-medium text-[var(--color-text-secondary)]">
                  Last Scan
                </th>
                <th className="text-left py-2 font-medium text-[var(--color-text-secondary)]">
                  Next Scan
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduledProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-[var(--color-border-subtle)] last:border-0"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/projects/${project.id}/settings`}
                      className="text-[var(--color-text-link)] hover:underline font-medium"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]">
                      {project.project_type === "audit" ? "Audit" : "SEO"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-primary)]">
                    {formatFrequency(project.scan_frequency)}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {getScheduleDay(project.next_scan_at, project.scan_frequency)}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {formatDate(project.last_scan_at)}
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        isOverdue(project.next_scan_at)
                          ? "text-[var(--color-score-warning)]"
                          : "text-[var(--color-text-muted)]"
                      }
                    >
                      {formatDate(project.next_scan_at)}
                      {isOverdue(project.next_scan_at) && " (overdue)"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {manualProjects.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 mt-4">
            Manual Only
          </h4>
          <div className="space-y-1">
            {manualProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-[var(--color-surface-overlay)]"
              >
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="text-sm text-[var(--color-text-link)] hover:underline font-medium"
                >
                  {project.name}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]">
                    {project.project_type === "audit" ? "Audit" : "SEO"}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Last: {formatDate(project.last_scan_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
