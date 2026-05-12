"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileStack,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { SimilarContentGroup } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface SimilarContentCardProps {
  groups: SimilarContentGroup[];
  projectId: string;
}

export default function SimilarContentCard({
  groups,
  projectId,
}: SimilarContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const displayGroups = isExpanded ? groups : groups.slice(0, 3);

  const toggleGroup = (index: number) => {
    const next = new Set(expandedGroups);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedGroups(next);
  };

  if (groups.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconFileStack className="h-5 w-5" />
          <span className="font-medium">No Similar Content</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          No pages with highly similar content detected
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-primary)]/20">
      <div className="px-4 py-3 bg-[var(--color-primary-muted)] border-b border-[var(--color-primary)]/20">
        <div className="flex items-center gap-2">
          <IconFileStack className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-medium text-[var(--color-primary)]">
            Similar Content ({groups.length} groups)
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages with similar keyword profiles (may indicate duplicate content)
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayGroups.map((group, index) => {
          const isGroupExpanded = expandedGroups.has(index);

          return (
            <div key={index} className="px-4 py-3">
              <button
                onClick={() => toggleGroup(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      Group {index + 1}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                      {group.similarity}% similar
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {group.pages.length} pages with overlapping content
                  </p>
                </div>
                {isGroupExpanded ? (
                  <IconChevronDown className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                ) : (
                  <IconChevronRight className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-[var(--color-primary)]/30 pl-3">
                  {group.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/projects/${projectId}/pages/${page.id}`}
                      className="block py-1"
                    >
                      <span className="text-sm text-[var(--color-primary)] hover:underline">
                        {truncateUrl(page.url)}
                      </span>
                      {page.title && (
                        <span className="block text-xs text-[var(--color-text-muted)] truncate">
                          {page.title}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {groups.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              Show Less <IconChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show All ({groups.length} groups){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
