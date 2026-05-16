"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconServer,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { StatusDistribution } from "@/types/technical-health";
import { truncateUrl } from "@/utils/technical-health";

interface HttpStatusCardProps {
  distribution: StatusDistribution[];
  projectId: string;
}

export default function HttpStatusCard({
  distribution,
  projectId,
}: HttpStatusCardProps) {
  const [activeTab, setActiveTab] = useState<"2xx" | "3xx" | "4xx" | "5xx">(
    () => {
      const problematic = distribution.find(
        (d) => d.category === "4xx" || d.category === "5xx"
      );
      if (problematic) return problematic.category;
      const redirect = distribution.find((d) => d.category === "3xx");
      if (redirect) return redirect.category;
      return "2xx";
    }
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const currentDist = distribution.find((d) => d.category === activeTab);
  const displayPages = isExpanded
    ? currentDist?.pages || []
    : (currentDist?.pages || []).slice(0, 5);

  const hasIssues = distribution.some(
    (d) => d.category === "4xx" || d.category === "5xx"
  );

  const totalPages = distribution.reduce((sum, d) => sum + d.count, 0);

  if (distribution.length === 0 || totalPages === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <IconServer className="h-5 w-5" />
          <span className="font-medium">No HTTP Data</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Run a crawl to analyze HTTP status codes
        </p>
      </div>
    );
  }

  if (!hasIssues) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Pages Healthy</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {totalPages} pages returning 2xx/3xx status codes
        </p>
      </div>
    );
  }

  const getTabColor = (category: string, isActive: boolean) => {
    if (!isActive) return "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]";
    switch (category) {
      case "2xx":
        return "text-[var(--color-score-good)] border-b-2 border-[var(--color-score-good)] bg-[var(--color-score-good-muted)]";
      case "3xx":
        return "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary-muted)]";
      case "4xx":
        return "text-[var(--color-severity-high)] border-b-2 border-[var(--color-severity-high)] bg-[var(--color-severity-high)]/10";
      case "5xx":
        return "text-[var(--color-severity-critical)] border-b-2 border-[var(--color-severity-critical)] bg-[var(--color-score-critical-muted)]";
      default:
        return "";
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <IconServer className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <span className="font-medium text-[var(--color-text-primary)]">
            HTTP Status Codes
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {totalPages} pages analyzed
        </p>
      </div>

      <div className="flex border-b border-[var(--color-border-subtle)] overflow-x-auto">
        {(["2xx", "3xx", "4xx", "5xx"] as const).map((category) => {
          const dist = distribution.find((d) => d.category === category);
          const count = dist?.count || 0;
          if (count === 0) return null;
          return (
            <button
              key={category}
              onClick={() => {
                setActiveTab(category);
                setIsExpanded(false);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap ${getTabColor(
                category,
                activeTab === category
              )}`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {currentDist && currentDist.pages.length > 0 && (
        <>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {displayPages.map((page) => (
              <Link
                key={page.id}
                href={`/projects/${projectId}/pages/${page.id}`}
                className="block px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {page.title || "Untitled"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {truncateUrl(page.url)}
                    </p>
                  </div>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      (page.http_status ?? 0) >= 500
                        ? "bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]"
                        : (page.http_status ?? 0) >= 400
                          ? "bg-[var(--color-severity-high)]/10 text-[var(--color-severity-high)]"
                          : (page.http_status ?? 0) >= 300
                            ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                            : "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]"
                    }`}
                  >
                    {page.http_status}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {(currentDist?.pages.length || 0) > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show Less <IconChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show All ({currentDist?.pages.length}){" "}
                  <IconChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
