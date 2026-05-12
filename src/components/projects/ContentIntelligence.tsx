"use client";

import {
  IconBrain,
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { ContentIntelligenceData } from "@/types/content-intelligence";
import ThinContentCard from "@/components/content-intelligence/ThinContentCard";
import MissingMetaCard from "@/components/content-intelligence/MissingMetaCard";
import DuplicatesCard from "@/components/content-intelligence/DuplicatesCard";
import SimilarContentCard from "@/components/content-intelligence/SimilarContentCard";

interface ContentIntelligenceProps {
  data: ContentIntelligenceData;
  projectId: string;
}

export default function ContentIntelligence({
  data,
  projectId,
}: ContentIntelligenceProps) {
  const { summary } = data;

  const hasAnyIssues =
    data.thinContent.length > 0 ||
    data.missingMetaDescriptions.length > 0 ||
    data.missingTitles.length > 0 ||
    data.duplicateTitles.length > 0 ||
    data.duplicateDescriptions.length > 0 ||
    data.similarContent.length > 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconBrain className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Content Intelligence
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Analyze content quality across your site
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            {summary.critical > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)] rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{summary.critical} Critical</span>
              </div>
            )}
            {summary.warnings > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[#f9731620] text-[var(--color-severity-high)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{summary.warnings} Warnings</span>
              </div>
            )}
            {!hasAnyIssues && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>All Clear</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasAnyIssues ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thin Content */}
            <ThinContentCard pages={data.thinContent} projectId={projectId} />

            {/* Missing Metadata */}
            <MissingMetaCard
              missingDescriptions={data.missingMetaDescriptions}
              missingTitles={data.missingTitles}
              projectId={projectId}
            />

            {/* Duplicates */}
            <DuplicatesCard
              duplicateTitles={data.duplicateTitles}
              duplicateDescriptions={data.duplicateDescriptions}
              projectId={projectId}
            />

            {/* Similar Content */}
            <SimilarContentCard groups={data.similarContent} projectId={projectId} />
          </div>
        ) : (
          <div className="text-center py-8">
            <IconCircleCheck className="h-12 w-12 mx-auto text-[var(--color-score-good)] mb-3" />
            <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
              Content Quality Looks Good!
            </h4>
            <p className="text-[var(--color-text-secondary)]">
              No content issues detected. All pages have sufficient content, unique
              titles, and meta descriptions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
