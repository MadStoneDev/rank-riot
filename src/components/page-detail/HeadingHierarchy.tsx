"use client";

import { useState } from "react";
import {
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconChevronRight,
  IconChevronDown,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";

interface HeadingHierarchyProps {
  h1s: string[];
  h2s: string[];
  h3s: string[];
  h4s: string[];
  h5s: string[];
  h6s: string[];
}

interface HeadingGroup {
  level: number;
  headings: string[];
  icon: React.ReactNode;
  label: string;
}

export default function HeadingHierarchy({
  h1s = [],
  h2s = [],
  h3s = [],
  h4s = [],
  h5s = [],
  h6s = [],
}: HeadingHierarchyProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(
    new Set([1, 2])
  );

  const headingGroups: HeadingGroup[] = [
    { level: 1, headings: h1s, icon: <IconH1 className="h-4 w-4" />, label: "H1" },
    { level: 2, headings: h2s, icon: <IconH2 className="h-4 w-4" />, label: "H2" },
    { level: 3, headings: h3s, icon: <IconH3 className="h-4 w-4" />, label: "H3" },
    { level: 4, headings: h4s, icon: <IconH4 className="h-4 w-4" />, label: "H4" },
    { level: 5, headings: h5s, icon: <IconH5 className="h-4 w-4" />, label: "H5" },
    { level: 6, headings: h6s, icon: <IconH6 className="h-4 w-4" />, label: "H6" },
  ];

  const totalHeadings = h1s.length + h2s.length + h3s.length + h4s.length + h5s.length + h6s.length;

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const getH1Status = () => {
    if (h1s.length === 0) return { status: "error", message: "Missing H1" };
    if (h1s.length > 1) return { status: "warning", message: `${h1s.length} H1s (should be 1)` };
    return { status: "success", message: "1 H1" };
  };

  const h1Status = getH1Status();

  const HeadingSummary = () => (
    <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200">
      <div className="flex flex-wrap items-center gap-3">
        {headingGroups.map(({ level, headings, label }) => {
          const isH1 = level === 1;
          const count = headings.length;
          let colorClass = "bg-neutral-100 text-neutral-600";

          if (isH1) {
            if (count === 0) colorClass = "bg-red-100 text-red-600";
            else if (count > 1) colorClass = "bg-orange-100 text-orange-600";
            else colorClass = "bg-green-100 text-green-600";
          } else if (level === 2 && count === 0) {
            colorClass = "bg-orange-100 text-orange-600";
          }

          return (
            <span
              key={level}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}
            >
              {label}: {count}
            </span>
          );
        })}
      </div>
    </div>
  );

  const HeadingLevel = ({ group }: { group: HeadingGroup }) => {
    const { level, headings, icon, label } = group;
    const isExpanded = expandedLevels.has(level);
    const count = headings.length;
    const isH1 = level === 1;

    let statusColor = "text-neutral-500";
    if (isH1) {
      if (count === 0) statusColor = "text-red-600";
      else if (count > 1) statusColor = "text-orange-500";
      else statusColor = "text-green-600";
    } else if (level === 2 && count === 0) {
      statusColor = "text-orange-500";
    }

    return (
      <div className="border-b border-neutral-100 last:border-0">
        <button
          onClick={() => toggleLevel(level)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
          disabled={count === 0}
        >
          <div className="flex items-center gap-2">
            {count > 0 ? (
              isExpanded ? (
                <IconChevronDown className="h-4 w-4 text-neutral-400" />
              ) : (
                <IconChevronRight className="h-4 w-4 text-neutral-400" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-medium text-neutral-900">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${statusColor}`}>
              {count} {count === 1 ? "heading" : "headings"}
            </span>
            {isH1 && (
              count === 1 ? (
                <IconCircleCheck className="h-4 w-4 text-green-600" />
              ) : count === 0 ? (
                <IconAlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <IconAlertCircle className="h-4 w-4 text-orange-500" />
              )
            )}
          </div>
        </button>

        {isExpanded && count > 0 && (
          <div className="pb-3 px-4">
            <ul className="space-y-1 ml-10">
              {headings.map((heading, index) => (
                <li
                  key={index}
                  className="text-sm text-neutral-600 py-1 px-2 bg-neutral-50 rounded"
                >
                  {heading}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <CollapsibleSection
      title="Content Structure"
      badge={
        <span className="text-sm text-neutral-500">
          {totalHeadings} heading{totalHeadings !== 1 ? "s" : ""}
        </span>
      }
    >
      <HeadingSummary />
      <div>
        {headingGroups.map((group) => (
          <HeadingLevel key={group.level} group={group} />
        ))}
      </div>
    </CollapsibleSection>
  );
}
