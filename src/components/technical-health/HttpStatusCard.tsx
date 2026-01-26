"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconServer,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { StatusDistribution } from "@/types/technical-health";
import { truncateUrl } from "@/utils/technical-health";

interface HttpStatusCardProps {
  distribution: StatusDistribution[];
  projectId: string;
}

export default function HttpStatusCard({
  distribution,
  projectId,
}: HttpStatusCardProps) {
  const [activeTab, setActiveTab] = useState<"2xx" | "3xx" | "4xx" | "5xx">(
    () => {
      // Default to first problematic category, or 2xx if all good
      const problematic = distribution.find(
        (d) => d.category === "4xx" || d.category === "5xx"
      );
      if (problematic) return problematic.category;
      const redirect = distribution.find((d) => d.category === "3xx");
      if (redirect) return redirect.category;
      return "2xx";
    }
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const currentDist = distribution.find((d) => d.category === activeTab);
  const displayPages = isExpanded
    ? currentDist?.pages || []
    : (currentDist?.pages || []).slice(0, 5);

  const hasIssues = distribution.some(
    (d) => d.category === "4xx" || d.category === "5xx"
  );

  const totalPages = distribution.reduce((sum, d) => sum + d.count, 0);

  if (distribution.length === 0 || totalPages === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconServer className="h-5 w-5" />
          <span className="font-medium">No HTTP Data</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Run a crawl to analyze HTTP status codes
        </p>
      </div>
    );
  }

  if (!hasIssues) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">All Pages Healthy</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {totalPages} pages returning 2xx/3xx status codes
        </p>
      </div>
    );
  }

  const getTabColor = (category: string, isActive: boolean) => {
    if (!isActive) return "text-neutral-500 hover:text-neutral-700";
    switch (category) {
      case "2xx":
        return "text-green-600 border-b-2 border-green-600 bg-green-50";
      case "3xx":
        return "text-blue-600 border-b-2 border-blue-600 bg-blue-50";
      case "4xx":
        return "text-orange-600 border-b-2 border-orange-600 bg-orange-50";
      case "5xx":
        return "text-red-600 border-b-2 border-red-600 bg-red-50";
      default:
        return "";
    }
  };

  const getBorderColor = () => {
    const has5xx = distribution.some((d) => d.category === "5xx" && d.count > 0);
    const has4xx = distribution.some((d) => d.category === "4xx" && d.count > 0);
    if (has5xx) return "border-red-200";
    if (has4xx) return "border-orange-200";
    return "border-neutral-200";
  };

  return (
    <div className={`bg-white rounded-lg border ${getBorderColor()} overflow-hidden`}>
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <IconServer className="h-5 w-5 text-neutral-600" />
          <span className="font-medium text-neutral-900">
            HTTP Status Codes
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          {totalPages} pages analyzed
        </p>
      </div>

      <div className="flex border-b border-neutral-200 overflow-x-auto">
        {(["2xx", "3xx", "4xx", "5xx"] as const).map((category) => {
          const dist = distribution.find((d) => d.category === category);
          const count = dist?.count || 0;
          if (count === 0) return null;
          return (
            <button
              key={category}
              onClick={() => {
                setActiveTab(category);
                setIsExpanded(false);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap ${getTabColor(
                category,
                activeTab === category
              )}`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {currentDist && currentDist.pages.length > 0 && (
        <>
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
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      (page.http_status ?? 0) >= 500
                        ? "bg-red-100 text-red-700"
                        : (page.http_status ?? 0) >= 400
                          ? "bg-orange-100 text-orange-700"
                          : (page.http_status ?? 0) >= 300
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {page.http_status}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {(currentDist?.pages.length || 0) > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show Less <IconChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show All ({currentDist?.pages.length}){" "}
                  <IconChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
