"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconGauge,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconFile,
} from "@tabler/icons-react";
import { SlowPage, LargePage } from "@/types/technical-health";
import { truncateUrl, formatBytes, formatLoadTime } from "@/utils/technical-health";

interface PerformanceCardProps {
  slowPages: SlowPage[];
  largePages: LargePage[];
  projectId: string;
}

export default function PerformanceCard({
  slowPages,
  largePages,
  projectId,
}: PerformanceCardProps) {
  const [activeTab, setActiveTab] = useState<"slow" | "large">(
    slowPages.length > 0 ? "slow" : "large"
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPages = activeTab === "slow" ? slowPages : largePages;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  if (slowPages.length === 0 && largePages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">Good Performance</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All pages load quickly and are optimally sized
        </p>
      </div>
    );
  }

  const hasBothTypes = slowPages.length > 0 && largePages.length > 0;

  return (
    <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <IconGauge className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-900">
            Performance Issues ({slowPages.length + largePages.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-orange-700">
          Pages with slow load times or large file sizes
        </p>
      </div>

      {hasBothTypes && (
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => {
              setActiveTab("slow");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
              activeTab === "slow"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <IconClock className="h-4 w-4" />
            Slow ({slowPages.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("large");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
              activeTab === "large"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <IconFile className="h-4 w-4" />
            Large ({largePages.length})
          </button>
        </div>
      )}

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
                {activeTab === "slow"
                  ? formatLoadTime((page as SlowPage).load_time_ms)
                  : formatBytes((page as LargePage).size_bytes)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
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
              Show All ({currentPages.length}){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
