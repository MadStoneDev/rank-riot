"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconExternalLink,
  IconLink,
  IconCheck,
  IconX,
  IconFilter,
} from "@tabler/icons-react";
import { decode } from "html-entities";
import { safeHref } from "@/utils/safe-url";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";

interface PageLink {
  id: string;
  destination_url: string;
  destination_page_id?: string | null;
  source_page_id: string;
  anchor_text?: string | null;
  link_type: string;
  is_broken?: boolean | null;
  is_followed?: boolean | null;
  http_status?: number | null;
  pages?: { url: string };
}

interface EnhancedLinkListProps {
  outboundLinks: PageLink[];
  inboundLinks: PageLink[];
  projectId: string;
  pageUrl: string;
}

type TabType = "outbound" | "inbound";
type FilterType = "all" | "broken" | "external" | "internal";

export default function EnhancedLinkList({
  outboundLinks = [],
  inboundLinks = [],
  projectId,
  pageUrl,
}: EnhancedLinkListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("outbound");
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const links = activeTab === "outbound" ? outboundLinks : inboundLinks;

  const filteredLinks = useMemo(() => {
    let result = [...links];
    switch (filter) {
      case "broken":
        result = result.filter((link) => link.is_broken === true);
        break;
      case "external":
        result = result.filter((link) => link.link_type === "external");
        break;
      case "internal":
        result = result.filter((link) => link.link_type === "internal");
        break;
    }
    // Sort broken links to the top
    result.sort((a, b) => {
      if (a.is_broken && !b.is_broken) return -1;
      if (!a.is_broken && b.is_broken) return 1;
      return 0;
    });
    return result;
  }, [links, filter]);

  const totalPages = Math.ceil(filteredLinks.length / pageSize);
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const brokenCount = links.filter((l) => l.is_broken).length;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const TabButton = ({
    tab,
    label,
    count,
  }: {
    tab: TabType;
    label: string;
    count: number;
  }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === tab
          ? "border-[var(--color-primary)] text-[var(--color-primary)]"
          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
      }`}
    >
      {label} ({count})
    </button>
  );

  const FilterButton = ({
    filterValue,
    label,
  }: {
    filterValue: FilterType;
    label: string;
  }) => (
    <button
      onClick={() => handleFilterChange(filterValue)}
      className={`px-3 py-1 text-xs rounded-full transition-colors ${
        filter === filterValue
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <CollapsibleSection
      title="Links"
      badge={
        brokenCount > 0 ? (
          <Badge variant="critical">
            {brokenCount} broken
          </Badge>
        ) : null
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-subtle)]">
        <TabButton tab="outbound" label="Outbound" count={outboundLinks.length} />
        <TabButton tab="inbound" label="Inbound" count={inboundLinks.length} />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex items-center gap-2 bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)]">
        <IconFilter className="h-4 w-4 text-[var(--color-text-muted)]" />
        <FilterButton filterValue="all" label="All" />
        <FilterButton filterValue="broken" label="Broken" />
        <FilterButton filterValue="external" label="External" />
        <FilterButton filterValue="internal" label="Internal" />
      </div>

      {/* Links Table */}
      {filteredLinks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">
                  URL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">
                  Anchor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">
                  Follow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {paginatedLinks.map((link) => {
                const url =
                  activeTab === "outbound"
                    ? link.destination_url
                    : link.pages?.url || "Unknown";
                const linkedPageId =
                  activeTab === "outbound"
                    ? link.destination_page_id
                    : link.source_page_id;

                return (
                  <tr
                    key={link.id}
                    className={`hover:bg-[var(--color-surface-hover)] transition-colors ${
                      link.is_broken ? "bg-[var(--color-score-critical-muted)]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      {link.is_broken ? (
                        <span className="inline-flex items-center gap-1 text-[var(--color-score-critical)]">
                          <IconX className="h-4 w-4" />
                          <span className="text-xs font-medium">Broken</span>
                        </span>
                      ) : link.http_status ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            link.http_status >= 200 && link.http_status < 300
                              ? "text-[var(--color-score-good)]"
                              : link.http_status >= 300 && link.http_status < 400
                                ? "text-[var(--color-score-warning)]"
                                : "text-[var(--color-score-critical)]"
                          }`}
                        >
                          <span className="text-xs">{link.http_status}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        {linkedPageId ? (
                          <Link
                            href={`/projects/${projectId}/pages/${linkedPageId}`}
                            className="text-[var(--color-primary)] hover:underline truncate"
                          >
                            {url}
                          </Link>
                        ) : (
                          <span className="text-[var(--color-text-secondary)] truncate">{url}</span>
                        )}
                        <a
                          href={safeHref(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                        >
                          <IconExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--color-text-secondary)] max-w-[150px] truncate block">
                        {link.anchor_text
                          ? decode(link.anchor_text)
                          : <span className="text-[var(--color-score-critical)] text-xs">No anchor</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {link.is_followed === false ? (
                        <Badge variant="warning">nofollow</Badge>
                      ) : (
                        <Badge variant="good">follow</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={link.link_type === "internal" ? "info" : "neutral"}>
                        {link.link_type}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-[var(--color-text-muted)]">
          No {filter !== "all" ? filter : ""} links found
        </div>
      )}

      {/* Pagination */}
      {filteredLinks.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </CollapsibleSection>
  );
}
