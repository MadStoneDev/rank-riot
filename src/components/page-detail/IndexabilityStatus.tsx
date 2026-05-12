"use client";

import {
  IconCheck,
  IconX,
  IconArrowForward,
  IconRobot,
} from "@tabler/icons-react";

interface IndexabilityStatusProps {
  page: {
    url: string;
    is_indexable?: boolean | null;
    canonical_url?: string | null;
    has_robots_noindex?: boolean | null;
    has_robots_nofollow?: boolean | null;
    redirect_url?: string | null;
  };
}

export default function IndexabilityStatus({ page }: IndexabilityStatusProps) {
  const normalizeUrl = (url: string) =>
    url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const canonicalMatches =
    page.canonical_url &&
    normalizeUrl(page.canonical_url) === normalizeUrl(page.url);

  const robotsDirective = [];
  if (page.has_robots_noindex) robotsDirective.push("noindex");
  else robotsDirective.push("index");
  if (page.has_robots_nofollow) robotsDirective.push("nofollow");
  else robotsDirective.push("follow");

  const StatusItem = ({
    label,
    value,
    status,
    detail,
  }: {
    label: string;
    value: string;
    status: "success" | "warning" | "error" | "neutral";
    detail?: string;
  }) => {
    const statusColors = {
      success: "text-[var(--color-score-good)]",
      warning: "text-[var(--color-score-warning)]",
      error: "text-[var(--color-score-critical)]",
      neutral: "text-[var(--color-text-secondary)]",
    };

    const statusBg = {
      success: "bg-[var(--color-score-good-muted)]",
      warning: "bg-[var(--color-score-warning-muted)]",
      error: "bg-[var(--color-score-critical-muted)]",
      neutral: "bg-[var(--color-surface-elevated)]",
    };

    return (
      <div className="flex items-start justify-between py-3 border-b border-[var(--color-border-subtle)] last:border-0">
        <div className="flex items-center gap-2">
          {status === "success" ? (
            <IconCheck className="h-4 w-4 text-[var(--color-score-good)] flex-shrink-0" />
          ) : status === "error" ? (
            <IconX className="h-4 w-4 text-[var(--color-score-critical)] flex-shrink-0" />
          ) : status === "warning" ? (
            <IconArrowForward className="h-4 w-4 text-[var(--color-score-warning)] flex-shrink-0" />
          ) : (
            <IconRobot className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
          )}
          <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBg[status]} ${statusColors[status]}`}
          >
            {value}
          </span>
          {detail && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">
              {detail}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Indexability Status
        </h3>
      </div>
      <div className="px-6 py-2">
        <StatusItem
          label="Indexable"
          value={page.is_indexable !== false ? "Yes" : "No"}
          status={page.is_indexable !== false ? "success" : "error"}
        />
        <StatusItem
          label="Canonical"
          value={
            !page.canonical_url
              ? "Not set"
              : canonicalMatches
                ? "Matches"
                : "Different"
          }
          status={
            !page.canonical_url
              ? "warning"
              : canonicalMatches
                ? "success"
                : "warning"
          }
          detail={page.canonical_url || undefined}
        />
        <StatusItem
          label="Robots"
          value={robotsDirective.join(", ")}
          status={
            page.has_robots_noindex
              ? "warning"
              : page.has_robots_nofollow
                ? "warning"
                : "success"
          }
        />
        <StatusItem
          label="Redirect"
          value={page.redirect_url ? "Yes" : "None"}
          status={page.redirect_url ? "warning" : "success"}
          detail={page.redirect_url || undefined}
        />
      </div>
    </div>
  );
}
