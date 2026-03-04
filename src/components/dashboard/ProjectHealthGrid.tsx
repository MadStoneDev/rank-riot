import Link from "next/link";
import { IconFile, IconLink, IconAlertTriangle } from "@tabler/icons-react";
import HealthScoreCircle from "./HealthScoreCircle";

interface ProjectHealth {
  id: string;
  name: string;
  url: string;
  healthScore: number;
  pagesCount: number;
  issuesCount: number;
  brokenLinksCount: number;
}

interface ProjectHealthGridProps {
  projects: ProjectHealth[];
}

export default function ProjectHealthGrid({ projects }: ProjectHealthGridProps) {
  if (projects.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Project Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <HealthScoreCircle score={project.healthScore} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{project.url}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <IconFile className="w-3.5 h-3.5" />
                    {project.pagesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconLink className="w-3.5 h-3.5 text-red-400" />
                    {project.brokenLinksCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconAlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                    {project.issuesCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
