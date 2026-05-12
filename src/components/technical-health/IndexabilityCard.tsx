"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconEyeOff,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { NonIndexablePage } from "@/types/technical-health";
import { truncateUrl } from "@/utils/technical-health";

interface IndexabilityCardProps {
  pages: NonIndexablePage[];
  projectId: string;
}

export default function IndexabilityCard({
  pages,
  projectId,
}: IndexabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  const getReasonLabel = (reason: NonIndexablePage["reason"]) => {
    switch (reason) {
      case "noindex":
        return "noindex";
      case "canonical_mismatch":
        return "canonical";
      case "not_indexable":
        return "blocked";
      default:
        return reason;
    }
  };

  const getReasonColor = (reason: NonIndexablePage["reason"]) => {
    switch (reason) {
      case "noindex":
        return "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]";
      case "canonical_mismatch":
        return "bg-[var(--color-primary-muted)] text-[var(--color-primary)]";
      case "not_indexable":
        return "bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]";
      default:
        return "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]";
    }
  };

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Pages Indexable</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All pages can be indexed by search engines
        </p>
      </div>
    );
  }

  const hasCritical = pages.some((p) => p.reason === "not_indexable");

  return (
    <div
      className={`glass-card overflow-hidden ${
        hasCritical ? "border-[var(--color-severity-critical)]/20" : "border-[var(--color-severity-medium)]/20"
      }`}
    >
      <div
        className={`px-4 py-3 border-b ${
          hasCritical
            ? "bg-[var(--color-score-critical-muted)] border-[var(--color-severity-critical)]/20"
            : "bg-[var(--color-score-warning-muted)] border-[var(--color-severity-medium)]/20"
        }`}
      >
        <div className="flex items-center gap-2">
          <IconEyeOff
            className={`h-5 w-5 ${hasCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-severity-medium)]"}`}
          />
          <span
            className={`font-medium ${
              hasCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-score-warning)]"
            }`}
          >
            Non-Indexable Pages ({pages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages that won&apos;t appear in search results
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayPages.map((page) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate flex-1">
                {page.title || "Untitled"}
              </p>
              <span
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getReasonColor(
                  page.reason
                )}`}
              >
                {getReasonLabel(page.reason)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {truncateUrl(page.url)}
            </p>
            {page.reason === "canonical_mismatch" && page.canonical_url && (
              <p className="text-xs text-[var(--color-primary)] mt-1 truncate">
                Canonical: {truncateUrl(page.canonical_url, 40)}
              </p>
            )}
          </Link>
        ))}
      </div>

      {pages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-2 text-sm ${
            hasCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-score-warning)]"
          } hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1`}
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
