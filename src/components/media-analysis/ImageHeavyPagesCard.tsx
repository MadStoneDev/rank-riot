"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconPhotoPlus,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { PageWithImages } from "@/types/media-analysis";
import { truncateUrl } from "@/utils/media-analysis";

interface ImageHeavyPagesCardProps {
  pages: PageWithImages[];
  projectId: string;
}

export default function ImageHeavyPagesCard({
  pages,
  projectId,
}: ImageHeavyPagesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  if (pages.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <IconPhotoPlus className="h-5 w-5" />
          <span className="font-medium">No Images Found</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          No pages with images detected
        </p>
      </div>
    );
  }

  const maxImages = pages[0]?.imageCount || 0;

  return (
    <div className="glass-card overflow-hidden border-[var(--color-primary)]/20">
      <div className="px-4 py-3 bg-[var(--color-primary-muted)] border-b border-[var(--color-primary)]/20">
        <div className="flex items-center gap-2">
          <IconPhotoPlus className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-medium text-[var(--color-primary)]">
            Image-Heavy Pages (Top {Math.min(10, pages.length)})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pages with the most images
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayPages.map((page, index) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  #{index + 1}
                </span>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {page.title || "Untitled"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  {page.imageCount} images
                </span>
                {page.missingAltCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]">
                    {page.missingAltCount} no alt
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--color-text-muted)] truncate flex-1">
                {truncateUrl(page.url)}
              </p>
              <div className="w-20 h-1.5 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full"
                  style={{
                    width: `${maxImages > 0 ? (page.imageCount / maxImages) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pages.length > 5 && (
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
              Show All ({pages.length} pages){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
