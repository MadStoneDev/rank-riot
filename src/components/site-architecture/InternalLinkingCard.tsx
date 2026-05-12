"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconLink,
  IconChevronDown,
  IconChevronUp,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { PageLinkStats } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface InternalLinkingCardProps {
  mostLinked: PageLinkStats[];
  leastLinked: PageLinkStats[];
  projectId: string;
}

export default function InternalLinkingCard({
  mostLinked,
  leastLinked,
  projectId,
}: InternalLinkingCardProps) {
  const [activeTab, setActiveTab] = useState<"most" | "least">("most");
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPages = activeTab === "most" ? mostLinked : leastLinked;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  if (mostLinked.length === 0 && leastLinked.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <IconLink className="h-5 w-5" />
          <span className="font-medium">No Link Data</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Run a crawl to analyze internal linking
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-primary)]/20">
      <div className="px-4 py-3 bg-[var(--color-primary-muted)] border-b border-[var(--color-primary)]/20">
        <div className="flex items-center gap-2">
          <IconLink className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-medium text-[var(--color-primary)]">Internal Linking</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages ranked by internal link count
        </p>
      </div>

      <div className="flex border-b border-[var(--color-border-subtle)]">
        <button
          onClick={() => {
            setActiveTab("most");
            setIsExpanded(false);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
            activeTab === "most"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          }`}
        >
          <IconArrowUp className="h-4 w-4" />
          Most Linked
        </button>
        <button
          onClick={() => {
            setActiveTab("least");
            setIsExpanded(false);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
            activeTab === "least"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          }`}
        >
          <IconArrowDown className="h-4 w-4" />
          Least Linked
        </button>
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
              <div className="ml-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]">
                  {page.inboundCount} in
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  {page.outboundCount} out
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
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
              Show All ({currentPages.length}){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
