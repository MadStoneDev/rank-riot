"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconExternalLink,
  IconLink,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconShieldCheck,
  IconShieldOff,
} from "@tabler/icons-react";

export interface BacklinkItem {
  id: string;
  source_url: string;
  source_domain: string;
  anchor_text: string | null;
  is_followed: boolean | null;
  page_id: string | null;
  target_page_url: string | null;
  target_page_title: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
}

export interface BacklinksData {
  backlinks: BacklinkItem[];
  totalCount: number;
  uniqueDomains: number;
  followedCount: number;
  nofollowCount: number;
}

interface BacklinksProps {
  data: BacklinksData;
  projectId: string;
}

export default function Backlinks({ data, projectId }: BacklinksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayBacklinks = isExpanded
    ? data.backlinks
    : data.backlinks.slice(0, 10);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8b5cf620] rounded-lg">
              <IconExternalLink className="h-6 w-6 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Backlinks
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                External sites linking to your pages
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-[#8b5cf620] text-[#8b5cf6] rounded-full text-sm font-medium">
              <IconLink className="h-4 w-4" />
              <span>{data.totalCount} Backlinks</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] rounded-full text-sm font-medium">
              <span>{data.uniqueDomains} Domains</span>
            </div>
          </div>
        </div>
      </div>

      {/* WIP Banner */}
      <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-[var(--color-score-warning-muted)] border border-[var(--color-score-warning)]/20 rounded-lg">
        <IconInfoCircle className="h-5 w-5 text-[var(--color-score-warning)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--color-score-warning)]">
            Backlinks Discovery -- Work in Progress
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            What is shown here is not an exhaustive list. We discover backlinks
            by scanning external pages your site links to and checking if they
            link back. A full backlinks database (like Ahrefs or Moz) is planned
            for a future release.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data.backlinks.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <IconExternalLink className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="font-medium">No backlinks discovered yet</p>
            <p className="text-sm mt-1">
              Backlinks are detected during scans by checking external pages for
              links back to your site.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {data.totalCount}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Total Backlinks
                </p>
              </div>
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {data.uniqueDomains}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Referring Domains
                </p>
              </div>
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-score-good)]">
                  {data.followedCount}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Followed</p>
              </div>
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-text-muted)]">
                  {data.nofollowCount}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Nofollow</p>
              </div>
            </div>

            {/* Backlinks list */}
            <div className="border border-[var(--color-border-default)] rounded-lg overflow-hidden">
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {displayBacklinks.map((backlink) => (
                  <div
                    key={backlink.id}
                    className="px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <a
                          href={backlink.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[var(--color-primary)] hover:underline truncate"
                        >
                          {backlink.source_domain}
                        </a>
                        {backlink.is_followed ? (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded text-xs font-medium flex-shrink-0">
                            <IconShieldCheck className="h-3 w-3" />
                            Follow
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] rounded text-xs font-medium flex-shrink-0">
                            <IconShieldOff className="h-3 w-3" />
                            Nofollow
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] truncate mb-1">
                      {backlink.source_url}
                    </p>

                    {backlink.anchor_text && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Anchor: &quot;
                        {backlink.anchor_text.length > 80
                          ? backlink.anchor_text.substring(0, 80) + "..."
                          : backlink.anchor_text}
                        &quot;
                      </p>
                    )}

                    {backlink.target_page_url && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Links to:{" "}
                        {backlink.page_id ? (
                          <Link
                            href={`/projects/${projectId}/pages/${backlink.page_id}`}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            {backlink.target_page_title ||
                              backlink.target_page_url}
                          </Link>
                        ) : (
                          <span>{backlink.target_page_url}</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {data.backlinks.length > 10 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full px-4 py-2 text-sm text-[#8b5cf6] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Show Less <IconChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All ({data.backlinks.length}){" "}
                      <IconChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
