import Link from "next/link";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconEqual,
  IconExternalLink,
} from "@tabler/icons-react";
import { getIssueAdvice } from "@/utils/issue-advice";

interface ResolvedIssue {
  id: string;
  issue_type: string;
  severity?: string;
  fixed_at?: string | null;
  pages?: { url?: string | null; title?: string | null } | null;
}

interface IssueChangePanelProps {
  projectId: string;
  newCount: number;
  resolvedCount: number;
  unchangedCount: number;
  resolvedIssues: ResolvedIssue[];
  sinceDate?: string | null;
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hostPath(url?: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.pathname === "/" ? u.hostname : u.pathname;
  } catch {
    return url;
  }
}

export default function IssueChangePanel({
  projectId,
  newCount,
  resolvedCount,
  unchangedCount,
  resolvedIssues,
  sinceDate,
}: IssueChangePanelProps) {
  const since = formatDate(sinceDate);

  const tiles = [
    {
      label: "Resolved",
      value: resolvedCount,
      Icon: IconCircleCheck,
      color:
        resolvedCount > 0
          ? "var(--color-score-good)"
          : "var(--color-text-muted)",
      bg: "var(--color-score-good-muted)",
    },
    {
      label: "New",
      value: newCount,
      Icon: IconAlertTriangle,
      color:
        newCount > 0
          ? "var(--color-score-critical)"
          : "var(--color-text-muted)",
      bg: "var(--color-score-critical-muted)",
    },
    {
      label: "Still open",
      value: unchangedCount,
      Icon: IconEqual,
      color: "var(--color-text-secondary)",
      bg: "var(--color-surface-elevated)",
    },
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          What changed since last scan
        </h3>
        {since && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Compared with your previous scan on {since}
          </p>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border-subtle)]">
        {tiles.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="px-5 py-5 flex flex-col items-center text-center gap-2">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </span>
            <span
              className="text-2xl font-semibold tabular-nums"
              style={{ color }}
            >
              {value}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Resolved list — the wins */}
      {resolvedIssues.length > 0 && (
        <div className="border-t border-[var(--color-border-subtle)]">
          <div className="px-5 py-3">
            <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
              Fixed this scan
            </h4>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {resolvedIssues.map((issue) => {
              const advice = getIssueAdvice(issue.issue_type);
              const title = advice?.title ?? issue.issue_type;
              const path = hostPath(issue.pages?.url);
              return (
                <div
                  key={issue.id}
                  className="px-5 py-3 flex items-center gap-3"
                >
                  <IconCircleCheck className="w-4 h-4 flex-shrink-0 text-[var(--color-score-good)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {title}
                    </p>
                    {path && (
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {path}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {resolvedCount > resolvedIssues.length && (
            <div className="px-5 py-3 border-t border-[var(--color-border-subtle)]">
              <Link
                href={`/projects/${projectId}/compare`}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                +{resolvedCount - resolvedIssues.length} more resolved — view full
                comparison
                <IconExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
