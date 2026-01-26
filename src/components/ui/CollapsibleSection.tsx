"use client";

import { useState, ReactNode } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  badge,
  headerContent,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {headerContent}
          {isOpen ? (
            <IconChevronUp className="h-5 w-5 text-neutral-500" />
          ) : (
            <IconChevronDown className="h-5 w-5 text-neutral-500" />
          )}
        </div>
      </button>
      {isOpen && <div className="animate-in fade-in duration-200">{children}</div>}
    </div>
  );
}
