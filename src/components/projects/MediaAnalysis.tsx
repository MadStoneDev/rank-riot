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

interface MediaAnalysisProps {
  data: MediaAnalysisData;
  projectId: string;
}

export default function MediaAnalysis({
  data,
  projectId,
}: MediaAnalysisProps) {
  const { summary } = data;

  const hasAnyIssues = data.imagesMissingAlt > 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconPhoto className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">
                Media Analysis
              </h3>
              <p className="text-sm text-neutral-500">
                {data.totalImages} images across {data.pagesWithMostImages.length} pages
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            {summary.critical > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{summary.critical} Critical</span>
              </div>
            )}
            {summary.warnings > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{summary.warnings} Warnings</span>
              </div>
            )}
            {!hasAnyIssues && data.totalImages > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>All Accessible</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data.totalImages > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Overview */}
            <ImageOverviewCard
              totalImages={data.totalImages}
              imagesWithAlt={data.imagesWithAlt}
              imagesMissingAlt={data.imagesMissingAlt}
              altCoveragePercent={data.altCoveragePercent}
            />

            {/* Missing Alt Text */}
            <MissingAltCard
              pages={data.pagesWithMissingAlt}
              projectId={projectId}
            />

            {/* Image Heavy Pages */}
            <ImageHeavyPagesCard
              pages={data.pagesWithMostImages}
              projectId={projectId}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <IconPhoto className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
            <h4 className="text-lg font-medium text-neutral-900 mb-1">
              No Images Found
            </h4>
            <p className="text-neutral-500">
              No images were detected during the crawl
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
