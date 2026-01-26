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
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconPhotoPlus className="h-5 w-5" />
          <span className="font-medium">No Images Found</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          No pages with images detected
        </p>
      </div>
    );
  }

  const maxImages = pages[0]?.imageCount || 0;

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <IconPhotoPlus className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Image-Heavy Pages (Top {Math.min(10, pages.length)})
          </span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          Pages with the most images
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayPages.map((page, index) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-neutral-400">
                  #{index + 1}
                </span>
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {page.title || "Untitled"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {page.imageCount} images
                </span>
                {page.missingAltCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                    {page.missingAltCount} no alt
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-neutral-500 truncate flex-1">
                {truncateUrl(page.url)}
              </p>
              <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
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
          className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-neutral-100 flex items-center justify-center gap-1"
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
