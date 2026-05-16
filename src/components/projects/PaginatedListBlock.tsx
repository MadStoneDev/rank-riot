"use client";

import { useState, ReactNode } from "react";

// Define props for better type safety
interface PaginatedListProps {
  title: string;
  items: any[];
  itemType: string;
  renderItem: (item: any, index: number) => ReactNode;
  itemsPerPage?: number;
  criticalClass?: string;
  description?: string;
}

const PaginatedList = ({
  title,
  items,
  itemType = "item",
  renderItem,
  itemsPerPage = 10,
  criticalClass,
  description,
}: PaginatedListProps) => {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, displayCount);

  const handleShowMore = () => {
    setDisplayCount((prevCount) => prevCount + itemsPerPage);
  };

  const handleShowAll = () => {
    setShowAll(true);
  };

  const handleCollapse = () => {
    setShowAll(false);
    setDisplayCount(itemsPerPage);
  };

  const hasMore = !showAll && displayCount < items.length;

  return (
    <div className={`bg-[var(--color-surface-raised)] rounded-lg shadow overflow-hidden`}>
      <div className="px-6 py-4 border-b border-[var(--color-border-default)]">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h3>
        <p
          className={`mt-1 text-sm ${
            criticalClass ? `px-2 py-1 ${criticalClass}` : "text-[var(--color-text-muted)]"
          } transition-all duration-300 ease-in-out`}
        >
          {description
            ? description
            : items.length === 0
              ? `No ${itemType}s found on this page`
              : `${items.length}x ${
                  items.length === 1 ? itemType : itemType + "s"
                } found on this page`}
        </p>
      </div>

      {items && items.length > 0 && (
        <div className="divide-y divide-[var(--color-border-default)]">
          {visibleItems.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {items.length > itemsPerPage && (
        <div className="p-4 flex justify-center space-x-4 border-t border-[var(--color-border-default)]">
          {hasMore && (
            <>
              <button
                onClick={handleShowMore}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Show More
              </button>
              <button
                onClick={handleShowAll}
                className="px-4 py-2 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-strong)]"
              >
                Show All
              </button>
            </>
          )}

          {(showAll || displayCount > itemsPerPage) && (
            <button
              onClick={handleCollapse}
              className={`px-4 py-2 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-strong)]`}
            >
              Collapse
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaginatedList;
