"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowDown,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { PageWithDepth } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface DeepPagesCardProps {
  pages: PageWithDepth[];
  projectId: string;
  threshold?: number;
}

export default function DeepPagesCard({
  pages,
  projectId,
  threshold = 4,
}: DeepPagesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">No Deep Pages</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All pages accessible within {threshold - 1} clicks
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <IconArrowDown className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-900">
            Deep Pages ({pages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-orange-700">
          Pages at depth {threshold}+ (may be hard to find)
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayPages.map((page) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {page.title || "Untitled"}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {truncateUrl(page.url)}
                </p>
              </div>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                Depth {page.depth}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {pages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 border-t border-neutral-100 flex items-center justify-center gap-1"
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
