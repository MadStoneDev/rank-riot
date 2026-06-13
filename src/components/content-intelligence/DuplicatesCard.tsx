"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCopy,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { DuplicateGroup } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface DuplicatesCardProps {
  duplicateTitles: DuplicateGroup[];
  duplicateDescriptions: DuplicateGroup[];
  projectId: string;
}

export default function DuplicatesCard({
  duplicateTitles,
  duplicateDescriptions,
  projectId,
}: DuplicatesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"titles" | "descriptions">(
    duplicateTitles.length > 0 ? "titles" : "descriptions"
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const currentGroups =
    activeTab === "titles" ? duplicateTitles : duplicateDescriptions;
  const displayGroups = isExpanded ? currentGroups : currentGroups.slice(0, 3);

  const totalDuplicates =
    duplicateTitles.reduce((acc, g) => acc + g.pages.length - 1, 0) +
    duplicateDescriptions.reduce((acc, g) => acc + g.pages.length - 1, 0);

  const toggleGroup = (value: string) => {
    const next = new Set(expandedGroups);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setExpandedGroups(next);
  };

  if (duplicateTitles.length === 0 && duplicateDescriptions.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCopy className="h-5 w-5" />
          <span className="font-medium">No Duplicates Found</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All titles and descriptions are unique
        </p>
      </div>
    );
  }

  const hasBothTypes =
    duplicateTitles.length > 0 && duplicateDescriptions.length > 0;

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-medium)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-warning-muted)] border-b border-[var(--color-severity-medium)]/20">
        <div className="flex items-center gap-2">
          <IconCopy className="h-5 w-5 text-[var(--color-severity-medium)]" />
          <span className="font-medium text-[var(--color-score-warning)]">
            Duplicate Content ({totalDuplicates})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Same titles or descriptions used on multiple pages
        </p>
      </div>

      {hasBothTypes && (
        <div className="flex border-b border-[var(--color-border-subtle)]">
          <button
            onClick={() => {
              setActiveTab("titles");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "titles"
                ? "text-[var(--color-score-warning)] border-b-2 border-[var(--color-score-warning)] bg-[var(--color-score-warning-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            Titles ({duplicateTitles.length} groups)
          </button>
          <button
            onClick={() => {
              setActiveTab("descriptions");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "descriptions"
                ? "text-[var(--color-score-warning)] border-b-2 border-[var(--color-score-warning)] bg-[var(--color-score-warning-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            Descriptions ({duplicateDescriptions.length} groups)
          </button>
        </div>
      )}

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayGroups.map((group) => {
          const isGroupExpanded = expandedGroups.has(group.value);
          const reasonLabel =
            activeTab === "titles" ? "Same Title" : "Same Meta Description";
          const displayValue =
            group.value.length > 80
              ? group.value.substring(0, 80) + "..."
              : group.value;

          return (
            <div key={group.value} className="px-4 py-3">
              <button
                onClick={() => toggleGroup(group.value)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {reasonLabel}{" "}
                    <span className="text-[var(--color-text-muted)] font-normal">
                      · {group.pages.length} pages
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                    &quot;{displayValue}&quot;
                  </p>
                </div>
                {isGroupExpanded ? (
                  <IconChevronDown className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                ) : (
                  <IconChevronRight className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-[var(--color-score-warning)]/30 pl-3">
                  {group.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/projects/${projectId}/pages/${page.id}`}
                      className="block py-1 text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {truncateUrl(page.url)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentGroups.length > 3 && (
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
              Show All ({currentGroups.length} groups){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
