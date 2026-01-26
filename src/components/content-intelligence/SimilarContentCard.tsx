"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileStack,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { SimilarContentGroup } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface SimilarContentCardProps {
  groups: SimilarContentGroup[];
  projectId: string;
}

export default function SimilarContentCard({
  groups,
  projectId,
}: SimilarContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const displayGroups = isExpanded ? groups : groups.slice(0, 3);

  const toggleGroup = (index: number) => {
    const next = new Set(expandedGroups);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedGroups(next);
  };

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconFileStack className="h-5 w-5" />
          <span className="font-medium">No Similar Content</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          No pages with highly similar content detected
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <IconFileStack className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Similar Content ({groups.length} groups)
          </span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          Pages with similar keyword profiles (may indicate duplicate content)
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayGroups.map((group, index) => {
          const isGroupExpanded = expandedGroups.has(index);

          return (
            <div key={index} className="px-4 py-3">
              <button
                onClick={() => toggleGroup(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">
                      Group {index + 1}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {group.similarity}% similar
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {group.pages.length} pages with overlapping content
                  </p>
                </div>
                {isGroupExpanded ? (
                  <IconChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                ) : (
                  <IconChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-200 pl-3">
                  {group.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/projects/${projectId}/pages/${page.id}`}
                      className="block py-1"
                    >
                      <span className="text-sm text-primary hover:underline">
                        {truncateUrl(page.url)}
                      </span>
                      {page.title && (
                        <span className="block text-xs text-neutral-500 truncate">
                          {page.title}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {groups.length > 3 && (
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
              Show All ({groups.length} groups){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
