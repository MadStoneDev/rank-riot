"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowDown,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { PageWithDepth } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface DeepPagesCardProps {
  pages: PageWithDepth[];
  projectId: string;
  threshold?: number;
}

export default function DeepPagesCard({
  pages,
  projectId,
  threshold = 4,
}: DeepPagesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">No Deep Pages</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages accessible within {threshold - 1} clicks
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-medium)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-warning-muted)] border-b border-[var(--color-severity-medium)]/20">
        <div className="flex items-center gap-2">
          <IconArrowDown className="h-5 w-5 text-[var(--color-severity-medium)]" />
          <span className="font-medium text-[var(--color-score-warning)]">
            Deep Pages ({pages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages at depth {threshold}+ (may be hard to find)
        </p>
      </div>

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
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]">
                Depth {page.depth}
              </span>
            </div>
          </Link>
        ))}
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
