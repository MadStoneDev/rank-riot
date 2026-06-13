import Link from "next/link";
import { IconFile, IconLink, IconAlertTriangle } from "@tabler/icons-react";
import ScoreRing from "@/components/ui/ScoreRing";
import { SeverityBadge } from "@/components/ui/Badge";

interface ProjectHealth {
  id: string;
  name: string;
  url: string;
  projectType?: string;
  healthScore: number;
  pagesCount: number;
  issuesCount: number;
  brokenLinksCount: number;
}

interface ProjectHealthGridProps {
  projects: ProjectHealth[];
}

export default function ProjectHealthGrid({
  projects,
}: ProjectHealthGridProps) {
  if (projects.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Project Health
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group glass-card surface-interactive p-5 block"
          >
            <div className="flex items-start gap-4">
              <ScoreRing
                score={project.healthScore}
                size="sm"
                showLabel={false}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {project.name}
                  </h4>
                  {project.projectType && (
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        project.projectType === "seo"
                          ? "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]"
                          : "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                      }`}
                    >
                      {project.projectType === "seo" ? "SEO" : "Audit"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                  {project.url}
                </p>

                {/* Issue badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {project.issuesCount > 0 && (
                    <SeverityBadge
                      severity={
                        project.issuesCount > 10 ? "critical" : "medium"
                      }
                      count={project.issuesCount}
                    />
                  )}
                  {project.brokenLinksCount > 0 && (
                    <SeverityBadge
                      severity="high"
                      count={project.brokenLinksCount}
                    />
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <IconFile className="w-3.5 h-3.5" />
                    {project.pagesCount} pages
                  </span>
                  {project.brokenLinksCount > 0 && (
                    <span className="flex items-center gap-1 text-[var(--color-severity-high)]">
                      <IconLink className="w-3.5 h-3.5" />
                      {project.brokenLinksCount}
                    </span>
                  )}
                  {project.issuesCount > 0 && (
                    <span className="flex items-center gap-1 text-[var(--color-severity-medium)]">
                      <IconAlertTriangle className="w-3.5 h-3.5" />
                      {project.issuesCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
