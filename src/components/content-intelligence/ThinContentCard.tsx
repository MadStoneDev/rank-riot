"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileText,
  IconChevronDown,
  IconChevronUp,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { ThinContentPage, DEFAULT_THRESHOLDS } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface ThinContentCardProps {
  pages: ThinContentPage[];
  projectId: string;
  threshold?: number;
}

export default function ThinContentCard({
  pages,
  projectId,
  threshold = DEFAULT_THRESHOLDS.thinContentWords,
}: ThinContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  const criticalCount = pages.filter(
    (p) => (p.word_count || 0) < DEFAULT_THRESHOLDS.criticalThinContentWords
  ).length;

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconFileText className="h-5 w-5" />
          <span className="font-medium">No Thin Content</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages have sufficient content ({threshold}+ words)
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-medium)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-warning-muted)] border-b border-[var(--color-severity-medium)]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconFileText className="h-5 w-5 text-[var(--color-severity-medium)]" />
            <span className="font-medium text-[var(--color-score-warning)]">
              Thin Content ({pages.length})
            </span>
          </div>
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]">
              <IconAlertTriangle className="h-3 w-3" />
              {criticalCount} critical
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages with fewer than {threshold} words
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayPages.map((page) => {
          const isCritical =
            (page.word_count || 0) < DEFAULT_THRESHOLDS.criticalThinContentWords;
          return (
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
                    isCritical
                      ? "bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]"
                      : "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]"
                  }`}
                >
                  {page.word_count || 0} words
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {pages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-[var(--color-score-warning)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              Show Less <IconChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show All ({pages.length}) <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
