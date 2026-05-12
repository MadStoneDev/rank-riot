"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileDescription,
  IconChevronDown,
  IconChevronUp,
  IconLabel,
} from "@tabler/icons-react";
import { PageBasic } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface MissingMetaCardProps {
  missingDescriptions: PageBasic[];
  missingTitles: PageBasic[];
  projectId: string;
}

export default function MissingMetaCard({
  missingDescriptions,
  missingTitles,
  projectId,
}: MissingMetaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"descriptions" | "titles">(
    missingTitles.length > 0 ? "titles" : "descriptions"
  );

  const currentPages =
    activeTab === "titles" ? missingTitles : missingDescriptions;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  const totalIssues = missingDescriptions.length + missingTitles.length;

  if (totalIssues === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconFileDescription className="h-5 w-5" />
          <span className="font-medium">All Metadata Present</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages have titles and meta descriptions
        </p>
      </div>
    );
  }

  const hasBothTypes = missingTitles.length > 0 && missingDescriptions.length > 0;
  const isCritical = missingTitles.length > 0;

  return (
    <div className={`glass-card overflow-hidden ${
      isCritical ? "border-[var(--color-severity-critical)]/20" : "border-[var(--color-severity-medium)]/20"
    }`}>
      <div className={`px-4 py-3 border-b ${
        isCritical
          ? "bg-[var(--color-score-critical-muted)] border-[var(--color-severity-critical)]/20"
          : "bg-[var(--color-score-warning-muted)] border-[var(--color-severity-medium)]/20"
      }`}>
        <div className="flex items-center gap-2">
          <IconFileDescription className={`h-5 w-5 ${
            isCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-severity-medium)]"
          }`} />
          <span className={`font-medium ${
            isCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-score-warning)]"
          }`}>
            Missing Metadata ({totalIssues})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages missing essential SEO metadata
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
                ? "text-[var(--color-severity-critical)] border-b-2 border-[var(--color-severity-critical)] bg-[var(--color-score-critical-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <IconLabel className="h-4 w-4 inline mr-1" />
            Titles ({missingTitles.length})
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
            <IconFileDescription className="h-4 w-4 inline mr-1" />
            Descriptions ({missingDescriptions.length})
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
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {page.title || "Untitled Page"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {truncateUrl(page.url)}
            </p>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-2 text-sm ${
            activeTab === "titles" ? "text-[var(--color-severity-critical)]" : "text-[var(--color-score-warning)]"
          } hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1`}
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
