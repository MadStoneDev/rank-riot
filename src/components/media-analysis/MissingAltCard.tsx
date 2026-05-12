"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconPhotoOff,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import { PageWithImages } from "@/types/media-analysis";
import { truncateUrl, getImageFilename } from "@/utils/media-analysis";

interface MissingAltCardProps {
  pages: PageWithImages[];
  projectId: string;
}

export default function MissingAltCard({
  pages,
  projectId,
}: MissingAltCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  const displayPages = isExpanded ? pages : pages.slice(0, 5);
  const totalMissing = pages.reduce((sum, p) => sum + p.missingAltCount, 0);

  const togglePage = (pageId: string) => {
    const next = new Set(expandedPages);
    if (next.has(pageId)) {
      next.delete(pageId);
    } else {
      next.add(pageId);
    }
    setExpandedPages(next);
  };

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Images Have Alt Text</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Great job! All images are accessible
        </p>
      </div>
    );
  }

  const hasCritical = pages.some((p) => p.missingAltCount > 5);

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
          <IconPhotoOff
            className={`h-5 w-5 ${hasCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-severity-medium)]"}`}
          />
          <span
            className={`font-medium ${
              hasCritical ? "text-[var(--color-severity-critical)]" : "text-[var(--color-score-warning)]"
            }`}
          >
            Missing Alt Text ({totalMissing} images)
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Images without alt text affect accessibility and SEO
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayPages.map((page) => {
          const isPageExpanded = expandedPages.has(page.id);
          const missingImages = page.images.filter(
            (img) => !img.alt || img.alt.trim() === ""
          );

          return (
            <div key={page.id} className="px-4 py-3">
              <button
                onClick={() => togglePage(page.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {page.title || "Untitled"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {truncateUrl(page.url)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      page.missingAltCount > 5
                        ? "bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]"
                        : "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]"
                    }`}
                  >
                    {page.missingAltCount} missing
                  </span>
                  {isPageExpanded ? (
                    <IconChevronDown className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                  ) : (
                    <IconChevronRight className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                  )}
                </div>
              </button>

              {isPageExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-[var(--color-score-warning)]/30 pl-3">
                  {missingImages.slice(0, 10).map((img, idx) => (
                    <div key={idx} className="py-1 text-xs text-[var(--color-text-secondary)]">
                      {getImageFilename(img.src, 50)}
                    </div>
                  ))}
                  {missingImages.length > 10 && (
                    <p className="py-1 text-xs text-[var(--color-text-muted)]">
                      +{missingImages.length - 10} more images
                    </p>
                  )}
                  <Link
                    href={`/projects/${projectId}/pages/${page.id}`}
                    className="block py-1 text-xs text-[var(--color-primary)] hover:underline"
                  >
                    View page details
                  </Link>
                </div>
              )}
            </div>
          );
        })}
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
              Show All ({pages.length} pages){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
