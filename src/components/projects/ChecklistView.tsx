"use client";

import { useState, useMemo } from "react";
import {
  IconCircleCheck,
  IconCircleX,
  IconAlertTriangle,
  IconCircle,
  IconChevronDown,
  IconChevronRight,
  IconListCheck,
  IconServer,
  IconFileSearch,
  IconArticle,
  IconLink,
  IconPhoto,
  IconCode,
  IconBrain,
  IconGlobe,
  IconFilter,
} from "@tabler/icons-react";
import {
  type ChecklistScanData,
  type ChecklistCategory,
  type EvaluatedItem,
  type CheckStatus,
  CHECKLIST_ITEMS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  evaluateChecklist,
  getCategoryScore,
  getOverallScore,
} from "@/utils/checklist";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChecklistViewProps {
  scanData: ChecklistScanData;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type FilterMode = "all" | "failing" | "passing";

const STATUS_ORDER: Record<CheckStatus, number> = {
  fail: 0,
  warning: 1,
  not_checked: 2,
  pass: 3,
};

const CATEGORY_ICONS: Record<ChecklistCategory, React.ReactNode> = {
  technical_seo: <IconServer className="h-5 w-5" />,
  on_page_seo: <IconFileSearch className="h-5 w-5" />,
  content: <IconArticle className="h-5 w-5" />,
  links: <IconLink className="h-5 w-5" />,
  media: <IconPhoto className="h-5 w-5" />,
  schema_structured_data: <IconCode className="h-5 w-5" />,
  aeo_readiness: <IconBrain className="h-5 w-5" />,
  geo_readiness: <IconGlobe className="h-5 w-5" />,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case "pass":
      return <IconCircleCheck className="h-5 w-5 shrink-0 text-[var(--color-score-good)]" />;
    case "fail":
      return <IconCircleX className="h-5 w-5 shrink-0 text-[var(--color-score-critical)]" />;
    case "warning":
      return <IconAlertTriangle className="h-5 w-5 shrink-0 text-[var(--color-score-warning)]" />;
    default:
      return <IconCircle className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" />;
  }
}

function ImportanceBadge({ importance }: { importance: "critical" | "recommended" | "nice_to_have" }) {
  switch (importance) {
    case "critical":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color-mix(in_srgb,var(--color-score-critical)_15%,transparent)] text-[var(--color-score-critical)]">
          Critical
        </span>
      );
    case "recommended":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)]">
          Recommended
        </span>
      );
    case "nice_to_have":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
          Nice to Have
        </span>
      );
  }
}

function ProgressBar({ percent }: { percent: number }) {
  const color =
    percent >= 80
      ? "var(--color-score-good)"
      : percent >= 50
        ? "var(--color-score-warning)"
        : "var(--color-score-critical)";

  return (
    <div className="w-full h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function ChecklistItemRow({ item }: { item: EvaluatedItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[var(--color-border-subtle)] last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
      >
        <StatusIcon status={item.status} />
        <span className="flex-1 text-sm text-[var(--color-text-primary)]">
          {item.label}
        </span>
        <ImportanceBadge importance={item.importance} />
        <IconChevronDown
          className={`h-4 w-4 text-[var(--color-text-muted)] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-12">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
}

function CategoryAccordion({
  category,
  items,
}: {
  category: ChecklistCategory;
  items: EvaluatedItem[];
}) {
  const [open, setOpen] = useState(true);
  const score = getCategoryScore(items, category);
  const sortedItems = [...items].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  const scoreColor =
    score.percent >= 80
      ? "var(--color-score-good)"
      : score.percent >= 50
        ? "var(--color-score-warning)"
        : "var(--color-score-critical)";

  return (
    <div className="bg-[var(--color-surface-overlay)] rounded-xl overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
      >
        {open ? (
          <IconChevronDown className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
        ) : (
          <IconChevronRight className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
        )}
        <span className="text-[var(--color-primary)]">
          {CATEGORY_ICONS[category]}
        </span>
        <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)] text-left">
          {CATEGORY_LABELS[category]}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: scoreColor }}
        >
          {score.total > 0
            ? `${score.passed}/${score.total} passed`
            : "No data"}
        </span>
      </button>

      {/* Category progress bar */}
      {score.total > 0 && (
        <div className="px-5 pb-1">
          <ProgressBar percent={score.percent} />
        </div>
      )}

      {/* Item list */}
      {open && (
        <div className="mx-3 mb-3 mt-2 rounded-lg border border-[var(--color-border-subtle)] overflow-hidden">
          {sortedItems.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
          {sortedItems.length === 0 && (
            <p className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
              No items match the current filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChecklistView({ scanData }: ChecklistViewProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const evaluated = useMemo(
    () => evaluateChecklist(CHECKLIST_ITEMS, scanData),
    [scanData],
  );

  const overall = useMemo(() => getOverallScore(evaluated), [evaluated]);

  // Apply filter
  const filtered = useMemo(() => {
    if (filter === "all") return evaluated;
    if (filter === "failing")
      return evaluated.filter(
        (i) => i.status === "fail" || i.status === "warning",
      );
    return evaluated.filter((i) => i.status === "pass");
  }, [evaluated, filter]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<ChecklistCategory, EvaluatedItem[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((i) => i.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  const overallColor =
    overall.percent >= 80
      ? "var(--color-score-good)"
      : overall.percent >= 50
        ? "var(--color-score-warning)"
        : "var(--color-score-critical)";

  const failCount = evaluated.filter((i) => i.status === "fail").length;
  const warnCount = evaluated.filter((i) => i.status === "warning").length;

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconListCheck className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                SEO Checklist
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {overall.passed}/{overall.total} checks passed ({overall.percent}%)
              </p>
            </div>
          </div>

          {/* Fail/warn counters */}
          <div className="flex items-center gap-3">
            {failCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[color-mix(in_srgb,var(--color-score-critical)_15%,transparent)] text-[var(--color-score-critical)] rounded-full text-sm font-medium">
                <IconCircleX className="h-4 w-4" />
                <span>{failCount} failing</span>
              </div>
            )}
            {warnCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[color-mix(in_srgb,var(--color-score-warning)_15%,transparent)] text-[var(--color-score-warning)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{warnCount} warnings</span>
              </div>
            )}
            {failCount === 0 && warnCount === 0 && overall.total > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[color-mix(in_srgb,var(--color-score-good)_15%,transparent)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>All passing</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <ProgressBar percent={overall.percent} />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-[var(--color-text-muted)]">0%</span>
            <span
              className="text-xs font-bold"
              style={{ color: overallColor }}
            >
              {overall.percent}%
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">100%</span>
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
        <IconFilter className="h-4 w-4 text-[var(--color-text-muted)]" />
        {(["all", "failing", "passing"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === mode
                ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {mode === "all"
              ? "All"
              : mode === "failing"
                ? "Failing"
                : "Passing"}
          </button>
        ))}
      </div>

      {/* ── Category list ──────────────────────────────────────────── */}
      <div className="p-6 space-y-4">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat);
          if (!items) return null;
          return (
            <CategoryAccordion
              key={cat}
              category={cat}
              items={items}
            />
          );
        })}

        {grouped.size === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconListCheck className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              No checklist items match the current filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
