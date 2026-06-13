"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { IconChevronDown, IconArrowRight } from "@tabler/icons-react";
import ScoreRing from "./ScoreRing";

interface ActionableItem {
  type: "critical" | "warning" | "info";
  text: string;
  detail?: string;
  href?: string;
}

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  items: ActionableItem[];
  maxCollapsedItems?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

const ITEM_STYLES = {
  critical: "text-[var(--color-severity-critical)]",
  warning: "text-[var(--color-severity-medium)]",
  info: "text-[var(--color-text-secondary)]",
};

const ITEM_DOT = {
  critical: "bg-[var(--color-severity-critical)]",
  warning: "bg-[var(--color-severity-medium)]",
  info: "bg-[var(--color-primary)]",
};

export default function CategoryCard({
  title,
  icon,
  score,
  items,
  maxCollapsedItems = 3,
  viewAllHref,
  viewAllLabel = "View All",
  children,
  className,
}: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, maxCollapsedItems);
  const hasMore = items.length > maxCollapsedItems;

  return (
    <div className={clsx("glass-card overflow-hidden", className)}>
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <ScoreRing score={score} size="sm" showLabel={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)]">{icon}</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {score >= 80
              ? "Looking good"
              : score >= 60
                ? "Room for improvement"
                : "Needs attention"}
          </p>
        </div>
      </div>

      {/* Actionable Items */}
      {items.length > 0 && (
        <div className="px-5 pb-3">
          <div className="space-y-1.5">
            {visibleItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span
                  className={clsx(
                    "flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5",
                    ITEM_DOT[item.type],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={clsx("text-xs", ITEM_STYLES[item.type])}>
                    {item.text}
                  </p>
                  {item.detail && (
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mt-2 transition-colors"
            >
              +{items.length - maxCollapsedItems} more
              <IconChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Optional extra content */}
      {children && <div className="px-5 pb-4">{children}</div>}

      {/* View All link */}
      {viewAllHref && (
        <a
          href={viewAllHref}
          className="flex items-center justify-center gap-1 py-3 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] border-t border-[var(--color-border-subtle)] transition-colors"
        >
          {viewAllLabel}
          <IconArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
