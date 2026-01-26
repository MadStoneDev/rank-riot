"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconSitemap,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { DepthDistribution } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface DepthDistributionCardProps {
  distribution: DepthDistribution[];
  projectId: string;
}

export default function DepthDistributionCard({
  distribution,
  projectId,
}: DepthDistributionCardProps) {
  const [expandedDepths, setExpandedDepths] = useState<Set<number>>(new Set());

  const toggleDepth = (depth: number) => {
    const next = new Set(expandedDepths);
    if (next.has(depth)) {
      next.delete(depth);
    } else {
      next.add(depth);
    }
    setExpandedDepths(next);
  };

  const totalPages = distribution.reduce((sum, d) => sum + d.count, 0);

  if (distribution.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconSitemap className="h-5 w-5" />
          <span className="font-medium">No Depth Data</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Run a crawl to analyze site structure
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <IconSitemap className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Click Depth Distribution
          </span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          {totalPages} pages across {distribution.length} depth levels
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {distribution.map((level) => {
          const isExpanded = expandedDepths.has(level.depth);
          const percentage = Math.round((level.count / totalPages) * 100);
          const displayPages = isExpanded
            ? level.pages
            : level.pages.slice(0, 3);

          return (
            <div key={level.depth} className="px-4 py-3">
              <button
                onClick={() => toggleDepth(level.depth)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      level.depth === 0
                        ? "bg-green-100 text-green-700"
                        : level.depth >= 4
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {level.depth}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      Depth {level.depth}
                      {level.depth === 0 && " (Homepage)"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {level.count} {level.count === 1 ? "page" : "pages"} (
                      {percentage}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        level.depth === 0
                          ? "bg-green-500"
                          : level.depth >= 4
                            ? "bg-orange-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <IconChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <IconChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-11 space-y-1 border-l-2 border-blue-200 pl-3">
                  {displayPages.map((page) => (
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
                  {level.pages.length > 3 && !isExpanded && (
                    <p className="text-xs text-neutral-500">
                      +{level.pages.length - 3} more pages
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
