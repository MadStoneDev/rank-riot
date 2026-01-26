"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconEyeOff,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { NonIndexablePage } from "@/types/technical-health";
import { truncateUrl } from "@/utils/technical-health";

interface IndexabilityCardProps {
  pages: NonIndexablePage[];
  projectId: string;
}

export default function IndexabilityCard({
  pages,
  projectId,
}: IndexabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayPages = isExpanded ? pages : pages.slice(0, 5);

  const getReasonLabel = (reason: NonIndexablePage["reason"]) => {
    switch (reason) {
      case "noindex":
        return "noindex";
      case "canonical_mismatch":
        return "canonical";
      case "not_indexable":
        return "blocked";
      default:
        return reason;
    }
  };

  const getReasonColor = (reason: NonIndexablePage["reason"]) => {
    switch (reason) {
      case "noindex":
        return "bg-orange-100 text-orange-700";
      case "canonical_mismatch":
        return "bg-blue-100 text-blue-700";
      case "not_indexable":
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Pages Indexable</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          All pages can be indexed by search engines
        </p>
      </div>
    );
  }

  const hasCritical = pages.some((p) => p.reason === "not_indexable");

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
          <IconEyeOff
            className={`h-5 w-5 ${hasCritical ? "text-red-600" : "text-orange-600"}`}
          />
          <span
            className={`font-medium ${
              hasCritical ? "text-red-900" : "text-orange-900"
            }`}
          >
            Non-Indexable Pages ({pages.length})
          </span>
        </div>
        <p
          className={`mt-1 text-sm ${
            hasCritical ? "text-red-700" : "text-orange-700"
          }`}
        >
          Pages that won&apos;t appear in search results
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayPages.map((page) => (
          <Link
            key={page.id}
            href={`/projects/${projectId}/pages/${page.id}`}
            className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-neutral-900 truncate flex-1">
                {page.title || "Untitled"}
              </p>
              <span
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getReasonColor(
                  page.reason
                )}`}
              >
                {getReasonLabel(page.reason)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate">
              {truncateUrl(page.url)}
            </p>
            {page.reason === "canonical_mismatch" && page.canonical_url && (
              <p className="text-xs text-blue-600 mt-1 truncate">
                Canonical: {truncateUrl(page.canonical_url, 40)}
              </p>
            )}
          </Link>
        ))}
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
              Show All ({pages.length}) <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
