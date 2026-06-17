"use client";

import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

export type ImageViewMode = "grid" | "list";

/** Small grid <-> list switch, shared by the page-detail and image-audit views. */
export default function ViewToggle({
  mode,
  onChange,
}: {
  mode: ImageViewMode;
  onChange: (mode: ImageViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-[var(--color-surface-overlay)] p-0.5">
      <button
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={mode === "grid"}
        className={`grid place-content-center h-7 w-7 rounded transition-colors ${
          mode === "grid"
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <IconLayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={mode === "list"}
        className={`grid place-content-center h-7 w-7 rounded transition-colors ${
          mode === "list"
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <IconLayoutList className="h-4 w-4" />
      </button>
    </div>
  );
}
