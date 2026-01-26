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
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Images Have Alt Text</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Great job! All images are accessible
        </p>
      </div>
    );
  }

  const hasCritical = pages.some((p) => p.missingAltCount > 5);

  return (
    <div
      className={`bg-white rounded-lg border ${
        hasCritical ? "border-red-200" : "border-orange-200"
      } overflow-hidden`}
    >
      <div
        className={`px-4 py-3 ${
          hasCritical ? "bg-red-50 border-b border-red-200" : "bg-orange-50 border-b border-orange-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <IconPhotoOff
            className={`h-5 w-5 ${hasCritical ? "text-red-600" : "text-orange-600"}`}
          />
          <span
            className={`font-medium ${
              hasCritical ? "text-red-900" : "text-orange-900"
            }`}
          >
            Missing Alt Text ({totalMissing} images)
          </span>
        </div>
        <p
          className={`mt-1 text-sm ${
            hasCritical ? "text-red-700" : "text-orange-700"
          }`}
        >
          Images without alt text affect accessibility and SEO
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
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
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {page.title || "Untitled"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {truncateUrl(page.url)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      page.missingAltCount > 5
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {page.missingAltCount} missing
                  </span>
                  {isPageExpanded ? (
                    <IconChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <IconChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isPageExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-orange-200 pl-3">
                  {missingImages.slice(0, 10).map((img, idx) => (
                    <div key={idx} className="py-1 text-xs text-neutral-600">
                      {getImageFilename(img.src, 50)}
                    </div>
                  ))}
                  {missingImages.length > 10 && (
                    <p className="py-1 text-xs text-neutral-500">
                      +{missingImages.length - 10} more images
                    </p>
                  )}
                  <Link
                    href={`/projects/${projectId}/pages/${page.id}`}
                    className="block py-1 text-xs text-primary hover:underline"
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
            hasCritical ? "text-red-600 hover:bg-red-50" : "text-orange-600 hover:bg-orange-50"
          } border-t border-neutral-100 flex items-center justify-center gap-1`}
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
