"use client";

import { useState } from "react";
import {
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconAlertTriangle,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Badge from "@/components/ui/Badge";

interface HeadingHierarchyProps {
  h1s: string[];
  h2s: string[];
  h3s: string[];
  h4s: string[];
  h5s: string[];
  h6s: string[];
}

interface HeadingEntry {
  level: number;
  text: string;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "var(--color-primary)",
  2: "var(--color-score-good)",
  3: "var(--color-score-warning)",
  4: "#a78bfa",
  5: "#f472b6",
  6: "var(--color-text-muted)",
};

const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: <IconH1 className="h-4 w-4" />,
  2: <IconH2 className="h-4 w-4" />,
  3: <IconH3 className="h-4 w-4" />,
  4: <IconH4 className="h-4 w-4" />,
  5: <IconH5 className="h-4 w-4" />,
  6: <IconH6 className="h-4 w-4" />,
};

export default function HeadingHierarchy({
  h1s = [],
  h2s = [],
  h3s = [],
  h4s = [],
  h5s = [],
  h6s = [],
}: HeadingHierarchyProps) {
  const totalHeadings = h1s.length + h2s.length + h3s.length + h4s.length + h5s.length + h6s.length;

  // Build a flat list of headings in document order (approximate: level order since we lack position data)
  const allHeadings: HeadingEntry[] = [
    ...h1s.map((text) => ({ level: 1, text })),
    ...h2s.map((text) => ({ level: 2, text })),
    ...h3s.map((text) => ({ level: 3, text })),
    ...h4s.map((text) => ({ level: 4, text })),
    ...h5s.map((text) => ({ level: 5, text })),
    ...h6s.map((text) => ({ level: 6, text })),
  ];

  // Detect skipped levels
  const usedLevels = new Set<number>();
  if (h1s.length > 0) usedLevels.add(1);
  if (h2s.length > 0) usedLevels.add(2);
  if (h3s.length > 0) usedLevels.add(3);
  if (h4s.length > 0) usedLevels.add(4);
  if (h5s.length > 0) usedLevels.add(5);
  if (h6s.length > 0) usedLevels.add(6);

  const skippedWarnings: string[] = [];
  const sortedLevels = Array.from(usedLevels).sort();
  for (let i = 0; i < sortedLevels.length - 1; i++) {
    const current = sortedLevels[i];
    const next = sortedLevels[i + 1];
    if (next - current > 1) {
      const skipped = [];
      for (let j = current + 1; j < next; j++) {
        skipped.push(`H${j}`);
      }
      skippedWarnings.push(`H${current} jumps to H${next} (missing ${skipped.join(", ")})`);
    }
  }

  // H1 issues
  const h1Issues: string[] = [];
  if (h1s.length === 0) h1Issues.push("Missing H1 tag");
  if (h1s.length > 1) h1Issues.push(`Multiple H1 tags found (${h1s.length})`);

  const headingGroups = [
    { level: 1, label: "H1", headings: h1s },
    { level: 2, label: "H2", headings: h2s },
    { level: 3, label: "H3", headings: h3s },
    { level: 4, label: "H4", headings: h4s },
    { level: 5, label: "H5", headings: h5s },
    { level: 6, label: "H6", headings: h6s },
  ];

  return (
    <CollapsibleSection
      title="Content Structure"
      badge={
        <span className="text-sm text-[var(--color-text-muted)]">
          {totalHeadings} heading{totalHeadings !== 1 ? "s" : ""}
        </span>
      }
    >
      {/* Summary bar */}
      <div className="px-6 py-3 bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center gap-2">
          {headingGroups.map(({ level, label, headings }) => {
            const count = headings.length;
            let variant: "good" | "warning" | "critical" | "neutral" = "neutral";
            if (level === 1) {
              if (count === 0) variant = "critical";
              else if (count > 1) variant = "warning";
              else variant = "good";
            } else if (level === 2 && count === 0) {
              variant = "warning";
            }

            return (
              <Badge key={level} variant={variant}>
                {label}: {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Warnings */}
      {(h1Issues.length > 0 || skippedWarnings.length > 0) && (
        <div className="px-6 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1.5">
            {h1Issues.map((issue, i) => (
              <div key={`h1-${i}`} className="flex items-center gap-2 text-sm text-[var(--color-score-critical)]">
                <IconAlertTriangle className="h-4 w-4 flex-shrink-0" />
                {issue}
              </div>
            ))}
            {skippedWarnings.map((warning, i) => (
              <div key={`skip-${i}`} className="flex items-center gap-2 text-sm text-[var(--color-score-warning)]">
                <IconAlertTriangle className="h-4 w-4 flex-shrink-0" />
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heading tree */}
      <div className="px-6 py-4">
        {totalHeadings > 0 ? (
          <div className="space-y-1">
            {allHeadings.map((heading, index) => {
              const indent = (heading.level - 1) * 24;
              const color = LEVEL_COLORS[heading.level];
              return (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                  style={{ marginLeft: `${indent}px` }}
                >
                  {/* Level connector line */}
                  {heading.level > 1 && (
                    <div
                      className="flex-shrink-0 w-3 border-l-2 border-b-2 h-3 mt-1 rounded-bl"
                      style={{ borderColor: `${color}40` }}
                    />
                  )}
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                    style={{
                      color,
                      backgroundColor: `${color}20`,
                    }}
                  >
                    {LEVEL_ICONS[heading.level]}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)] leading-6">
                    {heading.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            No headings found on this page
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
}
