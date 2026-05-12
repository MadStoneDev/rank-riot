"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { decode } from "html-entities";
import {
  IconFile,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconAlertCircle,
  IconLink,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import ExportTriggerButton from "@/components/export/ExportTriggerButton";
import { sanitizeFilename } from "@/utils/export";
import { getPageScore } from "@/utils/page-score";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

interface Page {
  id: string;
  url: string;
  title: string | null;
  http_status: number | null;
  is_indexable: boolean | null;
  has_robots_noindex: boolean | null;
  word_count: number | null;
  // For SEO score calculation
  meta_description: string | null;
  h1s: any[] | null;
  h2s: any[] | null;
  canonical_url: string | null;
  images: { src: string; alt: string }[] | null;
  open_graph: Record<string, any> | null;
}

interface PageIssueCount {
  [pageId: string]: number;
}

interface PageLinkCount {
  [pageId: string]: number;
}

interface PagesListClientProps {
  pages: Page[];
  projectId: string;
  projectName?: string;
  issueCounts?: PageIssueCount;
  linkCounts?: PageLinkCount;
}

type SortField = "url" | "title" | "score" | "issues" | "links";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "with-issues" | "indexable" | "non-indexable";

function calculatePageScoreLocal(page: Page): number {
  return getPageScore(page);
}

export default function PagesListClient({
  pages,
  projectId,
  projectName,
  issueCounts = {},
  linkCounts = {},
}: PagesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("url");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Calculate scores for all pages
  const pagesWithScores = useMemo(() => {
    return pages.map((page) => ({
      ...page,
      score: calculatePageScoreLocal(page),
      issueCount: issueCounts[page.id] || 0,
      linkCount: linkCounts[page.id] || 0,
    }));
  }, [pages, issueCounts, linkCounts]);

  // Filter pages
  const filteredPages = useMemo(() => {
    let result = pagesWithScores;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (page) =>
          page.url.toLowerCase().includes(query) ||
          (page.title && page.title.toLowerCase().includes(query))
      );
    }

    // Type filter
    switch (filter) {
      case "with-issues":
        result = result.filter((page) => page.issueCount > 0 || page.score < 80);
        break;
      case "indexable":
        result = result.filter(
          (page) => page.is_indexable !== false && !page.has_robots_noindex
        );
        break;
      case "non-indexable":
        result = result.filter(
          (page) => page.is_indexable === false || page.has_robots_noindex
        );
        break;
    }

    return result;
  }, [pagesWithScores, searchQuery, filter]);

  // Sort pages
  const sortedPages = useMemo(() => {
    const sorted = [...filteredPages].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "url":
          comparison = a.url.localeCompare(b.url);
          break;
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "score":
          comparison = a.score - b.score;
          break;
        case "issues":
          comparison = a.issueCount - b.issueCount;
          break;
        case "links":
          comparison = a.linkCount - b.linkCount;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredPages, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedPages.length / pageSize);
  const paginatedPages = sortedPages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 transition-colors ${
        sortField === field
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <IconSortAscending className="h-3 w-3" />
        ) : (
          <IconSortDescending className="h-3 w-3" />
        ))}
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
      onClick={() => {
        setFilter(filterValue);
        setCurrentPage(1);
      }}
      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
        filter === filterValue
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Header with count */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
            {pages.length} Pages Crawled
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Showing {filteredPages.length} of {pages.length} pages
          </p>
        </div>
        <ExportTriggerButton
          dataType="pages"
          data={sortedPages}
          filenamePrefix={projectName ? `${sanitizeFilename(projectName)}-pages` : "pages"}
          projectName={projectName}
          label="Export"
        />
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-4 bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)] space-y-3">
        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by URL or title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-default)] rounded-md text-sm bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Filter:</span>
            <FilterButton filterValue="all" label="All" />
            <FilterButton filterValue="with-issues" label="With Issues" />
            <FilterButton filterValue="indexable" label="Indexable" />
            <FilterButton filterValue="non-indexable" label="Non-Indexable" />
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-[var(--color-text-muted)]">Sort:</span>
            <SortButton field="url" label="URL" />
            <SortButton field="score" label="Score" />
            <SortButton field="issues" label="Issues" />
          </div>
        </div>
      </div>

      {/* Pages List */}
      {paginatedPages.length > 0 ? (
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {paginatedPages.map((page) => (
            <Link
              key={page.id}
              href={`/projects/${projectId}/pages/${page.id}`}
              className="block p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Score Ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={page.score} size="sm" showLabel={false} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {page.title ? decode(page.title) : "Untitled Page"}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                        {page.url}
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:flex-shrink-0">
                      {page.issueCount > 0 && (
                        <Badge variant="critical">
                          <IconAlertCircle className="h-3 w-3" />
                          {page.issueCount}
                        </Badge>
                      )}
                      <Badge variant="neutral">
                        <IconLink className="h-3 w-3" />
                        {page.linkCount}
                      </Badge>
                      {page.http_status && (
                        <Badge
                          variant={
                            page.http_status >= 200 && page.http_status < 300
                              ? "good"
                              : page.http_status >= 300 && page.http_status < 400
                                ? "warning"
                                : "critical"
                          }
                        >
                          {page.http_status}
                        </Badge>
                      )}
                      {page.is_indexable !== false && !page.has_robots_noindex ? (
                        <Badge variant="good">
                          <IconCheck className="h-3 w-3" />
                          Index
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <IconX className="h-3 w-3" />
                          NoIndex
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-[var(--color-text-muted)]">
          {searchQuery || filter !== "all"
            ? "No pages match your search or filter criteria"
            : "No pages found"}
        </div>
      )}

      {/* Pagination */}
      {sortedPages.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}
    </div>
  );
}
