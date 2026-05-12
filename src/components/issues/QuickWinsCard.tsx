"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconBolt, IconCircleCheck, IconClock } from "@tabler/icons-react";
import Badge from "@/components/ui/Badge";
import { getIssueAdvice } from "@/utils/issue-advice";

interface QuickWinIssue {
  id: string;
  issue_type: string;
  severity: string;
  description: string;
  project_id: string;
  project_name: string;
  page_id: string;
  page_url: string;
}

interface QuickWinsCardProps {
  issues: QuickWinIssue[];
}

const QUICK_EFFORT_PATTERNS = [
  /^2 minutes$/i,
  /^5 minutes$/i,
  /^10 minutes$/i,
];

const severityBadgeVariant: Record<
  string,
  "severity-critical" | "severity-high" | "severity-medium" | "severity-low"
> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

function isQuickEffort(effort: string): boolean {
  return QUICK_EFFORT_PATTERNS.some((pattern) => pattern.test(effort));
}

function formatEffort(effort: string): string {
  const match = effort.match(/^(\d+)\s*minutes?$/i);
  if (match) return `${match[1]} min fix`;
  return effort;
}

function truncateUrl(url: string, maxLength = 40): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname + parsed.search;
    const display = parsed.hostname + path;
    if (display.length <= maxLength) return display;
    return display.slice(0, maxLength - 1) + "…";
  } catch {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 1) + "…";
  }
}

export default function QuickWinsCard({ issues }: QuickWinsCardProps) {
  const quickWins = useMemo(() => {
    return issues
      .filter((issue) => {
        if (issue.severity !== "critical" && issue.severity !== "high")
          return false;
        const advice = getIssueAdvice(issue.issue_type);
        if (!advice) return false;
        return isQuickEffort(advice.estimatedEffort);
      })
      .slice(0, 5);
  }, [issues]);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <IconBolt className="w-4 h-4 text-[var(--color-score-warning)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Quick Wins
        </h3>
      </div>

      {quickWins.length === 0 ? (
        /* Empty state */
        <div className="text-center py-8 px-5">
          <IconCircleCheck className="w-10 h-10 mx-auto text-[var(--color-score-good)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            All caught up!
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            No quick fixes available right now.
          </p>
        </div>
      ) : (
        /* Quick wins list */
        <div className="p-3 space-y-2">
          {quickWins.map((issue) => {
            const advice = getIssueAdvice(issue.issue_type);
            const issueTitle = advice?.title ?? issue.issue_type;
            const effort = advice?.estimatedEffort ?? "";

            return (
              <Link
                key={issue.id}
                href={`/projects/${issue.project_id}/pages/${issue.page_id}`}
                className="block rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] px-4 py-3 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-default)] transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Severity badge */}
                  <Badge
                    variant={severityBadgeVariant[issue.severity] || "neutral"}
                    className="flex-shrink-0 capitalize mt-0.5"
                  >
                    {issue.severity}
                  </Badge>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {issueTitle}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      {issue.project_name} &middot;{" "}
                      {truncateUrl(issue.page_url)}
                    </p>
                  </div>

                  {/* Effort badge */}
                  {effort && (
                    <Badge variant="good" className="flex-shrink-0">
                      <IconClock className="w-3 h-3" />
                      {formatEffort(effort)}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
