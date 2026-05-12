"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconUnlink,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { OrphanPage } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface OrphanPagesCardProps {
  pages: OrphanPage[];
  projectId: string;
}

export default function OrphanPagesCard({
  pages,
  projectId,
}: OrphanPagesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">No Orphan Pages</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages have internal links pointing to them
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-critical)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-critical-muted)] border-b border-[var(--color-severity-critical)]/20">
        <div className="flex items-center gap-2">
          <IconUnlink className="h-5 w-5 text-[var(--color-severity-critical)]" />
          <span className="font-medium text-[var(--color-severity-critical)]">
            Orphan Pages ({pages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages with no internal links pointing to them
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayPages.map((page) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {page.title || "Untitled Page"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {truncateUrl(page.url)}
            </p>
          </Link>
        ))}
      </div>

      {pages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-[var(--color-severity-critical)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
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
