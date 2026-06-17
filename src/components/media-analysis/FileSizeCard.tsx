import {
  IconFileText,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { ImageFileSizeStats } from "@/types/media-analysis";

const SCORE_COLORS = {
  good: "var(--color-score-good)",
  warning: "var(--color-score-warning)",
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileSizeCard({ stats }: { stats?: ImageFileSizeStats }) {
  // No byte sizes recorded (e.g. crawl predates file-size capture).
  if (!stats || stats.sizedCount === 0) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <IconFileText className="h-5 w-5 text-[var(--color-text-muted)]" />
            <span className="font-medium text-[var(--color-text-primary)]">Image File Sizes</span>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Image weight &amp; format optimisation
          </p>
        </div>
        <div className="p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            No image file sizes were recorded for this scan. Re-scan to capture
            image weights.
          </p>
        </div>
      </div>
    );
  }

  const hasLarge = stats.largeCount > 0;
  const statusColor = hasLarge ? SCORE_COLORS.warning : SCORE_COLORS.good;
  const StatusIcon = hasLarge ? IconAlertTriangle : IconCircleCheck;
  const avgBytes = Math.round(stats.totalBytes / stats.sizedCount);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <IconFileText className="h-5 w-5" style={{ color: statusColor }} />
          <span className="font-medium text-[var(--color-text-primary)]">Image File Sizes</span>
          <StatusIcon className="h-4 w-4 ml-auto" style={{ color: statusColor }} />
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Image weight &amp; format optimisation
        </p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--color-surface-overlay)] p-3">
            <p className="text-xs text-[var(--color-text-muted)]">Total weight</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {formatBytes(stats.totalBytes)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {formatBytes(avgBytes)} avg
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface-overlay)] p-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Large ({Math.round(stats.largeThresholdBytes / 1024)} KB+)
            </p>
            <p className="text-lg font-semibold" style={{ color: statusColor }}>
              {stats.largeCount}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              of {stats.sizedCount} sized
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">Next-gen formats (WebP/AVIF)</span>
          <span
            className="font-medium"
            style={{ color: stats.nextGenPercent >= 50 ? SCORE_COLORS.good : SCORE_COLORS.warning }}
          >
            {stats.nextGenPercent}%
          </span>
        </div>

        {stats.formatCounts.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 font-medium">
              Formats
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stats.formatCounts.map(({ format, count }) => (
                <span
                  key={format}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-surface-overlay)] text-xs text-[var(--color-text-secondary)]"
                >
                  <span className="uppercase">{format}</span>
                  <span className="text-[var(--color-text-muted)]">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
