"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCopy,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";
import { DuplicateGroup } from "@/types/content-intelligence";
import { truncateUrl } from "@/utils/content-intelligence";

interface DuplicatesCardProps {
  duplicateTitles: DuplicateGroup[];
  duplicateDescriptions: DuplicateGroup[];
  projectId: string;
}

export default function DuplicatesCard({
  duplicateTitles,
  duplicateDescriptions,
  projectId,
}: DuplicatesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"titles" | "descriptions">(
    duplicateTitles.length > 0 ? "titles" : "descriptions"
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const currentGroups =
    activeTab === "titles" ? duplicateTitles : duplicateDescriptions;
  const displayGroups = isExpanded ? currentGroups : currentGroups.slice(0, 3);

  const totalDuplicates =
    duplicateTitles.reduce((acc, g) => acc + g.pages.length - 1, 0) +
    duplicateDescriptions.reduce((acc, g) => acc + g.pages.length - 1, 0);

  const toggleGroup = (value: string) => {
    const next = new Set(expandedGroups);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setExpandedGroups(next);
  };

  if (duplicateTitles.length === 0 && duplicateDescriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCopy className="h-5 w-5" />
          <span className="font-medium">No Duplicates Found</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All titles and descriptions are unique
        </p>
      </div>
    );
  }

  const hasBothTypes =
    duplicateTitles.length > 0 && duplicateDescriptions.length > 0;

  return (
    <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <IconCopy className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-900">
            Duplicate Content ({totalDuplicates})
          </span>
        </div>
        <p className="mt-1 text-sm text-orange-700">
          Same titles or descriptions used on multiple pages
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
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Titles ({duplicateTitles.length} groups)
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
            Descriptions ({duplicateDescriptions.length} groups)
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100">
        {displayGroups.map((group) => {
          const isGroupExpanded = expandedGroups.has(group.value);
          const displayValue =
            group.value.length > 60
              ? group.value.substring(0, 60) + "..."
              : group.value;

          return (
            <div key={group.value} className="px-4 py-3">
              <button
                onClick={() => toggleGroup(group.value)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    "{displayValue}"
                  </p>
                  <p className="text-xs text-neutral-500">
                    Used on {group.pages.length} pages
                  </p>
                </div>
                {isGroupExpanded ? (
                  <IconChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                ) : (
                  <IconChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-orange-200 pl-3">
                  {group.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/projects/${projectId}/pages/${page.id}`}
                      className="block py-1 text-sm text-primary hover:underline"
                    >
                      {truncateUrl(page.url)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentGroups.length > 3 && (
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
              Show All ({currentGroups.length} groups){" "}
              <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
