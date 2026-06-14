"use client";

import Link from "next/link";
import {
  IconNetwork,
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconMap,
} from "@tabler/icons-react";
import { SiteArchitectureData } from "@/types/site-architecture";
import DepthDistributionCard from "@/components/site-architecture/DepthDistributionCard";
import OrphanPagesCard from "@/components/site-architecture/OrphanPagesCard";
import DeepPagesCard from "@/components/site-architecture/DeepPagesCard";
import InternalLinkingCard from "@/components/site-architecture/InternalLinkingCard";

interface SiteArchitectureProps {
  data: SiteArchitectureData;
  projectId: string;
}

export default function SiteArchitecture({
  data,
  projectId,
}: SiteArchitectureProps) {
  const { summary } = data;

  const hasAnyIssues =
    data.orphanPages.length > 0 || data.deepPages.length > 0;

  const criticalCount = data.orphanPages.length;
  const warningCount = data.deepPages.length;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconNetwork className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Site Architecture
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {summary.totalPages} pages | Avg depth: {summary.avgDepth} | Max
                depth: {summary.maxDepth}
              </p>
            </div>
          </div>

          {/* Actions + Summary badges */}
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${projectId}/sitemap`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-muted)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              <IconMap className="h-4 w-4" />
              View Site Map
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)] rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{criticalCount} Orphan</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-severity-high)]/10 text-[var(--color-severity-high)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{warningCount} Deep</span>
              </div>
            )}
            {!hasAnyIssues && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>Good Structure</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Depth Distribution */}
          <DepthDistributionCard
            distribution={data.depthDistribution}
            projectId={projectId}
          />

          {/* Orphan Pages */}
          <OrphanPagesCard pages={data.orphanPages} projectId={projectId} />

          {/* Deep Pages */}
          <DeepPagesCard pages={data.deepPages} projectId={projectId} />
        </div>

        {/* Internal Linking — full width: understanding the site's link graph
            is high-value and benefits from the extra horizontal room. */}
        <InternalLinkingCard
          mostLinked={data.pagesWithMostLinks}
          leastLinked={data.pagesWithFewestLinks}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
