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
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Pagination from "@/components/ui/Pagination";

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
          ? "border-primary text-primary"
          : "border-transparent text-neutral-500 hover:text-neutral-700"
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
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            {brokenCount} broken
          </span>
        ) : null
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <TabButton tab="outbound" label="Outbound" count={outboundLinks.length} />
        <TabButton tab="inbound" label="Inbound" count={inboundLinks.length} />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex items-center gap-2 bg-neutral-50 border-b border-neutral-200">
        <IconFilter className="h-4 w-4 text-neutral-400" />
        <FilterButton filterValue="all" label="All" />
        <FilterButton filterValue="broken" label="Broken" />
        <FilterButton filterValue="external" label="External" />
        <FilterButton filterValue="internal" label="Internal" />
      </div>

      {/* Links Table */}
      {filteredLinks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  URL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Anchor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Follow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
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
                  <tr key={link.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {link.is_broken ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <IconX className="h-4 w-4" />
                          <span className="text-xs">Broken</span>
                        </span>
                      ) : link.http_status ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            link.http_status >= 200 && link.http_status < 300
                              ? "text-green-600"
                              : link.http_status >= 300 && link.http_status < 400
                                ? "text-orange-500"
                                : "text-red-600"
                          }`}
                        >
                          <span className="text-xs">{link.http_status}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        {linkedPageId ? (
                          <Link
                            href={`/projects/${projectId}/pages/${linkedPageId}`}
                            className="text-primary hover:underline truncate"
                          >
                            {url}
                          </Link>
                        ) : (
                          <span className="text-neutral-600 truncate">{url}</span>
                        )}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-neutral-400 hover:text-primary"
                        >
                          <IconExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-neutral-600 max-w-[150px] truncate block">
                        {link.anchor_text
                          ? decode(link.anchor_text)
                          : <span className="text-red-500 text-xs">No anchor</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {link.is_followed === false ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">
                          nofollow
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-600">
                          follow
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                          link.link_type === "internal"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {link.link_type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-neutral-500">
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
