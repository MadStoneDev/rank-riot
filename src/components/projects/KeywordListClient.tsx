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
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Keywords</h3>
          <span className="text-sm text-[var(--color-text-muted)]">
            {keywords.length} found
          </span>
        </div>
        {isOpen ? (
          <IconChevronUp className="h-5 w-5 text-[var(--color-text-muted)]" />
        ) : (
          <IconChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-muted)] hover:bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20 rounded-full text-sm transition-colors"
                  >
                    <IconKey className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text-primary)]">{keyword.word}</span>
                    <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-full">
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
                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                  >
                    {showAll ? "Show Less" : `Show All (${keywords.length})`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              No keywords found on this page
            </div>
          )}
        </>
      )}
    </div>
  );
}
