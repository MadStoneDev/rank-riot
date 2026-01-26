"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconUnlink,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { OrphanPage } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface OrphanPagesCardProps {
  pages: OrphanPage[];
  projectId: string;
}

export default function OrphanPagesCard({
  pages,
  projectId,
}: OrphanPagesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">No Orphan Pages</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All pages have internal links pointing to them
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
      <div className="px-4 py-3 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2">
          <IconUnlink className="h-5 w-5 text-red-600" />
          <span className="font-medium text-red-900">
            Orphan Pages ({pages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-red-700">
          Pages with no internal links pointing to them
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayPages.map((page) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <p className="text-sm font-medium text-neutral-900 truncate">
              {page.title || "Untitled Page"}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {truncateUrl(page.url)}
            </p>
          </Link>
        ))}
      </div>

      {pages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-neutral-100 flex items-center justify-center gap-1"
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
