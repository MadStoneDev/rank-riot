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
    <div className={`glass-card overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {headerContent}
          {isOpen ? (
            <IconChevronUp className="h-5 w-5 text-[var(--color-text-muted)]" />
          ) : (
            <IconChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
          )}
        </div>
      </button>
      {isOpen && <div className="animate-in fade-in duration-200">{children}</div>}
    </div>
  );
}
