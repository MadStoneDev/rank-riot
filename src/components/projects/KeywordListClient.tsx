"use client";

import { useState } from "react";
import { IconKey, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

type Keyword = {
  word: string;
  count: number;
};

export default function KeywordListClient({
  keywords,
}: {
  keywords: Keyword[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Sort keywords by count descending
  const sortedKeywords = [...keywords].sort((a, b) => b.count - a.count);
  const displayedKeywords = showAll ? sortedKeywords : sortedKeywords.slice(0, 30);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-neutral-900">Keywords</h3>
          <span className="text-sm text-neutral-500">
            {keywords.length} found
          </span>
        </div>
        {isOpen ? (
          <IconChevronUp className="h-5 w-5 text-neutral-500" />
        ) : (
          <IconChevronDown className="h-5 w-5 text-neutral-500" />
        )}
      </button>

      {isOpen && (
        <>
          {keywords.length > 0 ? (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {displayedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full text-sm transition-colors"
                  >
                    <IconKey className="h-3.5 w-3.5 text-primary" />
                    <span className="text-neutral-800">{keyword.word}</span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {keyword.count}
                    </span>
                  </span>
                ))}
              </div>
              {keywords.length > 30 && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm text-primary hover:text-primary/70 font-medium"
                  >
                    {showAll ? "Show Less" : `Show All (${keywords.length})`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-neutral-500">
              No keywords found on this page
            </div>
          )}
        </>
      )}
    </div>
  );
}
