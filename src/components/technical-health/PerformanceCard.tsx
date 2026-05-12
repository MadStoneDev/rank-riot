"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconGauge,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconFile,
} from "@tabler/icons-react";
import { SlowPage, LargePage } from "@/types/technical-health";
import { truncateUrl, formatBytes, formatLoadTime } from "@/utils/technical-health";

interface PerformanceCardProps {
  slowPages: SlowPage[];
  largePages: LargePage[];
  projectId: string;
}

export default function PerformanceCard({
  slowPages,
  largePages,
  projectId,
}: PerformanceCardProps) {
  const [activeTab, setActiveTab] = useState<"slow" | "large">(
    slowPages.length > 0 ? "slow" : "large"
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPages = activeTab === "slow" ? slowPages : largePages;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  if (slowPages.length === 0 && largePages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">Good Performance</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages load quickly and are optimally sized
        </p>
      </div>
    );
  }

  const hasBothTypes = slowPages.length > 0 && largePages.length > 0;

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-medium)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-warning-muted)] border-b border-[var(--color-severity-medium)]/20">
        <div className="flex items-center gap-2">
          <IconGauge className="h-5 w-5 text-[var(--color-severity-medium)]" />
          <span className="font-medium text-[var(--color-score-warning)]">
            Performance Issues ({slowPages.length + largePages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages with slow load times or large file sizes
        </p>
      </div>

      {hasBothTypes && (
        <div className="flex border-b border-[var(--color-border-subtle)]">
          <button
            onClick={() => {
              setActiveTab("slow");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
              activeTab === "slow"
                ? "text-[var(--color-score-warning)] border-b-2 border-[var(--color-score-warning)] bg-[var(--color-score-warning-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <IconClock className="h-4 w-4" />
            Slow ({slowPages.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("large");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
              activeTab === "large"
                ? "text-[var(--color-score-warning)] border-b-2 border-[var(--color-score-warning)] bg-[var(--color-score-warning-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <IconFile className="h-4 w-4" />
            Large ({largePages.length})
          </button>
        </div>
      )}

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
                {activeTab === "slow"
                  ? formatLoadTime((page as SlowPage).load_time_ms)
                  : formatBytes((page as LargePage).size_bytes)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
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
              Show All ({currentPages.length}){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
