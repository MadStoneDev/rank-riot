"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconLinkOff,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from "@tabler/icons-react";
import { BrokenLink } from "@/types/technical-health";
import { truncateUrl } from "@/utils/technical-health";

interface BrokenLinksCardProps {
  links: BrokenLink[];
  projectId: string;
}

export default function BrokenLinksCard({
  links,
  projectId,
}: BrokenLinksCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayLinks = isExpanded ? links : links.slice(0, 5);

  if (links.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-score-good)]">
          <IconCircleCheck className="h-5 w-5" />
          <span className="font-medium">No Broken Links</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          All links are returning valid responses
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-[var(--color-severity-critical)]/20">
      <div className="px-4 py-3 bg-[var(--color-score-critical-muted)] border-b border-[var(--color-severity-critical)]/20">
        <div className="flex items-center gap-2">
          <IconLinkOff className="h-5 w-5 text-[var(--color-severity-critical)]" />
          <span className="font-medium text-[var(--color-severity-critical)]">
            Broken Links ({links.length})
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Links returning 4xx or 5xx errors
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {displayLinks.map((link) => (
          <div key={link.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate flex-1">
                {truncateUrl(link.destination_url, 40)}
              </p>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)]">
                {link.http_status || "Error"}
              </span>
            </div>
            {link.anchor_text && (
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Anchor: &quot;{link.anchor_text.substring(0, 50)}
                {link.anchor_text.length > 50 ? "..." : ""}&quot;
              </p>
            )}
            <Link
              href={`/projects/${projectId}/pages/${link.source_page_id}`}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Found on: {link.source_title || truncateUrl(link.source_url, 30)}
            </Link>
          </div>
        ))}
      </div>

      {links.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-[var(--color-severity-critical)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              Show Less <IconChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show All ({links.length}) <IconChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
