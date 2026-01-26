"use client";

import {
  IconCheck,
  IconX,
  IconExternalLink,
  IconArrowForward,
  IconRobot,
} from "@tabler/icons-react";

interface IndexabilityStatusProps {
  page: {
    url: string;
    is_indexable?: boolean | null;
    canonical_url?: string | null;
    has_robots_noindex?: boolean | null;
    has_robots_nofollow?: boolean | null;
    redirect_url?: string | null;
  };
}

export default function IndexabilityStatus({ page }: IndexabilityStatusProps) {
  const normalizeUrl = (url: string) =>
    url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const canonicalMatches =
    page.canonical_url &&
    normalizeUrl(page.canonical_url) === normalizeUrl(page.url);

  const robotsDirective = [];
  if (page.has_robots_noindex) robotsDirective.push("noindex");
  else robotsDirective.push("index");
  if (page.has_robots_nofollow) robotsDirective.push("nofollow");
  else robotsDirective.push("follow");

  const StatusItem = ({
    label,
    value,
    status,
    detail,
  }: {
    label: string;
    value: string;
    status: "success" | "warning" | "error" | "neutral";
    detail?: string;
  }) => {
    const statusColors = {
      success: "text-green-600",
      warning: "text-orange-500",
      error: "text-red-600",
      neutral: "text-neutral-600",
    };

    const statusBg = {
      success: "bg-green-100",
      warning: "bg-orange-100",
      error: "bg-red-100",
      neutral: "bg-neutral-100",
    };

    return (
      <div className="flex items-start justify-between py-3 border-b border-neutral-100 last:border-0">
        <div className="flex items-center gap-2">
          {status === "success" ? (
            <IconCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : status === "error" ? (
            <IconX className="h-4 w-4 text-red-600 flex-shrink-0" />
          ) : status === "warning" ? (
            <IconArrowForward className="h-4 w-4 text-orange-500 flex-shrink-0" />
          ) : (
            <IconRobot className="h-4 w-4 text-neutral-500 flex-shrink-0" />
          )}
          <span className="text-sm text-neutral-700">{label}</span>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBg[status]} ${statusColors[status]}`}
          >
            {value}
          </span>
          {detail && (
            <p className="mt-1 text-xs text-neutral-500 max-w-[200px] truncate">
              {detail}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">
          Indexability Status
        </h3>
      </div>
      <div className="px-6 py-2">
        <StatusItem
          label="Indexable"
          value={page.is_indexable !== false ? "Yes" : "No"}
          status={page.is_indexable !== false ? "success" : "error"}
        />
        <StatusItem
          label="Canonical"
          value={
            !page.canonical_url
              ? "Not set"
              : canonicalMatches
                ? "Matches"
                : "Different"
          }
          status={
            !page.canonical_url
              ? "warning"
              : canonicalMatches
                ? "success"
                : "warning"
          }
          detail={page.canonical_url || undefined}
        />
        <StatusItem
          label="Robots"
          value={robotsDirective.join(", ")}
          status={
            page.has_robots_noindex
              ? "warning"
              : page.has_robots_nofollow
                ? "warning"
                : "success"
          }
        />
        <StatusItem
          label="Redirect"
          value={page.redirect_url ? "Yes" : "None"}
          status={page.redirect_url ? "warning" : "success"}
          detail={page.redirect_url || undefined}
        />
      </div>
    </div>
  );
}
