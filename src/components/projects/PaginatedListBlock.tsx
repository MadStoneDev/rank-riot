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
    <div className={`bg-white rounded-lg shadow overflow-hidden`}>
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
        <p
          className={`mt-1 text-sm ${
            criticalClass ? `px-2 py-1 ${criticalClass}` : "text-neutral-500"
          } transition-all duration-300 ease-in-out`}
        >
          {description || items.length === 0
            ? `No ${itemType}s found on this page`
            : `${items.length}x ${
                items.length === 1 ? itemType : itemType + "s"
              } found on this page`}
        </p>
      </div>

      {items && items.length > 0 && (
        <div className="divide-y divide-neutral-200">
          {visibleItems.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {items.length > itemsPerPage && (
        <div className="p-4 flex justify-center space-x-4 border-t border-neutral-200">
          {hasMore && (
            <>
              <button
                onClick={handleShowMore}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Show More
              </button>
              <button
                onClick={handleShowAll}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Show All
              </button>
            </>
          )}

          {(showAll || displayCount > itemsPerPage) && (
            <button
              onClick={handleCollapse}
              className={`px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400`}
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
