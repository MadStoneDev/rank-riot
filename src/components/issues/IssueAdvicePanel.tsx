"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconClock,
} from "@tabler/icons-react";
import Badge from "@/components/ui/Badge";
import { getIssueAdvice } from "@/utils/issue-advice";

interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  description: string;
  details?: any;
  page_url?: string;
  page_title?: string;
}

interface IssueAdvicePanelProps {
  issues: Issue[];
  title?: string;
  maxItems?: number;
  showPageLink?: boolean;
  projectId?: string;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const severityBadgeVariant: Record<
  string,
  "severity-critical" | "severity-high" | "severity-medium" | "severity-low"
> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

const severityDotColor: Record<string, string> = {
  critical: "bg-[var(--color-severity-critical)]",
  high: "bg-[var(--color-severity-high)]",
  medium: "bg-[var(--color-severity-medium)]",
  low: "bg-[var(--color-severity-low)]",
};

// High cap on purpose: the URL is rendered in a flex container with CSS
// `truncate`, so width-based clipping already adapts to the screen. A low cap
// here just clipped URLs short even when there was plenty of room.
function truncateUrl(url: string, maxLength = 120): string {
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

export default function IssueAdvicePanel({
  issues,
  title = "Issues",
  maxItems,
  showPageLink = true,
  projectId,
}: IssueAdvicePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const sortedIssues = useMemo(
    () =>
      [...issues].sort(
        (a, b) =>
          (SEVERITY_ORDER[a.severity] ?? 99) -
          (SEVERITY_ORDER[b.severity] ?? 99),
      ),
    [issues],
  );

  const visibleIssues =
    maxItems && !showAll ? sortedIssues.slice(0, maxItems) : sortedIssues;
  const hasMore = maxItems ? sortedIssues.length > maxItems : false;

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (issues.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          No issues found.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {title}
        </h3>
        <Badge variant="neutral">{issues.length} issues</Badge>
      </div>

      {/* Issue list */}
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {visibleIssues.map((issue) => {
          const advice = getIssueAdvice(issue.issue_type);
          const isExpanded = expandedId === issue.id;
          const issueTitle = advice?.title ?? issue.issue_type;

          return (
            <div key={issue.id}>
              {/* Collapsed row */}
              <button
                type="button"
                onClick={() => toggleExpand(issue.id)}
                className="w-full text-left px-5 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Severity dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${severityDotColor[issue.severity] || "bg-[var(--color-text-muted)]"}`}
                  />

                  {/* Title and page URL */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {issueTitle}
                    </p>
                    {showPageLink && issue.page_url && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                        {truncateUrl(issue.page_url)}
                      </p>
                    )}
                  </div>

                  {/* Effort badge */}
                  {advice?.estimatedEffort && (
                    <Badge variant="neutral" className="flex-shrink-0 hidden sm:inline-flex">
                      <IconClock className="w-3 h-3" />
                      {advice.estimatedEffort}
                    </Badge>
                  )}

                  {/* Severity badge */}
                  <Badge
                    variant={severityBadgeVariant[issue.severity] || "neutral"}
                    className="flex-shrink-0 capitalize"
                  >
                    {issue.severity}
                  </Badge>

                  {/* Expand chevron */}
                  {isExpanded ? (
                    <IconChevronUp className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Expanded advice panel */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isExpanded ? "1000px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                {advice ? (
                  <div className="px-5 pb-4 pt-1 bg-[var(--color-surface-overlay)]">
                    {/* Description */}
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                      {advice.description}
                    </p>

                    {/* How to Fix */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">
                        How to Fix
                      </h4>
                      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-1">
                        {advice.howToFix.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Code example */}
                    {advice.codeExample && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">
                          Example
                        </h4>
                        <pre className="bg-[var(--color-surface-base)] border-l-2 border-[var(--color-primary)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)] overflow-x-auto whitespace-pre-wrap">
                          {advice.codeExample}
                        </pre>
                      </div>
                    )}

                    {/* Footer with effort + page link */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--color-border-subtle)]">
                      <Badge variant="neutral">
                        <IconClock className="w-3 h-3" />
                        Estimated: {advice.estimatedEffort}
                      </Badge>

                      {showPageLink &&
                        projectId &&
                        issue.page_url &&
                        issue.details?.page_id && (
                          <Link
                            href={`/projects/${projectId}/pages/${issue.details.page_id}`}
                            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                          >
                            View page
                            <IconExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 pb-4 pt-1 bg-[var(--color-surface-overlay)]">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {issue.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show all toggle */}
      {hasMore && (
        <div className="border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="w-full px-5 py-3 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            {showAll
              ? "Show less"
              : `Show all ${sortedIssues.length} issues`}
          </button>
        </div>
      )}
    </div>
  );
}
