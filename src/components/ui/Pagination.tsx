"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && !onPageSizeChange) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-neutral-200">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <IconChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "hover:bg-neutral-100"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 text-neutral-400">
                {page}
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <IconChevronRight className="h-5 w-5" />
        </button>
      </div>

      {onPageSizeChange && (
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>Show:</span>
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-2 py-1 rounded ${
                pageSize === size
                  ? "bg-primary text-white"
                  : "hover:bg-neutral-100"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
