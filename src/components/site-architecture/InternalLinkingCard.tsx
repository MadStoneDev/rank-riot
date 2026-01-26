"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconLink,
  IconChevronDown,
  IconChevronUp,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { PageLinkStats } from "@/types/site-architecture";
import { truncateUrl } from "@/utils/site-architecture";

interface InternalLinkingCardProps {
  mostLinked: PageLinkStats[];
  leastLinked: PageLinkStats[];
  projectId: string;
}

export default function InternalLinkingCard({
  mostLinked,
  leastLinked,
  projectId,
}: InternalLinkingCardProps) {
  const [activeTab, setActiveTab] = useState<"most" | "least">("most");
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPages = activeTab === "most" ? mostLinked : leastLinked;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  if (mostLinked.length === 0 && leastLinked.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconLink className="h-5 w-5" />
          <span className="font-medium">No Link Data</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Run a crawl to analyze internal linking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <IconLink className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Internal Linking</span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          Pages ranked by internal link count
        </p>
      </div>

      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => {
            setActiveTab("most");
            setIsExpanded(false);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
            activeTab === "most"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <IconArrowUp className="h-4 w-4" />
          Most Linked
        </button>
        <button
          onClick={() => {
            setActiveTab("least");
            setIsExpanded(false);
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
            activeTab === "least"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <IconArrowDown className="h-4 w-4" />
          Least Linked
        </button>
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
              <div className="ml-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  {page.inboundCount} in
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {page.outboundCount} out
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
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
              Show All ({currentPages.length}){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
