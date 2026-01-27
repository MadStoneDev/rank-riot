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
  issueCounts?: PageIssueCount;
  linkCounts?: PageLinkCount;
}

type SortField = "url" | "title" | "score" | "issues" | "links";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "with-issues" | "indexable" | "non-indexable";

function calculatePageScore(page: Page): number {
  let score = 100;

  // Title check (20 points)
  if (!page.title) score -= 20;
  else {
    const titleLength = page.title.length;
    if (titleLength < 30) score -= 15;
    else if (titleLength > 70) score -= 5;
  }

  // Meta description check (15 points)
  if (!page.meta_description) score -= 15;
  else {
    const descLength = page.meta_description.length;
    if (descLength < 70) score -= 10;
    else if (descLength > 165) score -= 5;
  }

  // H1 check (15 points)
  const h1Count = Array.isArray(page.h1s) ? page.h1s.length : 0;
  if (h1Count === 0) score -= 15;
  else if (h1Count > 1) score -= 5;

  // H2 check (5 points)
  const h2Count = Array.isArray(page.h2s) ? page.h2s.length : 0;
  if (h2Count === 0) score -= 5;

  // Indexability (10 points)
  if (page.has_robots_noindex) score -= 10;
  else if (page.is_indexable === false) score -= 10;

  // Canonical URL check (5 points)
  if (page.canonical_url) {
    const normalizeUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (normalizeUrl(page.canonical_url) !== normalizeUrl(page.url)) {
      score -= 5;
    }
  }

  // HTTP status (10 points)
  if (page.http_status && page.http_status >= 400) score -= 10;
  else if (page.http_status && page.http_status >= 300) score -= 5;

  // Images alt text (5 points)
  const images = Array.isArray(page.images) ? page.images : [];
  const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === "").length;
  if (images.length > 0 && missingAlt > 0) score -= Math.min(5, missingAlt);

  // Open Graph check (3 points)
  if (!page.open_graph || Object.keys(page.open_graph).length === 0) {
    score -= 3;
  }

  return Math.max(0, score);
}

export default function PagesListClient({
  pages,
  projectId,
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
      score: calculatePageScore(page),
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
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
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with count */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">
          {pages.length} Pages Crawled
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Showing {filteredPages.length} of {pages.length} pages
        </p>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by URL or title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">Filter:</span>
            <FilterButton filterValue="all" label="All" />
            <FilterButton filterValue="with-issues" label="With Issues" />
            <FilterButton filterValue="indexable" label="Indexable" />
            <FilterButton filterValue="non-indexable" label="Non-Indexable" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-neutral-500">Sort:</span>
            <SortButton field="url" label="URL" />
            <SortButton field="score" label="Score" />
            <SortButton field="issues" label="Issues" />
          </div>
        </div>
      </div>

      {/* Pages List */}
      {paginatedPages.length > 0 ? (
        <div className="divide-y divide-neutral-200">
          {paginatedPages.map((page) => (
            <Link
              key={page.id}
              href={`/projects/${projectId}/pages/${page.id}`}
              className="block p-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Score Badge */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getScoreColor(page.score)}`}
                >
                  {page.score}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 truncate">
                        {page.title ? decode(page.title) : "Untitled Page"}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {page.url}
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {page.issueCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          <IconAlertCircle className="h-3 w-3" />
                          {page.issueCount}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                        <IconLink className="h-3 w-3" />
                        {page.linkCount}
                      </span>
                      {page.http_status && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            page.http_status >= 200 && page.http_status < 300
                              ? "bg-green-100 text-green-700"
                              : page.http_status >= 300 && page.http_status < 400
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {page.http_status}
                        </span>
                      )}
                      {page.is_indexable !== false && !page.has_robots_noindex ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          <IconCheck className="h-3 w-3" />
                          Index
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          <IconX className="h-3 w-3" />
                          NoIndex
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-neutral-500">
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
