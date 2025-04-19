"use client";

import { IconKey } from "@tabler/icons-react";
import PaginatedList from "@/components/projects/PaginatedListBlock";
import { useState } from "react";

type Keyword = {
  word: string;
  count: number;
};

export default function KeywordListClient({
  keywords,
}: {
  keywords: Keyword[];
}) {
  const [showCounts, setShowCounts] = useState(false);

  const renderKeywordItem = (
    keyword: Keyword,
    showCounts: boolean,
    index: number,
  ) => {
    const powerCount = Math.floor(Math.log10(keyword.count));
    const marginByPower = 16 + 8 * powerCount;

    return (
      <div key={index} className={`py-2 flex items-center`}>
        <div
          className={`mt-1 flex-shrink-0 gap-1 rounded-full p-1 text-primary-500`}
        >
          <IconKey size={20} />
        </div>
        <div className="ml-1 flex-1">
          <h4
            className={`group ${
              showCounts ? "" : `pr-0.5 mr-[${marginByPower}px]`
            } relative text-sm font-medium text-neutral-900`}
          >
            {keyword.word}{" "}
            <span
              className={`pointer-events-none ${
                showCounts
                  ? ""
                  : "absolute px-0.5 grid place-content-center top-0" +
                    " h-full left-0 group-hover:left-full opacity-0 group-hover:opacity-100"
              } text-xs text-neutral-500 transition-all duration-300 ease-in-out`}
            >
              ({keyword.count})
            </span>
          </h4>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden`}>
      <div
        className={`px-6 py-4 flex justify-between items-center border-b border-neutral-200`}
      >
        <div>
          <h3 className="text-lg font-medium text-neutral-900">Keywords</h3>
          <p
            className={`mt-1 text-sm text-neutral-500 transition-all duration-300 ease-in-out`}
          >
            {keywords.length === 0
              ? `No keywords found on this page`
              : `${keywords.length}x ${
                  keywords.length === 1 ? "keyword" : "keywords"
                } found on this page`}
          </p>
        </div>
        <button
          type={`button`}
          onClick={() => setShowCounts(!showCounts)}
          className={`cursor-pointer text-sm text-primary-500 hover:text-primary-400`}
        >
          {showCounts ? "Hide Counts" : "Show Counts"}
        </button>
      </div>

      {keywords && keywords.length > 0 && (
        <div className={`pl-4 flex flex-wrap gap-x-1 gap-y-1`}>
          {keywords.map((item, index) =>
            renderKeywordItem(item, showCounts, index),
          )}
        </div>
      )}
    </div>
  );
}
