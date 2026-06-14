"use client";

import {
  IconPhoto,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
} from "@tabler/icons-react";

interface ImageOverviewCardProps {
  totalImages: number;
  imagesWithAlt: number;
  imagesMissingAlt: number;
  altCoveragePercent: number;
}

export default function ImageOverviewCard({
  totalImages,
  imagesWithAlt,
  imagesMissingAlt,
  altCoveragePercent,
}: ImageOverviewCardProps) {
  if (totalImages === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <IconPhoto className="h-5 w-5" />
          <span className="font-medium">No Images Found</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          No images detected on crawled pages
        </p>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (altCoveragePercent >= 90) return {
      color: "var(--color-score-good)",
      mutedBg: "var(--color-score-good-muted)",
      Icon: IconCircleCheck,
    };
    if (altCoveragePercent >= 70) return {
      color: "var(--color-score-warning)",
      mutedBg: "var(--color-score-warning-muted)",
      Icon: IconAlertTriangle,
    };
    return {
      color: "var(--color-score-critical)",
      mutedBg: "var(--color-score-critical-muted)",
      Icon: IconAlertCircle,
    };
  };

  const config = getStatusConfig();

  return (
    <div className="glass-card overflow-hidden" style={{ borderColor: `${config.color}33` }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: config.mutedBg, borderColor: `${config.color}33` }}>
        <div className="flex items-center gap-2">
          <IconPhoto className="h-5 w-5" style={{ color: config.color }} />
          <span className="font-medium" style={{ color: config.color }}>Alt Text Overview</span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Alt text accessibility analysis
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{totalImages}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Total Images</p>
          </div>
          <div className="flex items-center gap-2">
            <config.Icon className="h-8 w-8" style={{ color: config.color }} />
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: config.color }}>
                {altCoveragePercent}%
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Alt Coverage</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full h-3 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${altCoveragePercent}%`, backgroundColor: config.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[var(--color-score-good-muted)] rounded-lg">
            <p className="text-xl font-bold text-[var(--color-score-good)]">{imagesWithAlt}</p>
            <p className="text-xs text-[var(--color-score-good)]">With Alt Text</p>
          </div>
          <div className="text-center p-3 bg-[var(--color-score-critical-muted)] rounded-lg">
            <p className="text-xl font-bold text-[var(--color-score-critical)]">{imagesMissingAlt}</p>
            <p className="text-xs text-[var(--color-score-critical)]">Missing Alt Text</p>
          </div>
        </div>
      </div>
    </div>
  );
}
