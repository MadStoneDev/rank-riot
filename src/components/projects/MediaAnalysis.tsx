"use client";

import {
  IconPhoto,
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { MediaAnalysisData } from "@/types/media-analysis";
import ImageOverviewCard from "@/components/media-analysis/ImageOverviewCard";
import MissingAltCard from "@/components/media-analysis/MissingAltCard";
import ImageHeavyPagesCard from "@/components/media-analysis/ImageHeavyPagesCard";
import FileSizeCard from "@/components/media-analysis/FileSizeCard";

interface MediaAnalysisProps {
  data: MediaAnalysisData;
  projectId: string;
  children?: React.ReactNode;
}

export default function MediaAnalysis({
  data,
  projectId,
  children,
}: MediaAnalysisProps) {
  const { summary } = data;

  const hasAnyIssues = data.imagesMissingAlt > 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconPhoto className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Media Analysis
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {data.totalImages} images across {data.pagesWithMostImages.length} pages
              </p>
            </div>
          </div>

          {/* Summary badges + children link */}
          <div className="flex items-center gap-3">
            {children}
            {summary.critical > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)] rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{summary.critical} Critical</span>
              </div>
            )}
            {summary.warnings > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-severity-high)]/10 text-[var(--color-severity-high)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{summary.warnings} Warnings</span>
              </div>
            )}
            {!hasAnyIssues && data.totalImages > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>All Accessible</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {data.totalImages > 0 ? (
          <>
            {/* Overview cards: alt-text (accessibility) + file size (performance) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImageOverviewCard
                totalImages={data.totalImages}
                imagesWithAlt={data.imagesWithAlt}
                imagesMissingAlt={data.imagesMissingAlt}
                altCoveragePercent={data.altCoveragePercent}
              />
              <FileSizeCard stats={data.fileSizeStats} />
            </div>

            {/* Missing Alt Text — full width list. */}
            <MissingAltCard
              pages={data.pagesWithMissingAlt}
              projectId={projectId}
            />

            {/* Image Heavy Pages — full width for the page list + bars. */}
            <ImageHeavyPagesCard
              pages={data.pagesWithMostImages}
              projectId={projectId}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <IconPhoto className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-3" />
            <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
              No Images Found
            </h4>
            <p className="text-[var(--color-text-secondary)]">
              No images were detected during the crawl
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
