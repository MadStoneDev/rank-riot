"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileDescription,
  IconChevronDown,
  IconChevronUp,
  IconLabel,
} from "@tabler/icons-react";
import { PageBasic } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface MissingMetaCardProps {
  missingDescriptions: PageBasic[];
  missingTitles: PageBasic[];
  projectId: string;
}

export default function MissingMetaCard({
  missingDescriptions,
  missingTitles,
  projectId,
}: MissingMetaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"descriptions" | "titles">(
    missingTitles.length > 0 ? "titles" : "descriptions"
  );

  const currentPages =
    activeTab === "titles" ? missingTitles : missingDescriptions;
  const displayPages = isExpanded ? currentPages : currentPages.slice(0, 5);

  const totalIssues = missingDescriptions.length + missingTitles.length;

  if (totalIssues === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconFileDescription className="h-5 w-5" />
          <span className="font-medium">All Metadata Present</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All pages have titles and meta descriptions
        </p>
      </div>
    );
  }

  const hasBothTypes = missingTitles.length > 0 && missingDescriptions.length > 0;
  const borderColor =
    missingTitles.length > 0 ? "border-red-200" : "border-orange-200";
  const bgColor = missingTitles.length > 0 ? "bg-red-50" : "bg-orange-50";
  const textColor = missingTitles.length > 0 ? "text-red-900" : "text-orange-900";
  const subTextColor =
    missingTitles.length > 0 ? "text-red-700" : "text-orange-700";
  const iconColor = missingTitles.length > 0 ? "text-red-600" : "text-orange-600";

  return (
    <div className={`bg-white rounded-lg border ${borderColor} overflow-hidden`}>
      <div className={`px-4 py-3 ${bgColor} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <IconFileDescription className={`h-5 w-5 ${iconColor}`} />
          <span className={`font-medium ${textColor}`}>
            Missing Metadata ({totalIssues})
          </span>
        </div>
        <p className={`mt-1 text-sm ${subTextColor}`}>
          Pages missing essential SEO metadata
        </p>
      </div>

      {hasBothTypes && (
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => {
              setActiveTab("titles");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "titles"
                ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <IconLabel className="h-4 w-4 inline mr-1" />
            Titles ({missingTitles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("descriptions");
              setIsExpanded(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "descriptions"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <IconFileDescription className="h-4 w-4 inline mr-1" />
            Descriptions ({missingDescriptions.length})
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
            <p className="text-sm font-medium text-neutral-900 truncate">
              {page.title || "Untitled Page"}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {truncateUrl(page.url)}
            </p>
          </Link>
        ))}
      </div>

      {currentPages.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-2 text-sm ${
            activeTab === "titles" ? "text-red-600" : "text-orange-600"
          } hover:bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-1`}
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
